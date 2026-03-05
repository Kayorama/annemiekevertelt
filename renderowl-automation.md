# RenderOwl Development Automation

## 24/7 Build Pipeline

### Heartbeat Configuration
File: `HEARTBEAT.md` in workspace root

Every 30 minutes, check:
1. Subagent task queue
2. Deployment status on Coolify
3. Test results from staging
4. GitHub PR status

### Cron Jobs (via OpenClaw cron)

```
# Every hour - check for completed subagent tasks and spawn next phase
0 * * * * renderowl-check-progress

# Every 6 hours - deploy staging if tests pass
0 */6 * * * renderowl-deploy-staging

# Daily at 2 AM - run full test suite
0 2 * * * renderowl-test-suite

# Weekly - dependency updates
0 3 * * 0 renderowl-update-deps
```

### Auto-Deployment Rules

**Staging (staging.renderowl.com):**
- Auto-deploy on: Push to `develop` branch
- Tests must pass: Unit + Integration
- Browser tests: Critical paths (auth, video creation, export)

**Production (renderowl.com):**
- Manual approval required
- Deploy on: Merge to `main` + approval
- Full test suite must pass
- Performance benchmarks checked

### Notification Triggers

- Build failure → Immediate alert
- Deployment success → Summary log
- Test failure → Block pipeline + alert
- 24h no activity → Check for blockers

## Subagent Task Queue

Current queue managed in: `~/Projects/renderowl/implementation/task-queue.json`

Status: ACTIVE BUILD PHASE
