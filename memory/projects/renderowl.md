# RenderOwl

## Goal
AI video generation SaaS — similar to Blotato. Core features: AI video from text, templates, social auto-posting, timeline editor.

## Stack
- **Backend:** Go 1.24 + Gin + PostgreSQL + Asynq queue
- **Frontend:** Next.js 15 + TypeScript + Tailwind
- **AI:** Replicate API (Wan T2V, LTX-Video)
- **Auth:** Clerk JWT
- **Storage:** Cloudflare R2
- **Queue:** Asynq (Redis-based)
- **Deployment:** Coolify

## Current Status
**Phase 3: Integration & Polish (In Progress)**
- ✅ Phase 1: Foundation (backend, frontend, devops, pipeline)
- ✅ Phase 2: Core Features (auth, credits, social APIs, QA)
- 🔄 Phase 3: Stripe live, production deploy, E2E testing

## Key Decisions
- Asynq over Celery (Go-native, better performance)
- Clerk over Auth0 (Next.js SDK, better DX)
- Testing Claude Code ACP vs OpenClaw k2p5 subagents

## File Paths
| Component | Location |
|-----------|----------|
| Backend | ~/Projects/renderowl/backend |
| Frontend | ~/Projects/renderowl/frontend |
| DevOps | ~/Projects/renderowl/implementation |
| E2E Tests | ~/Projects/renderowl/e2e |

## Blockers
None

## Open Questions
- Claude Code vs k2p5: which performs better for this codebase?

## Related
- Daily Log: memory/2026-03-05.md

## Notes
- Persistent memory skill created and tested successfully
- All memory now captured immediately, never lost to resets
- Git commits ensure durability
