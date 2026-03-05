# RenderOwl 24/7 Automation Checklist

Run these checks every 30 minutes:

## Build Phase Tasks
- [ ] Check subagent completion status
- [ ] Review new code commits
- [ ] Run tests on latest changes
- [ ] Deploy to staging if green
- [ ] Update task queue

## Monitoring
- [ ] Check Coolify deployment status
- [ ] Verify staging.renderowl.com health
- [ ] Check error logs (Sentry)
- [ ] Monitor credit usage patterns

## Blocker Detection
- [ ] Stuck subagents (>2h no progress)
- [ ] Failed deployments
- [ ] Test suite failures
- [ ] Dependency issues

Next action: Spawn implementation subagents for Phase 1
