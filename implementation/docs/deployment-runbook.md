# RenderOwl Deployment Runbook

## Overview

This runbook covers deployment procedures for the RenderOwl video generation platform on Coolify.

**Environments:**
- **Staging:** `staging.renderowl.com` (auto-deploy from `develop` branch)
- **Production:** `renderowl.com` (manual deploy from `main` branch)

**Prerequisites:**
- Coolify API access configured (`COOLIFY_TOKEN`)
- Sentry account configured
- Database backup configured
- SSH access to servers (for emergency access)

---

## Quick Reference

| Action | Command |
|--------|---------|
| Deploy to staging | `cd implementation/scripts && ./deploy.sh staging` |
| Deploy to production | `./deploy.sh production` |
| Check health | `./health-check.sh [staging\|production]` |
| View logs | `coolify applications logs --uuid <uuid>` |
| Force rebuild | `./deploy.sh staging --force` |

---

## Deployment Process

### 1. Pre-Deployment Checklist

Before deploying to production:

- [ ] All tests passing (`npm run test:ci`)
- [ ] Code reviewed and approved
- [ ] Database migrations prepared (if needed)
- [ ] Feature flags configured (if applicable)
- [ ] Sentry release created
- [ ] Rollback plan ready

### 2. Staging Deployment

Staging auto-deploys on push to `develop`, but manual deployment:

```bash
cd implementation/scripts
./deploy.sh staging
```

Verify deployment:
```bash
./health-check.sh staging
```

### 3. Production Deployment

**Step 1: Create a deployment window**
- Notify team in Slack (#deployments)
- Check error rates in Sentry (should be baseline)
- Verify backup completed successfully

**Step 2: Create Sentry release**
```bash
export SENTRY_RELEASE="renderowl@$(git rev-parse --short HEAD)"
sentry-cli releases new "$SENTRY_RELEASE"
sentry-cli releases set-commits "$SENTRY_RELEASE" --auto
```

**Step 3: Deploy**
```bash
./deploy.sh production
```

**Step 4: Verify**
```bash
./health-check.sh production
```

Check critical paths:
- User login
- Video upload
- Render creation
- Export flow

**Step 5: Finalize**
```bash
# Mark Sentry release as deployed
sentry-cli releases deploys "$SENTRY_RELEASE" new -e production

# Notify team
```

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgres://user:pass@host:5432/db` |
| `REDIS_URL` | Redis connection | `redis://redis:6379` |
| `REPLICATE_API_TOKEN` | Replicate AI API | `r8_...` |
| `CLERK_SECRET_KEY` | Auth secret | `sk_test_...` |
| `CLERK_PUBLISHABLE_KEY` | Auth public key | `pk_test_...` |
| `R2_BUCKET_NAME` | Cloudflare R2 bucket | `renderowl-prod` |
| `R2_ACCESS_KEY_ID` | R2 credentials | `...` |
| `R2_SECRET_ACCESS_KEY` | R2 credentials | `...` |
| `R2_ENDPOINT` | R2 endpoint | `https://...r2.cloudflarestorage.com` |
| `SENTRY_DSN` | Error tracking | `https://...sentry.io/...` |
| `STRIPE_SECRET_KEY` | Payments | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhooks | `whsec_...` |

### Setting Environment Variables in Coolify

```bash
# Set a single variable
coolify applications envs create \
  --uuid <app-uuid> \
  --key DATABASE_URL \
  --value "postgres://..." \
  --is-runtime true

# Bulk update
coolify applications envs bulk-update \
  --uuid <app-uuid> \
  --json '{"KEY1":"value1","KEY2":"value2"}'
```

---

## Health Checks

### Endpoints

| Endpoint | Description | Expected Response |
|----------|-------------|-------------------|
| `GET /health` | Basic health | `{"status":"ok","version":"..."}` |
| `GET /ready` | Readiness check | `{"ready":true}` |
| `GET /workers/health` | Worker status | Queue depths, worker counts |

### Automated Checks

Health checks run every 30 seconds via Coolify.

Manual verification:
```bash
curl https://api.renderowl.com/health | jq
```

---

## Database Migrations

### Running Migrations

Migrations run automatically on API startup.

**Manual migration (if needed):**
```bash
# Connect to API container
coolify applications exec --uuid <api-uuid> --command "npm run migrate"
```

### Migration Safety

1. **Backwards-compatible migrations first**
   - Add new columns (nullable)
   - Create new tables
   - Add indexes

2. **Deploy application**

3. **Cleanup migrations after**
   - Make columns non-nullable
   - Drop old columns
   - Remove old tables

---

## SSL Certificates

Coolify automatically manages Let's Encrypt certificates.

**Verify SSL:**
```bash
echo | openssl s_client -servername renderowl.com -connect renderowl.com:443 | openssl x509 -noout -text
```

**Force renewal (if needed):**
```bash
# Restart nginx proxy (handled by Coolify)
coolify applications restart --uuid <nginx-uuid>
```

---

## Monitoring

### Sentry Dashboard

Monitor at: https://sentry.io/organizations/renderowl

Key metrics:
- Error rate (alert if > 10/min)
- Apdex score (alert if < 0.7)
- Failed renders (alert if > 5/10min)

### Log Aggregation

Access logs via Coolify:
```bash
# API logs
coolify applications logs --uuid <api-uuid> --tail 100

# Worker logs
coolify applications logs --uuid <worker-uuid> --tail 100
```

### Key Metrics to Watch

| Metric | Warning | Critical |
|--------|---------|----------|
| API latency (p95) | > 500ms | > 2000ms |
| Error rate | > 1% | > 5% |
| Queue depth | > 50 | > 200 |
| Failed renders | > 2/10min | > 5/10min |
| DB connections | > 80% | > 95% |

---

## Contact & Escalation

| Issue | Contact |
|-------|---------|
| Coolify issues | Check status.coolify.io |
| Infrastructure | DevOps team |
| Application errors | Engineering team |
| Critical outages | On-call engineer |

---

## Related Documents

- [Rollback Procedures](./rollback-procedures.md)
- [Troubleshooting Guide](./troubleshooting.md)
- [Sentry Configuration](../config/sentry.config.js)
- [Coolify Config](../config/coolify-config.json)
