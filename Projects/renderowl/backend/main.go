package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"renderowl/internal/api"
	"renderowl/internal/config"
	"renderowl/internal/db"
	"renderowl/internal/queue"
	"renderowl/internal/services/stripe"
)

func main() {
	cfg := config.Load()

	database, err := db.New(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	redisClient, err := db.NewRedis(cfg.RedisURL)
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}

	queueClient, err := queue.NewClient(cfg.RedisURL)
	if err != nil {
		log.Fatalf("Failed to create queue client: %v", err)
	}

	stripeService := stripe.NewService(
		cfg.StripeSecretKey,
		cfg.StripeWebhookSecret,
		cfg.StripePriceID,
	)

	router := api.NewRouter(api.RouterConfig{
		DB:            database,
		Redis:         redisClient,
		Queue:         queueClient,
		StripeService: stripeService,
		ClerkSecret:   cfg.ClerkSecretKey,
		Environment:   cfg.Environment,
	})

	server := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		log.Printf("Server starting on port %s", cfg.Port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed to start: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Printf("Server forced to shutdown: %v", err)
	}

	if err := queueClient.Close(); err != nil {
		log.Printf("Error closing queue client: %v", err)
	}

	log.Println("Server exited")
}
