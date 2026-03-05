---
name: persistent-memory
version: 1.0.0
description: "Always-on persistent memory system with tiered architecture. Captures facts immediately, never waits for compaction."
author: Kayorama
keywords: [memory, persistent, always-on, tiered, context, continuity]
metadata:
  openclaw:
    emoji: "📝"
---

# Persistent Memory Skill 📝

**Always-on memory system.** Captures facts immediately, never waits for end-of-session. Tiered architecture for optimal context retrieval.

## Architecture

```
MEMORY.md ─────── Core identity (Kay, working style, preferences)
    │
memory/
├── YYYY-MM-DD.md ─── Daily running log (append-only)
├── projects/
│   └── PROJECT-NAME.md ─── One per active project
├── people/
│   └── NAME.md ─── One per person/collaborator
└── topics/
    └── TOPIC.md ─── Recurring domains
```

## Trigger: Always-On

This skill runs **continuously throughout every session**, not just at compaction or end-of-session.

## File Structure

### MEMORY.md — Core Identity
**Location:** `workspace/MEMORY.md`

Contains:
- Who Kay is (name, studio, location, role)
- Working style (fast-moving, high standards, multi-project)
- Preferences (tools, workflows, communication style)
- Recurring tools (n8n, AI tools, 3D printer)
- Life context (Netherlands, creative technologist)

**Rules:**
- Update in place, never let it go stale
- No hard line limit — keep comprehensive and accurate
- Check before writing to avoid duplicates

### memory/YYYY-MM-DD.md — Daily Log
**Location:** `workspace/memory/2026-03-05.md`

Contains everything that happened, was decided, or was learned today.

**Rules:**
- Append-only during the day
- Cross-reference project files when relevant
- Capture tasks completed and outcomes reached

### memory/projects/PROJECT-NAME.md — Project Files
**Location:** `workspace/memory/projects/renderowl.md`

Created automatically on first meaningful project discussion.

Contains:
- Goal
- Stack
- Current status
- Key decisions
- File paths
- Blockers
- Open questions

**Rules:**
- Update in real time as project evolves
- Mark stale/completed as `[archived]` in filename
- Cross-reference from daily logs

### memory/people/NAME.md — People Files
**Location:** `workspace/memory/people/client-name.md`

One file per recurring person, client, or collaborator.

Contains:
- Contact context
- Relationship details
- History of interactions

### memory/topics/TOPIC.md — Topic Files
**Location:** `workspace/memory/topics/n8n-automations.md`

For recurring domains that don't fit a single project.

Examples:
- `networking.md`
- `n8n-automations.md`
- `photography-clients.md`

## Memory Capture Rules

Capture **immediately** — do not wait for compaction, end of session, or explicit instruction.

| Fact Type | Destination | Timing |
|-----------|-------------|--------|
| Kay's preferences, working style | MEMORY.md | Immediately |
| Decision, direction, approach agreed | Project file + daily log | Immediately |
| Project name, tech stack, file path, config | Project file | Immediately |
| Task completed, outcome reached | Daily log + project file | Immediately |
| New person/collaborator mentioned | people/NAME.md | Immediately |
| Recurring domain/topic | topics/TOPIC.md | On demand |

## Consistency Rules

1. **Before writing any new fact**, check if it already exists to avoid duplicates
2. **If an entry is outdated**, update it in place rather than appending a conflicting version
3. **Mark stale/completed projects** as `[archived]` in the filename rather than deleting
4. **Cross-reference** between files when relevant (daily log links to project file)

## On Session Start

1. Read MEMORY.md
2. Read today's daily log (memory/YYYY-MM-DD.md)
3. Read project file(s) relevant to current conversation
4. Briefly confirm what context was loaded

## On Session End or /new

1. Final sweep — capture anything from current session not yet written
2. Update project file status if anything changed
3. Commit all memory files to git

## Implementation

### Read at Session Start

```
read: ~/.openclaw/workspace/MEMORY.md
read: ~/.openclaw/workspace/memory/YYYY-MM-DD.md  (today's date)
read: ~/.openclaw/workspace/memory/projects/PROJECT-NAME.md  (if relevant)
```

### Write During Session

```
# Update MEMORY.md (preferences, working style)
edit: ~/.openclaw/workspace/MEMORY.md

# Append to daily log
text: >> ~/.openclaw/workspace/memory/YYYY-MM-DD.md

# Create/update project file
write: ~/.openclaw/workspace/memory/projects/PROJECT-NAME.md
```

### Commit on End

```bash
cd ~/.openclaw/workspace
git add -A
git commit -m "Memory update: [description]"
```

## Example MEMORY.md

```markdown
# MEMORY.md - Curated Memories

## Who I Am
- **Name:** Slothy
- **Emoji:** 🦥
- **Nature:** AI assistant, partner in creative work
- **Vibe:** Direct, honest, useful, not performative

## Who Kay Is
- **Name:** Kay
- **Studio:** Kayorama (creative studio)
- **Location:** Netherlands (Europe/Amsterdam timezone)
- **Role:** Creative technologist
- **Work:** Photography, video, IT, web development
- **Style:** Fast-moving, multi-project, high standards, "proper but not slow"
- **Stack:** n8n for automation, AI tools, 3D printer

## Our Relationship
- Partnership in builds, chaos, and 2AM ideas
- I should learn Kay's patterns over time
- Be direct, be honest, be useful, don't be boring

## Important Notes
- Memory files got lost/missing - FIXED: now committed to git
- Kay expects continuity - using git commits to survive resets
- RenderOwl is the first major 24/7 project

## Active Projects
- **RenderOwl** - AI video generation SaaS
  - Stack: Go/Gin, Next.js, PostgreSQL, Asynq, Replicate, Coolify
  - Status: Phase 3 in progress
  - File: memory/projects/renderowl.md
```

## Example Daily Log

```markdown
# 2026-03-05 - RenderOwl Day 1

## Identity Established
- Re-established after memory loss
- Set up proper git commits for MEMORY.md

## Today's Work
### Phase 1 Complete (OpenClaw k2p5 subagents)
- Backend: Replicate API, hardened workers
- Frontend: Timeline drag-drop, templates
- DevOps: Docker prod, Coolify, CI/CD
- Pipeline: Asynq workers, video render flow

### Phase 2 Complete (OpenClaw k2p5 subagents)
- Backend: Clerk auth, credit system, rate limiting
- Frontend: Export flow (SSE), auth UI, undo/redo
- Integration: YouTube/TikTok OAuth, R2 storage
- QA: 47+ tests passing

### Phase 3 In Progress (Claude Code ACP agents)
- Backend: Stripe payments, API polish
- Frontend: UX polish, performance
- Deploy: Coolify production
- E2E: End-to-end testing

## Key Technical Achievements
- Claude Code ACP integration working
- 24/7 build pipeline established
- Comparison study: OpenClaw k2p5 vs Claude Code
```

## Example Project File

```markdown
# RenderOwl

## Goal
AI video generation SaaS — similar to Blotato

## Stack
- Backend: Go/Gin + PostgreSQL + Asynq
- Frontend: Next.js 15 + TypeScript
- AI: Replicate API for video generation
- Auth: Clerk
- Storage: Cloudflare R2
- Deployment: Coolify

## Current Status
Phase 3: Integration & Polish (In Progress)

## Key Decisions
- Using Asynq instead of Celery (Go-native)
- Clerk over Auth0 (better Next.js integration)
- Testing Claude Code ACP vs OpenClaw k2p5

## File Paths
- Backend: ~/Projects/renderowl/backend
- Frontend: ~/Projects/renderowl/frontend
- DevOps: ~/Projects/renderowl/implementation

## Blockers
None currently

## Open Questions
- Which performs better: Claude Code or k2p5?
```

## Git Integration

All memory files should be committed to git to survive workspace resets:

```bash
# Initial setup
git add MEMORY.md memory/
git commit -m "Initial memory structure"

# Daily commits
git add -A
git commit -m "Memory: RenderOwl Phase 2 complete"
```

## Backup Strategy

If git is not available, copy to secondary location:

```bash
# Backup to home directory
cp -r ~/.openclaw/workspace/memory ~/memory-backup/
cp ~/.openclaw/workspace/MEMORY.md ~/
```
