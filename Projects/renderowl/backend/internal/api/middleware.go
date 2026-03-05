package api

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/clerkinc/clerk-sdk-go/clerk"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		allowedOrigins := []string{
			"http://localhost:3000",
			"http://localhost:5173",
			"https://renderowl.com",
			"https://www.renderowl.com",
			"https://staging.renderowl.com",
		}

		for _, allowed := range allowedOrigins {
			if origin == allowed {
				c.Header("Access-Control-Allow-Origin", origin)
				break
			}
		}

		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Request-ID")
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Max-Age", "86400")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

func requestIDMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID := c.GetHeader("X-Request-ID")
		if requestID == "" {
			requestID = uuid.New().String()
		}
		c.Set("request_id", requestID)
		c.Header("X-Request-ID", requestID)
		c.Next()
	}
}

func loggingMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		raw := c.Request.URL.RawQuery

		c.Next()

		latency := time.Since(start)
		clientIP := c.ClientIP()
		method := c.Request.Method
		statusCode := c.Writer.Status()

		if raw != "" {
			path = path + "?" + raw
		}

		log.Printf("[%s] %s %s %d %s - %s",
			clientIP,
			method,
			path,
			statusCode,
			latency,
			c.GetString("request_id"),
		)
	}
}

func rateLimitMiddleware(redisClient *redis.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		if redisClient == nil {
			c.Next()
			return
		}

		clientIP := c.ClientIP()
		key := fmt.Sprintf("rate_limit:%s", clientIP)
		ctx := c.Request.Context()

		window := 60
		limit := 100

		pipe := redisClient.Pipeline()
		incr := pipe.Incr(ctx, key)
		pipe.Expire(ctx, key, time.Duration(window)*time.Second)
		_, err := pipe.Exec(ctx)

		if err != nil {
			log.Printf("Rate limit check failed: %v", err)
			c.Next()
			return
		}

		count := incr.Val()

		c.Header("X-RateLimit-Limit", fmt.Sprintf("%d", limit))
		c.Header("X-RateLimit-Remaining", fmt.Sprintf("%d", limit-int(count)))

		if count > int64(limit) {
			c.JSON(http.StatusTooManyRequests, ErrorResponse{
				Error: "Rate limit exceeded. Please try again later.",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

func clerkAuthMiddleware(secretKey string) gin.HandlerFunc {
	client, err := clerk.NewClient(secretKey)
	if err != nil {
		log.Printf("Failed to create Clerk client: %v", err)
	}

	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, ErrorResponse{Error: "Authorization header required"})
			c.Abort()
			return
		}

		token := strings.TrimPrefix(authHeader, "Bearer ")
		if token == authHeader {
			c.JSON(http.StatusUnauthorized, ErrorResponse{Error: "Invalid authorization header format"})
			c.Abort()
			return
		}

		if client == nil {
			c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Authentication service unavailable"})
			c.Abort()
			return
		}

		session, err := client.Verification().Verify(context.Background(), token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, ErrorResponse{Error: "Invalid or expired token"})
			c.Abort()
			return
		}

		user, err := client.Users().Read(context.Background(), session.Claims.Subject)
		if err != nil {
			c.JSON(http.StatusUnauthorized, ErrorResponse{Error: "User not found"})
			c.Abort()
			return
		}

		c.Set("user_id", session.Claims.Subject)
		c.Set("clerk_user", user)
		c.Set("session_claims", session.Claims)
		c.Next()
	}
}
