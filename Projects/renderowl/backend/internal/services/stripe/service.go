package stripe

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/google/uuid"
	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/checkout/session"
	"github.com/stripe/stripe-go/v76/webhook"
	"gorm.io/gorm"

	"renderowl/internal/models"
)

type Service struct {
	secretKey     string
	webhookSecret string
	defaultPriceID string
}

func NewService(secretKey, webhookSecret, defaultPriceID string) *Service {
	stripe.Key = secretKey
	return &Service{
		secretKey:     secretKey,
		webhookSecret: webhookSecret,
		defaultPriceID: defaultPriceID,
	}
}

type CreateCheckoutSessionRequest struct {
	UserID    uuid.UUID `json:"user_id"`
	PackageID uuid.UUID `json:"package_id"`
	SuccessURL string   `json:"success_url"`
	CancelURL  string   `json:"cancel_url"`
}

type CreateCheckoutSessionResponse struct {
	SessionID string `json:"session_id"`
	URL       string `json:"url"`
}

func (s *Service) CreateCheckoutSession(db *gorm.DB, req CreateCheckoutSessionRequest) (*CreateCheckoutSessionResponse, error) {
	var pkg models.CreditPackage
	if err := db.Where("id = ? AND is_active = true", req.PackageID).First(&pkg).Error; err != nil {
		return nil, fmt.Errorf("credit package not found: %w", err)
	}

	var user models.User
	if err := db.Where("id = ?", req.UserID).First(&user).Error; err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	metadata := map[string]string{
		"user_id":    user.ID.String(),
		"package_id": pkg.ID.String(),
		"credits":    fmt.Sprintf("%d", pkg.Credits),
	}

	priceID := pkg.StripePriceID
	if priceID == "" {
		priceID = s.defaultPriceID
	}

	params := &stripe.CheckoutSessionParams{
		Mode:       stripe.String(string(stripe.CheckoutSessionModePayment)),
		SuccessURL: stripe.String(req.SuccessURL + "?session_id={CHECKOUT_SESSION_ID}"),
		CancelURL:  stripe.String(req.CancelURL),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				Price:    stripe.String(priceID),
				Quantity: stripe.Int64(1),
			},
		},
		Metadata:               metadata,
		ClientReferenceID:      stripe.String(user.ID.String()),
		AllowPromotionCodes:    stripe.Bool(true),
		BillingAddressCollection: stripe.String("required"),
	}

	sess, err := session.New(params)
	if err != nil {
		return nil, fmt.Errorf("failed to create checkout session: %w", err)
	}

	return &CreateCheckoutSessionResponse{
		SessionID: sess.ID,
		URL:       sess.URL,
	}, nil
}

func (s *Service) VerifyWebhook(payload []byte, signature string) (*stripe.Event, error) {
	event, err := webhook.ConstructEvent(payload, signature, s.webhookSecret)
	if err != nil {
		return nil, fmt.Errorf("webhook verification failed: %w", err)
	}
	return &event, nil
}

func (s *Service) HandleWebhookEvent(ctx context.Context, db *gorm.DB, event *stripe.Event) error {
	var existing models.StripeWebhookEvent
	if err := db.Where("stripe_event_id = ?", event.ID).First(&existing).Error; err == nil {
		log.Printf("Webhook event %s already processed, skipping", event.ID)
		return nil
	}

	payload, err := json.Marshal(event)
	if err != nil {
		return fmt.Errorf("failed to marshal event: %w", err)
	}

	webhookRecord := models.StripeWebhookEvent{
		StripeEventID: event.ID,
		Type:          string(event.Type),
		Payload:       models.JSON{"raw": string(payload)},
		Processed:     false,
	}

	if err := db.Create(&webhookRecord).Error; err != nil {
		return fmt.Errorf("failed to create webhook record: %w", err)
	}

	switch event.Type {
	case "checkout.session.completed":
		return s.handleCheckoutSessionCompleted(ctx, db, event, &webhookRecord)
	case "checkout.session.expired":
		return s.handleCheckoutSessionExpired(ctx, db, event, &webhookRecord)
	case "charge.refunded":
		return s.handleChargeRefunded(ctx, db, event, &webhookRecord)
	case "payment_intent.payment_failed":
		return s.handlePaymentFailed(ctx, db, event, &webhookRecord)
	case "charge.dispute.created":
		return s.handleDisputeCreated(ctx, db, event, &webhookRecord)
	default:
		log.Printf("Unhandled webhook event type: %s", event.Type)
	}

	now := event.Created
	webhookRecord.Processed = true
	webhookRecord.ProcessedAt = &now
	return db.Save(&webhookRecord).Error
}

func (s *Service) handleCheckoutSessionCompleted(ctx context.Context, db *gorm.DB, event *stripe.Event, record *models.StripeWebhookEvent) error {
	var session stripe.CheckoutSession
	if err := json.Unmarshal(event.Data.Raw, &session); err != nil {
		record.ErrorMessage = fmt.Sprintf("failed to unmarshal session: %v", err)
		db.Save(record)
		return err
	}

	if session.PaymentStatus != stripe.CheckoutSessionPaymentStatusPaid {
		log.Printf("Checkout session %s not paid yet, status: %s", session.ID, session.PaymentStatus)
		record.ErrorMessage = fmt.Sprintf("payment not completed, status: %s", session.PaymentStatus)
		db.Save(record)
		return nil
	}

	userIDStr, ok := session.Metadata["user_id"]
	if !ok {
		record.ErrorMessage = "missing user_id in metadata"
		db.Save(record)
		return fmt.Errorf("missing user_id in session metadata")
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		record.ErrorMessage = fmt.Sprintf("invalid user_id: %v", err)
		db.Save(record)
		return err
	}

	creditsStr, ok := session.Metadata["credits"]
	if !ok {
		record.ErrorMessage = "missing credits in metadata"
		db.Save(record)
		return fmt.Errorf("missing credits in session metadata")
	}

	var credits int64
	fmt.Sscanf(creditsStr, "%d", &credits)

	return db.Transaction(func(tx *gorm.DB) error {
		var user models.User
		if err := tx.Set("LOCK IN SHARE MODE").Where("id = ?", userID).First(&user).Error; err != nil {
			return fmt.Errorf("user not found: %w", err)
		}

		var existingPayment models.PaymentIntent
		if err := tx.Where("stripe_payment_id = ?", session.ID).First(&existingPayment).Error; err == nil {
			log.Printf("Payment for session %s already processed", session.ID)
			return nil
		}

		payment := models.PaymentIntent{
			UserID:          userID,
			StripePaymentID: session.ID,
			StripeIntentID:  session.PaymentIntent.ID,
			AmountCents:     session.AmountTotal,
			Currency:        string(session.Currency),
			Credits:         credits,
			Status:          models.PaymentStatusCompleted,
			Metadata: models.JSON{
				"checkout_session_id": session.ID,
				"customer_id":         session.Customer.ID,
				"payment_intent":      session.PaymentIntent.ID,
			},
		}

		if err := tx.Create(&payment).Error; err != nil {
			return fmt.Errorf("failed to create payment record: %w", err)
		}

		newBalance := user.Credits + credits
		creditTx := models.CreditTx{
			UserID:      userID,
			Type:        models.CreditTxTypePurchase,
			Amount:      credits,
			Balance:     newBalance,
			Description: fmt.Sprintf("Purchased %d credits via Stripe", credits),
			PaymentID:   &payment.ID,
			Metadata: models.JSON{
				"stripe_session_id": session.ID,
				"amount_cents":      session.AmountTotal,
			},
		}

		if err := tx.Create(&creditTx).Error; err != nil {
			return fmt.Errorf("failed to create credit transaction: %w", err)
		}

		if err := tx.Model(&user).Update("credits", newBalance).Error; err != nil {
			return fmt.Errorf("failed to update user credits: %w", err)
		}

		now := event.Created
		record.Processed = true
		record.ProcessedAt = &now
		if err := tx.Save(record).Error; err != nil {
			return fmt.Errorf("failed to update webhook record: %w", err)
		}

		log.Printf("Successfully processed payment for user %s, added %d credits", userID, credits)
		return nil
	})
}

func (s *Service) handleCheckoutSessionExpired(ctx context.Context, db *gorm.DB, event *stripe.Event, record *models.StripeWebhookEvent) error {
	var session stripe.CheckoutSession
	if err := json.Unmarshal(event.Data.Raw, &session); err != nil {
		record.ErrorMessage = fmt.Sprintf("failed to unmarshal session: %v", err)
		db.Save(record)
		return err
	}

	payment := models.PaymentIntent{
		UserID:          uuid.MustParse(session.Metadata["user_id"]),
		StripePaymentID: session.ID,
		AmountCents:     0,
		Credits:         0,
		Status:          models.PaymentStatusFailed,
		FailureMessage:  "Checkout session expired",
	}

	if err := db.Create(&payment).Error; err != nil {
		return fmt.Errorf("failed to create expired payment record: %w", err)
	}

	now := event.Created
	record.Processed = true
	record.ProcessedAt = &now
	return db.Save(record).Error
}

func (s *Service) handleChargeRefunded(ctx context.Context, db *gorm.DB, event *stripe.Event, record *models.StripeWebhookEvent) error {
	var charge stripe.Charge
	if err := json.Unmarshal(event.Data.Raw, &charge); err != nil {
		record.ErrorMessage = fmt.Sprintf("failed to unmarshal charge: %v", err)
		db.Save(record)
		return err
	}

	return db.Transaction(func(tx *gorm.DB) error {
		var payment models.PaymentIntent
		if err := tx.Where("stripe_intent_id = ?", charge.PaymentIntent.ID).First(&payment).Error; err != nil {
			return fmt.Errorf("payment intent not found: %w", err)
		}

		if payment.Status == models.PaymentStatusRefunded {
			log.Printf("Payment %s already refunded", payment.ID)
			return nil
		}

		creditsToRefund := payment.Credits
		if !charge.Refunded {
			creditsToRefund = payment.Credits * charge.AmountRefunded / payment.AmountCents
		}

		var user models.User
		if err := tx.Where("id = ?", payment.UserID).First(&user).Error; err != nil {
			return fmt.Errorf("user not found: %w", err)
		}

		newBalance := user.Credits - creditsToRefund
		if newBalance < 0 {
			newBalance = 0
			creditsToRefund = user.Credits
		}

		creditTx := models.CreditTx{
			UserID:      payment.UserID,
			Type:        models.CreditTxTypeRefund,
			Amount:      -creditsToRefund,
			Balance:     newBalance,
			Description: fmt.Sprintf("Refunded %d credits (Stripe refund)", creditsToRefund),
			PaymentID:   &payment.ID,
			Metadata: models.JSON{
				"stripe_charge_id":   charge.ID,
				"refund_amount":      charge.AmountRefunded,
				"original_credits":   payment.Credits,
				"refunded_credits":   creditsToRefund,
			},
		}

		if err := tx.Create(&creditTx).Error; err != nil {
			return fmt.Errorf("failed to create refund credit transaction: %w", err)
		}

		if err := tx.Model(&user).Update("credits", newBalance).Error; err != nil {
			return fmt.Errorf("failed to update user credits: %w", err)
		}

		refundTime := event.Created
		if err := tx.Model(&payment).Updates(map[string]interface{}{
			"status":        models.PaymentStatusRefunded,
			"refunded_at":   &refundTime,
			"refund_amount": charge.AmountRefunded,
		}).Error; err != nil {
			return fmt.Errorf("failed to update payment status: %w", err)
		}

		now := event.Created
		record.Processed = true
		record.ProcessedAt = &now
		return tx.Save(record).Error
	})
}

func (s *Service) handlePaymentFailed(ctx context.Context, db *gorm.DB, event *stripe.Event, record *models.StripeWebhookEvent) error {
	var intent stripe.PaymentIntent
	if err := json.Unmarshal(event.Data.Raw, &intent); err != nil {
		record.ErrorMessage = fmt.Sprintf("failed to unmarshal intent: %v", err)
		db.Save(record)
		return err
	}

	var payment models.PaymentIntent
	if err := db.Where("stripe_intent_id = ?", intent.ID).First(&payment).Error; err == nil {
		db.Model(&payment).Updates(map[string]interface{}{
			"status":          models.PaymentStatusFailed,
			"failure_message": intent.LastPaymentError.Message,
		})
	}

	now := event.Created
	record.Processed = true
	record.ProcessedAt = &now
	return db.Save(record).Error
}

func (s *Service) handleDisputeCreated(ctx context.Context, db *gorm.DB, event *stripe.Event, record *models.StripeWebhookEvent) error {
	var dispute stripe.Dispute
	if err := json.Unmarshal(event.Data.Raw, &dispute); err != nil {
		record.ErrorMessage = fmt.Sprintf("failed to unmarshal dispute: %v", err)
		db.Save(record)
		return err
	}

	return db.Transaction(func(tx *gorm.DB) error {
		var payment models.PaymentIntent
		if err := tx.Where("stripe_payment_id = ?", dispute.Charge.ID).First(&payment).Error; err != nil {
			return fmt.Errorf("payment not found: %w", err)
		}

		if err := tx.Model(&payment).Update("status", models.PaymentStatusDisputed).Error; err != nil {
			return fmt.Errorf("failed to update payment status: %w", err)
		}

		creditTx := models.CreditTx{
			UserID:      payment.UserID,
			Type:        models.CreditTxTypeAdjustment,
			Amount:      -payment.Credits,
			Description: fmt.Sprintf("Credits frozen due to payment dispute"),
			PaymentID:   &payment.ID,
			Metadata: models.JSON{
				"dispute_id":    dispute.ID,
				"reason":        dispute.Reason,
				"status":        dispute.Status,
			},
		}

		if err := tx.Create(&creditTx).Error; err != nil {
			return fmt.Errorf("failed to create dispute credit transaction: %w", err)
		}

		now := event.Created
		record.Processed = true
		record.ProcessedAt = &now
		return tx.Save(record).Error
	})
}
