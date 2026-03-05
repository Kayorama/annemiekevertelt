package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Server struct {
	db     *pgxpool.Pool
	router *gin.Engine
}

func main() {
	// Initialize database connection
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://localhost/renderowl?sslmode=disable"
	}

	// Initialize Gin
	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()

	// CORS configuration
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000", "https://renderowl.com"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	config.AllowCredentials = true
	r.Use(cors.New(config))

	// Routes
	api := r.Group("/api")
	{
		// Auth routes (handled by Clerk middleware)
		api.GET("/projects", getProjects)
		api.POST("/projects", createProject)
		api.GET("/timeline/:id", getTimeline)
		api.PUT("/timeline/:id", updateTimeline)
		api.GET("/credits", getCredits)
		api.GET("/credits/transactions", getTransactions)
		api.POST("/credits/purchase", purchaseCredits)
		api.POST("/render", startRender)
		api.GET("/render/:id/status", getRenderStatus)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}

func getProjects(c *gin.Context) {
	userID := c.GetHeader("X-User-ID")
	if userID == "" {
		c.JSON(401, gin.H{"error": "Unauthorized"})
		return
	}

	// Mock data for testing
	projects := []gin.H{
		{
			"id":         "proj-1",
			"name":       "Test Project 1",
			"thumbnail":  "",
			"status":     "draft",
			"updatedAt":  "2024-03-05T10:00:00Z",
			"duration":   30,
		},
		{
			"id":         "proj-2",
			"name":       "My Video",
			"thumbnail":  "",
			"status":     "complete",
			"updatedAt":  "2024-03-04T15:30:00Z",
			"duration":   60,
		},
	}
	c.JSON(200, projects)
}

func createProject(c *gin.Context) {
	var req struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		Duration    int    `json:"duration"`
	}

	if err := c.BindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request"})
		return
	}

	c.JSON(201, gin.H{
		"id":          "proj-new",
		"name":        req.Name,
		"description": req.Description,
		"duration":    req.Duration,
		"status":      "draft",
	})
}

func getTimeline(c *gin.Context) {
	id := c.Param("id")

	c.JSON(200, gin.H{
		"id":       id,
		"name":     "Test Timeline",
		"duration": 30,
		"clips":    []gin.H{},
	})
}

func updateTimeline(c *gin.Context) {
	c.JSON(200, gin.H{"message": "Timeline updated"})
}

func getCredits(c *gin.Context) {
	c.JSON(200, gin.H{
		"balance": 150,
		"pending": 0,
	})
}

func getTransactions(c *gin.Context) {
	transactions := []gin.H{
		{
			"id":          "txn-1",
			"type":        "purchase",
			"amount":      100,
			"description": "Credit pack purchase",
			"createdAt":   "2024-03-01T10:00:00Z",
		},
		{
			"id":          "txn-2",
			"type":        "usage",
			"amount":      10,
			"description": "Video render (1080p)",
			"createdAt":   "2024-03-02T14:30:00Z",
		},
	}
	c.JSON(200, transactions)
}

func purchaseCredits(c *gin.Context) {
	var req struct {
		PackID string `json:"packId"`
	}

	if err := c.BindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request"})
		return
	}

	c.JSON(200, gin.H{
		"message": "Purchase successful",
		"credits": 100,
	})
}

func startRender(c *gin.Context) {
	var req struct {
		TimelineID string `json:"timelineId"`
		Quality    string `json:"quality"`
	}

	if err := c.BindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request"})
		return
	}

	c.JSON(202, gin.H{
		"renderId": "render-123",
		"status":   "queued",
	})
}

func getRenderStatus(c *gin.Context) {
	id := c.Param("id")

	c.JSON(200, gin.H{
		"id":       id,
		"status":   "rendering",
		"progress": 45,
	})
}
