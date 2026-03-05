# RenderOwl Rollback Procedures

## Overview

Quick rollback procedures for when deployments go wrong. Time is critical - know these procedures before you need them.

**Golden Rule:** If user impact is high, roll back first, investigate later.

---

## Quick Decision Matrix

| Symptom | Severity | Action |
|---------|----------|--------|
| Complete outage | Critical | Rollback immediately |
| High error rate (>10%) | Critical | Rollback within 5 min |
| Degraded performance | High | Evaluate for 10 min, then rollback |
| Isolated feature bug | Medium | Fix forward or rollback |
| Minor UI issues | Low | Fix forward |

---

## Rollback Methods

### Method 1: Coolify Rollback (Recommended - Fastest)

**Time:** 2-3 minutes

Coolify keeps the previous container image. Rollback by restarting with previous image:

```bash
# Get application UUID
APP_UUID="<your-app-uuid>"

# Force redeploy (uses cached previous image if available)
coolify deploy --uuid $APP_UUID --force

# Or restart with previous version
coolify applications restart --uuid $APP_UUID
```

**Verify rollback:**
```bash
./health-check.sh production
```

### Method 2: Git Revert + Redeploy

**Time:** 5-10 minutes

When you need to undo code changes:

```bash
# On main branch
git checkout main
git pull origin main

# Revert the problematic commit
git revert <commit-hash>

# Or revert multiple commits
git revert HEAD~2..HEAD

# Push (triggers auto-deploy or manual deploy)
git push origin main

# Deploy
./deploy.sh production
```

### Method 3: Previous Git Tag

**Time:** 5-10 minutes

When releases are tagged:

```bash
# List recent tags
git tag -l "v*" --sort=-v:refname | head -10

# Checkout previous stable version
git checkout v1.2.3

# Create hotfix branch from this tag
git checkout -b hotfix/rollback-v1.2.4

# Force push to main (emergency only!)
git push origin HEAD:main --force-with-lease

# Deploy
./deploy.sh production
```

### Method 4: Database Rollback (Critical)

**Time:** 10-30 minutes (depending on DB size)

**Only for data corruption issues.**

```bash
# 1. Stop application writes
coolify applications stop --uuid <api-uuid>

# 2. Restore from backup
# Find latest backup
LATEST_BACKUP=$(ls -t /backups/renderowl_*.sql.gz | head -1)

echo "Restoring from: $LATEST_BACKUP"

# Restore to database
gunzip < $LATEST_BACKUP | psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB

# 3. Restart application
coolify applications start --uuid <api-uuid>

# 4. Verify
./health-check.sh production
```

**⚠️ Warning:** Database rollback causes data loss since backup time. Use only for corruption.

---

## Emergency Contacts & Procedures

### Immediate Rollback Checklist

- [ ] Identify the issue (error logs, Sentry alerts)
- [ ] Determine rollback method
- [ ] Execute rollback
- [ ] Verify system health
- [ ] Notify team in Slack (#incidents)
- [ ] Create post-mortem ticket

### Communication Template

```
🚨 INCIDENT: Brief description

Status: RESOLVED / IN PROGRESS
Impact: [What users experienced]
Duration: [Start time] - [End time]
Cause: [Brief explanation]
Resolution: [How it was fixed]

Post-mortem: [Link to ticket]
```

---

## Rollback Scenarios

### Scenario 1: API Crashing on Startup

**Symptoms:**
- Health check failing
- Logs show crash loop
- 503 errors

**Rollback:**
```bash
# Check logs first
coolify applications logs --uuid <api-uuid> --tail 50

# Immediate restart (may use previous image)
coolify applications restart --uuid <api-uuid>

# If still failing, check environment variables
coolify applications envs list --uuid <api-uuid>

# Redeploy previous version
./deploy.sh production
```

### Scenario 2: Database Migration Failed

**Symptoms:**
- API won't start
- Migration errors in logs
- "pending migration" warnings

**Rollback:**
```bash
# Check migration status
coolify applications exec --uuid <api-uuid> --command "npm run migrate:status"

# If migration is stuck, you may need to:
# 1. Manually fix the database (connect directly)
# 2. Mark migration as rolled back
# 3. Or restore from backup (nuclear option)

# Revert the migration code
git revert <migration-commit>
git push origin main
./deploy.sh production
```

### Scenario 3: Performance Degradation

**Symptoms:**
- Slow response times
- High CPU/memory usage
- Timeout errors

**Rollback:**
```bash
# Check current metrics
curl https://api.renderowl.com/metrics

# Quick restart to clear any memory issues
coolify applications restart --uuid <api-uuid>

# If still slow, rollback
git log --oneline -5  # Find previous good commit
git revert HEAD
./deploy.sh production
```

### Scenario 4: Worker Queue Backup

**Symptoms:**
- Queue depth growing
- Videos not processing
- High latency on renders

**Rollback:**
```bash
# Check worker status
curl https://api.renderowl.com/workers/health | jq

# Restart workers
coolify applications restart --uuid <worker-render-uuid>
coolify applications restart --uuid <worker-export-uuid>

# Scale up workers temporarily if needed
# (Update coolify-config.json and redeploy)
```

### Scenario 5: Security Incident

**Symptoms:**
- Unauthorized access detected
- Data exfiltration suspected
- Credentials compromised

**Immediate Actions:**
```bash
# 1. STOP everything immediately
coolify applications stop --uuid <api-uuid>
coolify applications stop --uuid <web-uuid>

# 2. Rotate compromised credentials
# - Database passwords
# - API keys
# - JWT secrets

# 3. Update environment variables
coolify applications envs update --uuid <api-uuid> --env-uuid <env-uuid> --value "new-secret"

# 4. Review access logs
# Check Coolify logs, Sentry, any WAF logs

# 5. Restore from known-good backup if needed

# 6. Restart services
coolify applications start --uuid <api-uuid>
```

---

## Post-Rollback Steps

### 1. Verify System Health

```bash
# Full health check
./health-check.sh production

# Monitor for 15 minutes
watch -n 30 './health-check.sh production'
```

### 2. Update Sentry

```bash
# Mark release as problematic
sentry-cli releases deploys "<version>" new -e production --status failed
```

### 3. Document the Incident

Create post-mortem with:
- Timeline of events
- Root cause analysis
- Impact assessment
- Prevention measures

### 4. Clean Up

```bash
# Remove broken containers/images if needed
# (Coolify handles this automatically)

# Reset git state if needed
git checkout main
git pull origin main
```

---

## Testing Rollbacks

**Quarterly drill:**
1. Deploy to staging
2. Simulate a failure
3. Practice rollback
4. Time the procedure
5. Document any issues

---

## Rollback Tools

### Scripts in This Directory

| Script | Purpose |
|--------|---------|
| `health-check.sh` | Verify system after rollback |
| `deploy.sh` | Redeploy previous version |
| `database-backup.sh` | Verify backups before rollback |

### Coolify Commands

```bash
# List all applications
coolify applications list

# Quick restart (fastest rollback)
coolify applications restart --uuid <uuid>

# Force rebuild
coolify deploy --uuid <uuid> --force

# View logs
coolify applications logs --uuid <uuid> --tail 100
```

---

## Prevention Checklist

Before deploying, verify:

- [ ] Tests pass (unit, integration, e2e)
- [ ] Staging deployment successful
- [ ] Database migrations are backwards-compatible
- [ ] Feature flags available for new features
- [ ] Rollback plan documented
- [ ] Team aware of deployment
- [ ] Monitoring dashboards ready
- [ ] On-call engineer notified

---

## Related Documents

- [Deployment Runbook](./deployment-runbook.md)
- [Troubleshooting Guide](./troubleshooting.md)
- [Sentry Dashboard](https://sentry.io/organizations/renderowl)
