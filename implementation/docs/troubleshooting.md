# RenderOwl Troubleshooting Guide

## Quick Diagnostics

Start here for common issues:

```bash
# Full system health check
./scripts/health-check.sh [staging|production]

# Check all services status
coolify applications list
coolify databases list
```

---

## API Issues

### API Returns 500 Errors

**Symptoms:**
- HTTP 500 responses
- Sentry showing exceptions
- User-facing errors

**Diagnostic Steps:**

1. **Check logs:**
```bash
coolify applications logs --uuid <api-uuid> --tail 100
```

2. **Check health endpoint:**
```bash
curl https://api.renderowl.com/health | jq
```

3. **Check database connection:**
```bash
curl https://api.renderowl.com/health | jq '.database'
```

**Common Causes & Fixes:**

| Cause | Fix |
|-------|-----|
| Database connection pool exhausted | Restart API, check connection limits |
| Missing environment variable | Check `coolify applications envs list` |
| Replicate API rate limit | Wait or upgrade Replicate plan |
| Memory leak | Restart container, investigate heap dump |

### API Slow Response Times

**Symptoms:**
- p95 latency > 2 seconds
- Timeout errors
- Degraded user experience

**Diagnostic Steps:**

```bash
# Check current metrics
curl https://api.renderowl.com/metrics

# Database query performance
# Connect to database and check slow queries
psql $DATABASE_URL -c "SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"

# Redis memory usage
redis-cli -u $REDIS_URL INFO memory
```

**Fixes:**

1. **Add database indexes:**
```sql
-- Check for missing indexes
SELECT schemaname, tablename, attname AS column, n_tup_read, n_tup_fetch
FROM pg_stats
WHERE tablename IN ('renders', 'videos', 'users')
ORDER BY n_tup_read DESC;
```

2. **Scale horizontally:**
- Increase API container count in Coolify
- Update `coolify-config.json` replicas

3. **Enable query caching:**
- Check Redis cache hit rate
- Verify cache configuration

### API Won't Start

**Symptoms:**
- Container crash loop
- Health check failing
- Exit code 1

**Diagnostic Steps:**

```bash
# Check startup logs
coolify applications logs --uuid <api-uuid> --follow

# Verify environment variables
coolify applications envs list --uuid <api-uuid>

# Check for port conflicts
coolify applications get --uuid <api-uuid>
```

**Common Fixes:**

1. **Missing required env var:**
```bash
coolify applications envs create --uuid <api-uuid> --key MISSING_VAR --value "value"
```

2. **Database not ready:**
```bash
# Check database status
coolify databases get --uuid <db-uuid>

# Restart database if needed
coolify databases restart --uuid <db-uuid>
```

3. **Migration pending:**
```bash
# Run migrations manually
coolify applications exec --uuid <api-uuid> --command "npm run migrate"
```

---

## Database Issues

### Connection Failures

**Symptoms:**
- "connection refused" errors
- "too many connections" errors
- Intermittent database errors

**Diagnostic:**

```bash
# Check connection count
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"

# Check max connections
psql $DATABASE_URL -c "SHOW max_connections;"

# Check idle connections
psql $DATABASE_URL -c "SELECT state, count(*) FROM pg_stat_activity GROUP BY state;"
```

**Fixes:**

1. **Kill idle connections:**
```sql
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle' AND state_change < NOW() - INTERVAL '1 hour';
```

2. **Increase connection pool size:**
- Update `DATABASE_URL` with `?pool_size=20`

3. **Restart database (last resort):**
```bash
coolify databases restart --uuid <db-uuid>
```

### Slow Queries

**Diagnostic:**

```bash
# Enable query logging temporarily
psql $DATABASE_URL -c "ALTER SYSTEM SET log_min_duration_statement = '1000';"
psql $DATABASE_URL -c "SELECT pg_reload_conf();"
```

**Common Slow Queries:**

| Query Pattern | Solution |
|--------------|----------|
| `SELECT * FROM renders WHERE user_id = ?` | Add index on `user_id` |
| `SELECT * FROM videos ORDER BY created_at DESC` | Add composite index |
| `UPDATE users SET credits = credits - ?` | Use row-level locking carefully |

### Disk Space Issues

**Symptoms:**
- "could not extend file" errors
- Database operations failing

**Diagnostic:**

```bash
# Check disk usage
coolify servers resources --uuid <server-uuid>

# Check database size
psql $DATABASE_URL -c "SELECT pg_size_pretty(pg_database_size('renderowl'));"

# Check table sizes
psql $DATABASE_URL -c "SELECT relname, pg_size_pretty(pg_total_relation_size(relid)) FROM pg_catalog.pg_statio_user_tables ORDER BY pg_total_relation_size(relid) DESC;"
```

**Fixes:**

1. **Clean up old renders:**
```sql
-- Archive renders older than 90 days
DELETE FROM render_frames WHERE render_id IN (SELECT id FROM renders WHERE created_at < NOW() - INTERVAL '90 days' AND status = 'completed');
DELETE FROM renders WHERE created_at < NOW() - INTERVAL '90 days' AND status = 'completed';
```

2. **Run VACUUM:**
```sql
VACUUM ANALYZE;
```

---

## Worker Issues

### Queue Backup

**Symptoms:**
- Queue depth growing
- Videos stuck in "pending"
- Users reporting slow renders

**Diagnostic:**

```bash
# Check queue status
curl https://api.renderowl.com/workers/health | jq

# Check Redis queue depth
redis-cli -u $REDIS_URL LLEN asynq:{queue}:render
redis-cli -u $REDIS_URL LLEN asynq:{queue}:export
```

**Fixes:**

1. **Scale up workers:**
```bash
# Edit coolify-config.json, increase replicas
# Then redeploy
./scripts/deploy.sh production
```

2. **Check for dead workers:**
```bash
# List dead workers
redis-cli -u $REDIS_URL SMEMBERS asynq:dead_workers

# Clear if needed
redis-cli -u $REDIS_URL DEL asynq:dead_workers
```

3. **Retry failed jobs:**
```bash
# List failed jobs
curl https://api.renderowl.com/admin/queue/failed

# Retry specific job
curl -X POST https://api.renderowl.com/admin/queue/retry/<job-id>
```

### Worker Crashes

**Symptoms:**
- Workers restarting frequently
- Jobs failing with "worker timeout"
- Memory errors in logs

**Diagnostic:**

```bash
# Check worker logs
coolify applications logs --uuid <worker-uuid> --tail 100

# Check memory usage
coolify applications get --uuid <worker-uuid>
```

**Fixes:**

1. **Increase memory limit:**
- Update `coolify-config.json` memory allocation
- Redeploy

2. **Check for memory leaks:**
- Review worker code for unclosed resources
- Add memory profiling

3. **Reduce batch size:**
- If processing large videos, reduce concurrent jobs per worker

### Render Failures

**Symptoms:**
- High rate of "failed" renders
- Sentry alerts for Replicate errors
- User complaints

**Diagnostic:**

```bash
# Check recent failed renders
psql $DATABASE_URL -c "SELECT id, error_message, created_at FROM renders WHERE status = 'failed' AND created_at > NOW() - INTERVAL '1 hour' ORDER BY created_at DESC;"

# Check Replicate API status
# (Visit https://status.replicate.com)
```

**Common Causes:**

| Cause | Fix |
|-------|-----|
| Replicate API outage | Wait for service recovery, notify users |
| Invalid video parameters | Validate inputs better |
| Storage (R2) issues | Check R2 bucket permissions |
| Rate limiting | Implement exponential backoff |

---

## Frontend Issues

### Web App Won't Load

**Diagnostic:**

```bash
# Check web container
coolify applications logs --uuid <web-uuid> --tail 50

# Check API connectivity from web
curl https://staging.renderowl.com/api/health
```

**Fixes:**

1. **Check environment variables:**
```bash
coolify applications envs list --uuid <web-uuid>
```

2. **Rebuild with cache clear:**
```bash
coolify deploy --uuid <web-uuid> --force
```

### Build Failures

**Diagnostic:**

```bash
# Build locally to reproduce
cd frontend
npm run build

# Check for TypeScript errors
npm run type-check
```

**Common Issues:**

- Missing environment variables during build
- Node version mismatch
- Out of memory during build (increase build container memory)

---

## Storage (R2) Issues

### Upload Failures

**Diagnostic:**

```bash
# Test R2 connectivity
curl -I $R2_ENDPOINT

# Check bucket permissions
aws s3 ls s3://$R2_BUCKET_NAME --endpoint-url $R2_ENDPOINT
```

**Fixes:**

1. **Verify credentials:**
```bash
coolify applications envs list --uuid <api-uuid> | grep R2
```

2. **Check bucket CORS:**
```bash
aws s3api get-bucket-cors --bucket $R2_BUCKET_NAME --endpoint-url $R2_ENDPOINT
```

3. **Verify bucket policy allows uploads**

---

## Authentication Issues

### Clerk Auth Failures

**Symptoms:**
- Users can't log in
- JWT validation errors
- Session issues

**Diagnostic:**

```bash
# Check Clerk status (visit https://status.clerk.dev)

# Verify Clerk configuration
curl https://api.renderowl.com/health | jq '.auth'
```

**Fixes:**

1. **Verify Clerk keys:**
```bash
coolify applications envs list --uuid <api-uuid> | grep CLERK
coolify applications envs list --uuid <web-uuid> | grep CLERK
```

2. **Check JWT configuration:**
- Ensure `CLERK_SECRET_KEY` is valid
- Verify JWT verification settings

---

## Network/SSL Issues

### SSL Certificate Errors

**Diagnostic:**

```bash
# Check certificate expiry
echo | openssl s_client -servername renderowl.com -connect renderowl.com:443 2>/dev/null | openssl x509 -noout -dates

# Verify certificate chain
echo | openssl s_client -servername renderowl.com -connect renderowl.com:443 -showcerts
```

**Fix:**

Coolify auto-renews certificates. If issues persist:
```bash
# Force certificate refresh
# (Restart the application in Coolify)
coolify applications restart --uuid <web-uuid>
```

### DNS Issues

**Diagnostic:**

```bash
# Check DNS propagation
dig renderowl.com
dig staging.renderowl.com

# Check from different locations
dig @8.8.8.8 renderowl.com
```

---

## Performance Issues

### High CPU Usage

**Diagnostic:**

```bash
# Check resource usage
coolify servers resources --uuid <server-uuid>

# Profile API
curl https://api.renderowl.com/debug/pprof/heap
curl https://api.renderowl.com/debug/pprof/cpu
```

**Fixes:**

1. **Scale horizontally:**
- Increase replica count
- Distribute load

2. **Optimize code:**
- Profile and fix hot paths
- Add caching

### Memory Issues

**Diagnostic:**

```bash
# Check memory usage
docker stats <container-id>

# Check for memory leaks
# (Monitor memory growth over time)
```

**Fix:**

1. **Increase memory allocation:**
```bash
# Update coolify-config.json
# Redeploy
./scripts/deploy.sh production
```

2. **Add memory limits to Node.js:**
```bash
NODE_OPTIONS="--max-old-space-size=4096"
```

---

## Emergency Procedures

### Complete Outage

1. **Check status page:** https://status.renderowl.com
2. **Run health check:** `./scripts/health-check.sh production`
3. **If degraded, consider rollback:** See [rollback-procedures.md](./rollback-procedures.md)
4. **Notify team:** Post in #incidents Slack channel

### Data Corruption

1. **Stop all writes:**
```bash
coolify applications stop --uuid <api-uuid>
```

2. **Assess damage:**
```bash
# Check database consistency
psql $DATABASE_URL -c "SELECT pg_database 'renderowl';"
```

3. **Restore from backup if needed:**
```bash
# See rollback-procedures.md
```

---

## Useful Commands

```bash
# Quick status check
./scripts/health-check.sh production

# View all logs
coolify applications logs --uuid <uuid> --follow

# Execute command in container
coolify applications exec --uuid <uuid> --command "ls -la"

# Database access
psql $DATABASE_URL

# Redis access
redis-cli -u $REDIS_URL

# Restart service
coolify applications restart --uuid <uuid>
```

---

## Escalation Path

| Issue Type | Contact |
|------------|---------|
| Infrastructure | DevOps team |
| Application code | Engineering team |
| Third-party services (Replicate, Clerk) | Vendor support |
| Critical security | Security team + on-call |

---

## Related Documents

- [Deployment Runbook](./deployment-runbook.md)
- [Rollback Procedures](./rollback-procedures.md)
- [Coolify Documentation](https://coolify.io/docs)
