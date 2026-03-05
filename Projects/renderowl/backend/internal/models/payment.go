package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PaymentStatus string

const (
	PaymentStatusPending    PaymentStatus = "pending"
	PaymentStatusProcessing PaymentStatus = "processing"
	PaymentStatusCompleted  PaymentStatus = "completed"
	PaymentStatusFailed     PaymentStatus = "failed"
	PaymentStatusRefunded   PaymentStatus = "refunded"
	PaymentStatusDisputed   PaymentStatus = "disputed"
)

type PaymentIntent struct {
	ID              uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID          uuid.UUID      `json:"user_id" gorm:"type:uuid;not null;index:idx_payment_user"`
	StripePaymentID string         `json:"stripe_payment_id" gorm:"uniqueIndex"`
	StripeIntentID  string         `json:"stripe_intent_id" gorm:"index"`
	AmountCents     int64          `json:"amount_cents"`
	Currency        string         `json:"currency" gorm:"default:USD"`
	Credits         int64          `json:"credits"`
	Status          PaymentStatus  `json:"status" gorm:"default:pending;index:idx_payment_status"`
	FailureMessage  string         `json:"failure_message"`
	RefundedAt      *time.Time     `json:"refunded_at"`
	RefundAmount    int64          `json:"refund_amount"`
	Metadata        JSON           `json:"metadata" gorm:"type:jsonb"`
	CreatedAt       time.Time      `json:"created_at" gorm:"index:idx_payment_user"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `json:"-" gorm:"index"`

	User         User       `json:"user,omitempty" gorm:"foreignKey:UserID"`
	CreditTxs    []CreditTx `json:"credit_transactions,omitempty" gorm:"foreignKey:PaymentID"`
}

func (pi *PaymentIntent) BeforeCreate(tx *gorm.DB) error {
	if pi.ID == uuid.Nil {
		pi.ID = uuid.New()
	}
	return nil
}

type StripeWebhookEvent struct {
	ID              uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	StripeEventID   string         `json:"stripe_event_id" gorm:"uniqueIndex"`
	Type            string         `json:"type" gorm:"index"`
	Payload         JSON           `json:"payload" gorm:"type:jsonb"`
	Processed       bool           `json:"processed" gorm:"default:false;index"`
	ProcessedAt     *time.Time     `json:"processed_at"`
	ErrorMessage    string         `json:"error_message"`
	CreatedAt       time.Time      `json:"created_at"`
	DeletedAt       gorm.DeletedAt `json:"-" gorm:"index"`
}

func (swe *StripeWebhookEvent) BeforeCreate(tx *gorm.DB) error {
	if swe.ID == uuid.Nil {
		swe.ID = uuid.New()
	}
	return nil
}
