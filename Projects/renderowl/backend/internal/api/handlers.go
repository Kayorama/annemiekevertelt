package api

import (
	"context"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/clerkinc/clerk-sdk-go/clerk"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"

	"renderowl/internal/models"
	"renderowl/internal/queue"
	"renderowl/internal/services/stripe"
)

type Handlers struct {
	db            *gorm.DB
	redis         *redis.Client
	queue         *queue.Client
	stripeService *stripe.Service
	clerkSecret   string
}

type ErrorResponse struct {
	Error   string `json:"error"`
	Details string `json:"details,omitempty"`
}

type SuccessResponse struct {
	Data  interface{} `json:"data,omitempty"`
	Meta  interface{} `json:"meta,omitempty"`
}

func (h *Handlers) HealthCheck(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	sqlDB, err := h.db.DB()
	if err != nil {
		c.JSON(http.StatusServiceUnavailable, ErrorResponse{Error: "Database connection error"})
		return
	}

	if err := sqlDB.PingContext(ctx); err != nil {
		c.JSON(http.StatusServiceUnavailable, ErrorResponse{Error: "Database ping failed"})
		return
	}

	if err := h.redis.Ping(ctx).Err(); err != nil {
		c.JSON(http.StatusServiceUnavailable, ErrorResponse{Error: "Redis connection failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":    "healthy",
		"timestamp": time.Now().UTC(),
		"version":   "1.0.0",
	})
}

func (h *Handlers) GetCurrentUser(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Error: "Unauthorized"})
		return
	}

	var user models.User
	if err := h.db.Where("id = ?", userID).Preload("CreditTxs", func(db *gorm.DB) *gorm.DB {
		return db.Order("created_at DESC").Limit(10)
	}).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			clerkUser := c.MustGet("clerk_user").(clerk.User)
			newUser := models.User{
				ClerkID: clerkUser.ID,
				Email:   clerkUser.EmailAddresses[0].EmailAddress,
				Name:    fmt.Sprintf("%s %s", clerkUser.FirstName, clerkUser.LastName),
			}
			if err := h.db.Create(&newUser).Error; err != nil {
				c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to create user"})
				return
			}
			c.JSON(http.StatusOK, SuccessResponse{Data: newUser})
			return
		}
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to fetch user"})
		return
	}

	c.JSON(http.StatusOK, SuccessResponse{Data: user})
}

func (h *Handlers) GetCreditBalance(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Error: "Unauthorized"})
		return
	}

	ctx := c.Request.Context()
	cacheKey := fmt.Sprintf("credits:%s", userID)

	cached, err := h.redis.Get(ctx, cacheKey).Result()
	if err == nil && cached != "" {
		if balance, err := strconv.ParseInt(cached, 10, 64); err == nil {
			c.JSON(http.StatusOK, SuccessResponse{Data: gin.H{"credits": balance, "cached": true}})
			return
		}
	}

	var user models.User
	if err := h.db.Select("credits").Where("id = ?", userID).First(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to fetch balance"})
		return
	}

	h.redis.Set(ctx, cacheKey, user.Credits, 30*time.Second)

	c.JSON(http.StatusOK, SuccessResponse{Data: gin.H{"credits": user.Credits}})
}

func (h *Handlers) ListCreditTransactions(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Error: "Unauthorized"})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	var transactions []models.CreditTx
	var total int64

	query := h.db.Where("user_id = ?", userID).Model(&models.CreditTx{})
	query.Count(&total)

	if err := query.Order("created_at DESC").Offset((page - 1) * limit).Limit(limit).Find(&transactions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to fetch transactions"})
		return
	}

	c.JSON(http.StatusOK, SuccessResponse{
		Data: transactions,
		Meta: gin.H{
			"page":       page,
			"limit":      limit,
			"total":      total,
			"totalPages": (total + int64(limit) - 1) / int64(limit),
		},
	})
}

func (h *Handlers) ListCreditPackages(c *gin.Context) {
	ctx := c.Request.Context()
	cacheKey := "credit_packages"

	cached, err := h.redis.Get(ctx, cacheKey).Result()
	if err == nil && cached != "" {
		c.Header("X-Cache", "HIT")
	}

	var packages []models.CreditPackage
	if err := h.db.Where("is_active = true").Order("sort_order ASC, credits ASC").Find(&packages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to fetch packages"})
		return
	}

	c.Header("X-Cache", "MISS")
	c.JSON(http.StatusOK, SuccessResponse{Data: packages})
}

func (h *Handlers) CreateCheckoutSession(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Error: "Unauthorized"})
		return
	}

	var req struct {
		PackageID  string `json:"package_id" binding:"required,uuid"`
		SuccessURL string `json:"success_url" binding:"required,url"`
		CancelURL  string `json:"cancel_url" binding:"required,url"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}

	packageID, _ := uuid.Parse(req.PackageID)
	userUUID, _ := uuid.Parse(userID)

	sessionReq := stripe.CreateCheckoutSessionRequest{
		UserID:     userUUID,
		PackageID:  packageID,
		SuccessURL: req.SuccessURL,
		CancelURL:  req.CancelURL,
	}

	session, err := h.stripeService.CreateCheckoutSession(h.db, sessionReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to create checkout session", Details: err.Error()})
		return
	}

	c.JSON(http.StatusOK, session)
}

func (h *Handlers) VerifyCheckoutSession(c *gin.Context) {
	sessionID := c.Query("session_id")
	if sessionID == "" {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "Session ID required"})
		return
	}

	var payment models.PaymentIntent
	if err := h.db.Where("stripe_payment_id = ?", sessionID).First(&payment).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, ErrorResponse{Error: "Session not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to verify session"})
		return
	}

	c.JSON(http.StatusOK, SuccessResponse{Data: payment})
}

func (h *Handlers) StripeWebhook(c *gin.Context) {
	payload, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "Failed to read body"})
		return
	}

	signature := c.GetHeader("Stripe-Signature")
	if signature == "" {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "Missing signature"})
		return
	}

	event, err := h.stripeService.VerifyWebhook(payload, signature)
	if err != nil {
		log.Printf("Webhook verification failed: %v", err)
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "Invalid signature"})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 30*time.Second)
	defer cancel()

	if err := h.stripeService.HandleWebhookEvent(ctx, h.db, event); err != nil {
		log.Printf("Webhook handling failed: %v", err)
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to process webhook"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

func (h *Handlers) ListProjects(c *gin.Context) {
	userID := c.GetString("user_id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	var projects []models.Project
	var total int64

	query := h.db.Where("user_id = ?", userID).Model(&models.Project{})
	query.Count(&total)

	if err := query.Order("updated_at DESC").Offset((page - 1) * limit).Limit(limit).Find(&projects).Error; err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to fetch projects"})
		return
	}

	c.JSON(http.StatusOK, SuccessResponse{
		Data: projects,
		Meta: gin.H{
			"page":       page,
			"limit":      limit,
			"total":      total,
			"totalPages": (total + int64(limit) - 1) / int64(limit),
		},
	})
}

func (h *Handlers) CreateProject(c *gin.Context) {
	userID := c.GetString("user_id")
	var req struct {
		Name        string                 `json:"name" binding:"required,max=255"`
		Description string                 `json:"description"`
		TemplateID  string                 `json:"template_id"`
		Data        map[string]interface{} `json:"data"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}

	userUUID, _ := uuid.Parse(userID)
	project := models.Project{
		UserID:      userUUID,
		Name:        req.Name,
		Description: req.Description,
		TemplateID:  req.TemplateID,
		Data:        req.Data,
	}

	if err := h.db.Create(&project).Error; err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to create project"})
		return
	}

	c.JSON(http.StatusCreated, SuccessResponse{Data: project})
}

func (h *Handlers) GetProject(c *gin.Context) {
	userID := c.GetString("user_id")
	projectID := c.Param("id")

	var project models.Project
	if err := h.db.Where("id = ? AND user_id = ?", projectID, userID).Preload("Renders").First(&project).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, ErrorResponse{Error: "Project not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to fetch project"})
		return
	}

	c.JSON(http.StatusOK, SuccessResponse{Data: project})
}

func (h *Handlers) UpdateProject(c *gin.Context) {
	userID := c.GetString("user_id")
	projectID := c.Param("id")

	var req struct {
		Name        string                 `json:"name"`
		Description string                 `json:"description"`
		Data        map[string]interface{} `json:"data"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}

	var project models.Project
	if err := h.db.Where("id = ? AND user_id = ?", projectID, userID).First(&project).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, ErrorResponse{Error: "Project not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to fetch project"})
		return
	}

	updates := make(map[string]interface{})
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Description != "" {
		updates["description"] = req.Description
	}
	if req.Data != nil {
		updates["data"] = req.Data
	}

	if err := h.db.Model(&project).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to update project"})
		return
	}

	c.JSON(http.StatusOK, SuccessResponse{Data: project})
}

func (h *Handlers) DeleteProject(c *gin.Context) {
	userID := c.GetString("user_id")
	projectID := c.Param("id")

	var project models.Project
	if err := h.db.Where("id = ? AND user_id = ?", projectID, userID).First(&project).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, ErrorResponse{Error: "Project not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to fetch project"})
		return
	}

	if err := h.db.Delete(&project).Error; err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to delete project"})
		return
	}

	c.Status(http.StatusNoContent)
}

func (h *Handlers) StartRender(c *gin.Context) {
	userID := c.GetString("user_id")
	projectID := c.Param("id")

	userUUID, _ := uuid.Parse(userID)

	h.db.Transaction(func(tx *gorm.DB) error {
		var user models.User
		if err := tx.Set("LOCK IN SHARE MODE").Where("id = ?", userID).First(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to fetch user"})
			return err
		}

		renderCost := int64(100)
		if user.Credits < renderCost {
			c.JSON(http.StatusPaymentRequired, ErrorResponse{Error: "Insufficient credits"})
			return fmt.Errorf("insufficient credits")
		}

		var project models.Project
		if err := tx.Where("id = ? AND user_id = ?", projectID, userID).First(&project).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, ErrorResponse{Error: "Project not found"})
				return err
			}
			c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to fetch project"})
			return err
		}

		render := models.Render{
			ProjectID:   project.ID,
			UserID:      userUUID,
			Status:      models.RenderStatusPending,
			CreditsUsed: renderCost,
		}

		if err := tx.Create(&render).Error; err != nil {
			c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to create render"})
			return err
		}

		newBalance := user.Credits - renderCost
		creditTx := models.CreditTx{
			UserID:      userUUID,
			Type:        models.CreditTxTypeUsage,
			Amount:      -renderCost,
			Balance:     newBalance,
			Description: fmt.Sprintf("Render %s", render.ID),
			RenderID:    &render.ID,
		}

		if err := tx.Create(&creditTx).Error; err != nil {
			c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to create credit transaction"})
			return err
		}

		if err := tx.Model(&user).Update("credits", newBalance).Error; err != nil {
			c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to update credits"})
			return err
		}

		h.redis.Del(c.Request.Context(), fmt.Sprintf("credits:%s", userID))

		if err := h.queue.EnqueueRender(c.Request.Context(), render.ID, project.ID); err != nil {
			c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to queue render"})
			return err
		}

		c.JSON(http.StatusCreated, SuccessResponse{Data: render})
		return nil
	})
}

func (h *Handlers) GetRender(c *gin.Context) {
	userID := c.GetString("user_id")
	renderID := c.Param("id")

	var render models.Render
	if err := h.db.Where("id = ? AND user_id = ?", renderID, userID).First(&render).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, ErrorResponse{Error: "Render not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to fetch render"})
		return
	}

	c.JSON(http.StatusOK, SuccessResponse{Data: render})
}

func (h *Handlers) GetRenderStatus(c *gin.Context) {
	userID := c.GetString("user_id")
	renderID := c.Param("id")

	ctx := c.Request.Context()
	cacheKey := fmt.Sprintf("render_status:%s", renderID)

	cached, err := h.redis.Get(ctx, cacheKey).Result()
	if err == nil && cached != "" {
		c.Header("X-Cache", "HIT")
		c.JSON(http.StatusOK, gin.H{"status": cached})
		return
	}

	var render models.Render
	if err := h.db.Select("status").Where("id = ? AND user_id = ?", renderID, userID).First(&render).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, ErrorResponse{Error: "Render not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to fetch render status"})
		return
	}

	h.redis.Set(ctx, cacheKey, string(render.Status), 5*time.Second)

	c.Header("X-Cache", "MISS")
	c.JSON(http.StatusOK, gin.H{"status": render.Status})
}
