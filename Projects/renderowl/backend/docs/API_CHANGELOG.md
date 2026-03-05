# RenderOwl API Changelog

## Version 1.0.0 (2026-03-05)

### Authentication
- **Clerk Integration**: All authenticated endpoints now require a valid Clerk JWT token
- Token format: `Authorization: Bearer <clerk_jwt_token>`
- User auto-creation on first authentication

### Credit System

#### Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/packages` | List available credit packages | No |
| GET | `/api/v1/me/credits` | Get current credit balance | Yes |
| GET | `/api/v1/me/transactions` | List credit transaction history | Yes |
| POST | `/api/v1/checkout` | Create Stripe checkout session | Yes |
| GET | `/api/v1/checkout/verify` | Verify checkout session status | Yes |

#### Credit Packages Response
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Starter Pack",
      "credits": 500,
      "price_cents": 999,
      "currency": "USD"
    }
  ]
}
```

#### Checkout Session Request
```json
{
  "package_id": "uuid",
  "success_url": "https://renderowl.com/checkout/success",
  "cancel_url": "https://renderowl.com/checkout/cancel"
}
```

#### Checkout Session Response
```json
{
  "session_id": "cs_...",
  "url": "https://checkout.stripe.com/..."
}
```

### Webhooks

#### Stripe Webhooks
- Endpoint: `POST /webhooks/stripe`
- Events handled:
  - `checkout.session.completed` - Credits added to user account
  - `checkout.session.expired` - Payment recorded as failed
  - `charge.refunded` - Credits deducted, refund processed
  - `payment_intent.payment_failed` - Failure recorded
  - `charge.dispute.created` - Credits frozen

**Note**: Webhook endpoint requires no authentication but validates Stripe signature.

### Project Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/projects` | List user projects | Yes |
| POST | `/api/v1/projects` | Create new project | Yes |
| GET | `/api/v1/projects/:id` | Get project details | Yes |
| PUT | `/api/v1/projects/:id` | Update project | Yes |
| DELETE | `/api/v1/projects/:id` | Delete project | Yes |
| POST | `/api/v1/projects/:id/render` | Start video render | Yes |

#### Create Project Request
```json
{
  "name": "My Video",
  "description": "Optional description",
  "template_id": "template_uuid",
  "data": {}
}
```

### Render Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/renders/:id` | Get render details | Yes |
| GET | `/api/v1/renders/:id/status` | Get render status | Yes |

#### Render Status Response
```json
{
  "status": "processing"
}
```

Status values: `pending`, `processing`, `completed`, `failed`, `cancelled`

### Error Responses

All errors follow this format:
```json
{
  "error": "Error message",
  "details": "Optional detailed message"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `402` - Payment Required (insufficient credits)
- `404` - Not Found
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

### Pagination

List endpoints support pagination via query parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

Response includes meta:
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Rate Limiting

- 100 requests per minute per IP
- Headers included in responses:
  - `X-RateLimit-Limit`: 100
  - `X-RateLimit-Remaining`: 95

### Caching

- Credit balance cached for 30 seconds
- Render status cached for 5 seconds
- Credit packages cached (till modified)
- Cache headers: `X-Cache: HIT/MISS`
