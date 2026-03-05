package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"

	"renderowl/internal/queue"
	"renderowl/internal/services/stripe"
)

type RouterConfig struct {
	DB            *gorm.DB
	Redis         *redis.Client
	Queue         *queue.Client
	StripeService *stripe.Service
	ClerkSecret   string
	Environment   string
}

func NewRouter(cfg RouterConfig) *gin.Engine {
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(corsMiddleware())
	router.Use(requestIDMiddleware())
	router.Use(loggingMiddleware())
	router.Use(rateLimitMiddleware(cfg.Redis))

	h := &Handlers{
		db:            cfg.DB,
		redis:         cfg.Redis,
		queue:         cfg.Queue,
		stripeService: cfg.StripeService,
		clerkSecret:   cfg.ClerkSecret,
	}

	api := router.Group("/api/v1")
	{
		api.GET("/health", h.HealthCheck)

		api.GET("/packages", h.ListCreditPackages)

		auth := api.Group("")
		auth.Use(clerkAuthMiddleware(cfg.ClerkSecret))
		{
			auth.GET("/me", h.GetCurrentUser)
			auth.GET("/me/credits", h.GetCreditBalance)
			auth.GET("/me/transactions", h.ListCreditTransactions)

			auth.POST("/checkout", h.CreateCheckoutSession)
			auth.GET("/checkout/verify", h.VerifyCheckoutSession)

			auth.GET("/projects", h.ListProjects)
			auth.POST("/projects", h.CreateProject)
			auth.GET("/projects/:id", h.GetProject)
			auth.PUT("/projects/:id", h.UpdateProject)
			auth.DELETE("/projects/:id", h.DeleteProject)

			auth.POST("/projects/:id/render", h.StartRender)
			auth.GET("/renders/:id", h.GetRender)
			auth.GET("/renders/:id/status", h.GetRenderStatus)
		}
	}

	router.POST("/webhooks/stripe", h.StripeWebhook)

	router.NoRoute(func(c *gin.Context) {
		c.JSON(http.StatusNotFound, ErrorResponse{Error: "Not found"})
	})

	return router
}
