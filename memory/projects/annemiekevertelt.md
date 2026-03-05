# Annemieke Vertelt

## Goal
Personal Dutch-language website for writer Annemieke. Warm, book-like reading experience with newsletter functionality.

## Design Inspiration
- Similar to pauliencornelisse.nl
- Personal name as main header: "Annemieke vertelt…"
- Four category icons/tiles on homepage
- Clean, warm, not corporate
- Tagline: "Mocht je me gemist hebben…"

## Four Sections (completing "Annemieke vertelt…")
1. **…in columns** — written columns (grid of cards, date sorted)
2. **…verhalen voor kinderen** — children's stories (grid of cards, date sorted)
3. **…hardop** — audio content (audio player section)
4. **…over zichzelf** — about herself (life chapters: school, huwelijk, kinderen, carrière)

## Key Features
- **Page-turn animation** — book-like reading experience
- **Card grid layout** — for columns, stories, about sections
- **Audio player** — for hardop section
- **Mailing list** — subscribe with email, admin can send newsletters
- **Admin panel** — simple, non-technical user friendly

## Tech Stack
- **Frontend:** Astro 5 (static site)
- **CMS:** PayloadCMS (already configured)
- **Database:** PostgreSQL
- **Animations:** Framer Motion (page-turn effects)
- **Email:** Resend (already configured)
- **Deployment:** Coolify

## Current Status
🆕 New project — needs full implementation

## File Paths
| Component | Location |
|-----------|----------|
| CMS | ~/.openclaw/workspace/annemiekevertelt/apps/cms/ |
| Web | ~/.openclaw/workspace/annemiekevertelt/apps/web/ |
| Collections | ~/.openclaw/workspace/annemiekevertelt/apps/cms/collections/ |

## Admin Requirements
- Create/edit/delete posts (all 4 sections)
- Upload images and audio
- Publish or save drafts
- View/export mailing list
- Send newsletter emails
- **Simplicity priority** — WordPress-level ease, not dev dashboard

## Content Collections (PayloadCMS)
- Columns
- ChildrensStories
- AudioContent  
- AboutMe (life chapters)
- Subscribers
- NewsletterTemplates
- Media

## Related
- Daily Log: memory/2026-03-05.md
- RenderOwl: memory/projects/renderowl.md (concurrent project)
