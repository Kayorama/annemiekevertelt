# RenderOwl Backend Environment Setup

## Prerequisites

- Go 1.22+
- PostgreSQL 15+
- Redis 7+
- Stripe account
- Clerk account
- Replicate account (for video generation)
- Cloudflare R2 account (for storage)

## Quick Start

### 1. Clone and Setup

```bash
cd ~/Projects/renderowl/backend
cp .env.example .env
```

### 2. Database Setup

```bash
# Create database
createdb renderowl

# Run migrations
psql renderowl < internal/db/migrations/001_add_indexes.sql
```

### 3. Environment Variables

Create `.env` file:

```bash
# Server
PORT=8080
ENVIRONMENT=development

# Database
DATABASE_URL=postgres://user:password@localhost:5432/renderowl?sslmode=disable

# Redis
REDIS_URL=redis://localhost:6379

# Clerk Authentication
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...

# Stripe Payments
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...

# Replicate (Video Generation)
REPLICATE_API_TOKEN=r8_...

# Cloudflare R2 (Storage)
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=renderowl-uploads

# Sentry (Error Tracking)
SENTRY_DSN=https://...@....ingest.sentry.io/...
```

### 4. Stripe Configuration

#### Create Products and Prices

```bash
# Create credit packages in Stripe Dashboard
# 1. Go to Products → Add Product
# 2. Create packages:
#    - Starter Pack: 500 credits, $9.99
#    - Pro Pack: 2000 credits, $29.99
#    - Studio Pack: 10000 credits, $99.99
```

#### Setup Webhooks

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `charge.refunded`
   - `payment_intent.payment_failed`
   - `charge.dispute.created`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

#### Local Webhook Testing

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:8080/webhooks/stripe

# Use the webhook signing secret from output
```

### 5. Clerk Configuration

1. Create application at https://dashboard.clerk.dev
2. Enable JWT templates for API authentication
3. Copy API keys to environment variables
4. Configure allowed origins in Clerk settings

### 6. Run Application

```bash
# Download dependencies
go mod download

# Run migrations (if using auto-migration)
go run main.go migrate

# Start server
go run main.go

# Or build and run
go build -o renderowl .
./renderowl
```

### 7. Run Tests

```bash
# Run all tests
go test ./...

# Run with coverage
go test -cover ./...

# Run specific package tests
go test ./internal/...
```

## Development Tools

### Database Migrations

```bash
# Create new migration
cat > internal/db/migrations/002_add_feature.sql << 'EOF'
-- Migration description
EOF

# Apply migrations
psql $DATABASE_URL < internal/db/migrations/001_add_indexes.sql
```

### Seed Data

```bash
# Seed credit packages
psql $DATABASE_URL << 'EOF'
INSERT INTO credit_packages (name, credits, price_cents, currency, stripe_price_id, sort_order)
VALUES
  ('Starter Pack', 500, 999, 'USD', 'price_...', 1),
  ('Pro Pack', 2000, 2999, 'USD', 'price_...', 2),
  ('Studio Pack', 10000, 9999, 'USD', 'price_...', 3);
EOF
```

### Background Workers

```bash
# In a separate terminal, run the worker process
go run cmd/worker/main.go
```

## Production Deployment

### Environment Variables

```bash
ENVIRONMENT=production
PORT=8080

# Use strong passwords and SSL
DATABASE_URL=postgres://user:strongpass@prod-db:5432/renderowl?sslmode=require
REDIS_URL=redis://prod-redis:6379

# Use live Stripe keys
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...

# Clerk production keys
CLERK_SECRET_KEY=sk_live_...
```

### Docker Deployment

```bash
# Build image
docker build -t renderowl-backend .

# Run container
docker run -p 8080:8080 --env-file .env renderowl-backend
```

### Health Checks

- HTTP: `GET /api/v1/health`
- Checks database and Redis connectivity
- Returns 200 when healthy, 503 when degraded

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check migrations
psql $DATABASE_URL -c "\dt"
```

### Stripe Webhook Issues

```bash
# Test webhook signature
stripe trigger checkout.session.completed

# Check webhook logs in Stripe Dashboard
```

### Redis Connection Issues

```bash
# Test Redis
redis-cli -u $REDIS_URL ping

# Monitor Redis
redis-cli -u $REDIS_URL monitor
```

## Security Checklist

- [ ] Use strong PostgreSQL password
- [ ] Enable SSL for database connections
- [ ] Use webhook signature verification
- [ ] Store secrets in environment variables
- [ ] Enable rate limiting
- [ ] Use production Clerk keys in production
- [ ] Use live Stripe keys in production
- [ ] Enable CORS only for known origins
- [ ] Review database indexes for performance

## Support

For issues or questions:
- Backend Lead: Slothy
- Docs: `/docs` directory
- Logs: Check application logs with `tail -f /var/log/renderowl/app.log`
