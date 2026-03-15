# Annemieke Vertelt - Coolify Deployment Guide

## Overview
This document describes how to deploy Annemieke Vertelt to Coolify.

## Architecture
- **Frontend**: Astro 5 static site served by Nginx
- **Backend**: PayloadCMS on Node.js 20
- **Database**: PostgreSQL 16
- **Domain**: annemiekevertelt.nl

## Files Created

### 1. Production Docker Compose
`docker-compose.production.yml` - Production-ready docker-compose for Coolify deployment

### 2. Dockerfiles
- `apps/cms/Dockerfile.production` - PayloadCMS production build
- `apps/web/Dockerfile.production` - Astro frontend production build
- `apps/web/nginx.conf` - Nginx configuration for serving static files

## Environment Variables Required

The following environment variables need to be configured in Coolify:

### Database
- `POSTGRES_USER` - PostgreSQL username (e.g., annemieke)
- `POSTGRES_PASSWORD` - Strong password for PostgreSQL
- `POSTGRES_DB` - Database name (e.g., annemieke_db)

### PayloadCMS
- `PAYLOAD_SECRET` - Secret key for PayloadCMS (generate with: `openssl rand -base64 32`)
- `RESEND_API_KEY` - API key from Resend for email functionality

### Build Args
- `PAYLOAD_URL` - URL for CMS (e.g., https://cms.annemiekevertelt.nl)

## Deployment Steps

### 1. Prepare Coolify
1. Log into your Coolify dashboard (https://app.coolify.io or self-hosted)
2. Create a new Project (or use existing)
3. Ensure you have a connected server

### 2. Create GitHub App Integration (if using private repo)
1. Go to **Keys & Tokens** → **GitHub Apps**
2. Create GitHub App
3. Connect your repository

### 3. Create Services in Coolify

#### Option A: Docker Compose Deployment (Recommended)
1. In Coolify, create a new **Service** → **Docker Compose**
2. Select your Git repository: `kayorama/annemiekevertelt`
3. Set Docker Compose location: `./docker-compose.production.yml`
4. Configure the following:

##### Environment Variables
```bash
POSTGRES_USER=annemieke
POSTGRES_PASSWORD=<generate-strong-password>
POSTGRES_DB=annemieke_db
PAYLOAD_SECRET=<generate-with-openssl-rand-base64-32>
RESEND_API_KEY=<your-resend-api-key>
```

##### Domains
- Web frontend: `annemiekevertelt.nl`
- CMS: `cms.annemiekevertelt.nl` (optional, or use `/admin` path)

#### Option B: Separate Applications
Create three separate resources:

1. **PostgreSQL Database**
   - Type: PostgreSQL 16
   - Database: annemieke_db
   - User: annemieke
   - Generate strong password

2. **PayloadCMS Application**
   - Type: Dockerfile
   - Dockerfile location: `apps/cms/Dockerfile.production`
   - Environment variables as above
   - Domain: `cms.annemiekevertelt.nl` (internal) or no domain

3. **Web Frontend Application**
   - Type: Dockerfile
   - Dockerfile location: `apps/web/Dockerfile.production`
   - Build argument: `PAYLOAD_URL=https://cms.annemiekevertelt.nl`
   - Domain: `annemiekevertelt.nl`

### 4. SSL Configuration
1. In Coolify, enable SSL for each domain
2. Enable "www to non-www" redirect if desired
3. Wait for SSL certificates to be issued (Let's Encrypt)

### 5. Database Migrations
After first deployment, run migrations:

```bash
# In Coolify, open terminal for the payload container
cd /app/apps/cms
pnpm migrate
```

Or add a startup script to the docker-compose:
```yaml
payload:
  command: sh -c "pnpm migrate && pnpm start"
```

### 6. Initial Admin Setup
1. Access the CMS at `https://cms.annemiekevertelt.nl/admin` or `https://annemiekevertelt.nl/admin`
2. Create first admin user
3. Start adding content

## Post-Deployment Verification

### Health Checks
- [ ] Frontend loads at https://annemiekevertelt.nl
- [ ] CMS admin accessible at /admin
- [ ] Database connected
- [ ] SSL certificate valid

### Functionality Tests
- [ ] Subscribe to newsletter (test with real email)
- [ ] Check unsubscribe flow
- [ ] Verify media uploads work
- [ ] Test audio player

## Troubleshooting

### Container won't start
Check logs in Coolify dashboard → Resources → Logs

### Database connection issues
Verify DATABASE_URI format:
```
postgresql://user:password@postgres:5432/dbname
```

### Build fails
Ensure pnpm-lock.yaml is committed:
```bash
git add pnpm-lock.yaml
git commit -m "Add lockfile"
```

### Static files not served
Check nginx.conf is properly copied and nginx is running in web container.

## Maintenance

### Backups
Set up PostgreSQL backups in Coolify:
1. Go to Database → Backups
2. Configure backup schedule (daily recommended)
3. Set backup retention

### Updates
To update:
1. Push new code to repository
2. Coolify will auto-deploy (if webhook configured)
3. Or manually trigger redeploy in Coolify dashboard

### SSL Renewal
Coolify handles Let's Encrypt SSL renewal automatically.
