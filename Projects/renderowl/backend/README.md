# RenderOwl Backend

Video rendering platform backend with credit-based billing system.

## Features

- **Authentication**: Clerk JWT-based authentication
- **Credits**: Purchase and spend credits for video rendering
- **Payments**: Stripe integration for credit purchases
- **Webhooks**: Secure Stripe webhook handling
- **Projects**: Create and manage video projects
- **Renders**: Async video rendering with status tracking
- **Security**: Rate limiting, input validation, SQL injection protection

## Quick Start

```bash
# Setup
cp .env.example .env
# Edit .env with your credentials

# Run
go run main.go
```

## API Documentation

See [docs/API_CHANGELOG.md](docs/API_CHANGELOG.md)

## Environment Setup

See [docs/ENVIRONMENT_SETUP.md](docs/ENVIRONMENT_SETUP.md)

## Project Structure

```
.
├── main.go                      # Application entry point
├── internal/
│   ├── api/                     # HTTP handlers and middleware
│   │   ├── router.go           # Route definitions
│   │   ├── handlers.go         # Request handlers
│   │   └── middleware.go       # Auth, CORS, rate limiting
│   ├── config/                  # Configuration loading
│   ├── db/                      # Database connection and migrations
│   ├── models/                  # Data models
│   ├── queue/                   # Background job queue (Asynq)
│   ├── security/                # Security utilities
│   └── services/
│       └── stripe/             # Stripe payment service
├── docs/                        # Documentation
└── go.mod                       # Go dependencies
```

## Database Schema

### Users
- `id`, `clerk_id`, `email`, `name`, `credits`

### Projects
- `id`, `user_id`, `name`, `description`, `data`, `template_id`

### Renders
- `id`, `project_id`, `user_id`, `status`, `credits_used`, `output_url`

### Credit Transactions
- `id`, `user_id`, `type`, `amount`, `balance`, `description`

### Payment Intents
- `id`, `user_id`, `stripe_payment_id`, `amount_cents`, `credits`, `status`

## Stripe Events Handled

- `checkout.session.completed` - Add credits to user
- `checkout.session.expired` - Mark as failed
- `charge.refunded` - Deduct credits
- `payment_intent.payment_failed` - Record failure
- `charge.dispute.created` - Freeze credits

## Testing

```bash
# Run tests
go test ./...

# Test Stripe webhooks locally
stripe listen --forward-to localhost:8080/webhooks/stripe
```

## Deployment

```bash
# Docker
docker build -t renderowl-backend .
docker run -p 8080:8080 --env-file .env renderowl-backend
```

## License

Proprietary - RenderOwl Inc.
