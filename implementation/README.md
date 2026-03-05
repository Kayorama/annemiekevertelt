# RenderOwl Phase 3 - DevOps Implementation

**Status:** IN PROGRESS
**Lead:** Slothy (DevOps)
**Date:** 2026-03-05

## Overview

This directory contains all DevOps configurations, scripts, and documentation for RenderOwl's production deployment on Coolify.

## Directory Structure

```
implementation/
├── README.md                          # This file
├── docker/
│   └── docker-compose.prod.yml        # Production Docker Compose
├── config/
│   ├── coolify-config.json            # Coolify deployment configuration
│   └── sentry.config.js               # Sentry monitoring configuration
├── scripts/
│   ├── deploy.sh                      # Deployment script
│   ├── health-check.sh                # Health check script
│   ├── database-backup.sh             # Database backup automation
│   └── setup-monitoring.sh            # Sentry setup script
└── docs/
    ├── deployment-runbook.md          # Deployment procedures
    ├── rollback-procedures.md         # Emergency rollback guide
    └── troubleshooting.md             # Troubleshooting guide
```

## Quick Start

### 1. Deploy to Staging

```bash
cd implementation/scripts
./deploy.sh staging
```

### 2. Check Health

```bash
./health-check.sh staging
```

### 3. Deploy to Production

```bash
./deploy.sh production
```

## Prerequisites

- Coolify API token configured (`COOLIFY_TOKEN`)
- Sentry account with access
- Database credentials
- AWS/R2 credentials for backups

## Environment Variables

Required environment variables (set in Coolify):

| Variable | Description | Required For |
|----------|-------------|--------------|
| `DATABASE_URL` | PostgreSQL connection | API, Workers |
| `REDIS_URL` | Redis connection | API, Workers |
| `REPLICATE_API_TOKEN` | AI video generation | API, Workers |
| `CLERK_SECRET_KEY` | Authentication | API, Web |
| `R2_*` | Cloudflare R2 storage | API, Workers |
| `SENTRY_DSN` | Error tracking | All services |
| `STRIPE_*` | Payments | API |

## Services Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Coolify                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Web App    │  │   API        │  │   Workers    │      │
│  │   (Next.js)  │  │   (Go/Node)  │  │   (Render)   │      │
│  │   :3000      │  │   :8080      │  │   (Export)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │  PostgreSQL  │  │    Redis     │                        │
│  │   (Data)     │  │  (Queue)     │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

## Deployment Pipeline

1. **Pre-deployment:** Tests run, code review complete
2. **Staging:** Auto-deploy from `develop` branch
3. **Verification:** Health checks pass
4. **Production:** Manual deploy from `main` branch
5. **Post-deployment:** Sentry release, monitoring alerts

## Monitoring

- **Sentry:** Error tracking and performance monitoring
- **Coolify:** Container health and resource usage
- **Custom:** Health check script, queue depth monitoring

Alert channels:
- Slack (#alerts)
- Email (critical issues)
- PagerDuty (outages)

## Backup Strategy

- **Database:** Daily automated backups at 2 AM
- **Retention:** 30 days local, 90 days in R2/S3
- **Testing:** Monthly restore verification

Run backup manually:
```bash
./scripts/database-backup.sh
```

## Documentation

- [Deployment Runbook](./docs/deployment-runbook.md) - Step-by-step deployment procedures
- [Rollback Procedures](./docs/rollback-procedures.md) - Emergency rollback guide
- [Troubleshooting](./docs/troubleshooting.md) - Common issues and fixes

## Troubleshooting

### Deployment Failed

1. Check Coolify logs: `coolify applications logs --uuid <uuid>`
2. Run health check: `./scripts/health-check.sh staging`
3. See [troubleshooting.md](./docs/troubleshooting.md)

### Need to Rollback

See [rollback-procedures.md](./docs/rollback-procedures.md) for 4 different rollback methods depending on the situation.

## Phase 3 Goals

- [x] Coolify deployment configuration
- [x] Docker Compose production setup
- [x] Health check scripts
- [x] Database backup automation
- [x] Sentry monitoring setup
- [x] Deployment documentation
- [ ] Deploy to staging.renderowl.com
- [ ] Verify all services start correctly
- [ ] Configure SSL certificates
- [ ] Test health endpoints
- [ ] Final production deployment

## Contact

- **DevOps Lead:** Slothy
- **Project:** RenderOwl Phase 3
- **Platform:** Coolify (coolify.io)

---

*Part of the RenderOwl 24/7 Build Pipeline*
