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
- **Page-turn animation** — 3D book-opening effect with Framer Motion
- **Card grid layout** — for columns, stories, about sections
- **Audio player** — for hardop section
- **Mailing list** — subscribe with email, admin can send newsletters
- **Admin panel** — simple, non-technical user friendly (PayloadCMS)

## Tech Stack
- **Frontend:** Astro 5 + React + Tailwind
- **CMS:** PayloadCMS (Dutch labels, simplified UX)
- **Animations:** Framer Motion (page-turn, hover effects)
- **Email:** Resend (newsletter system)
- **Database:** PostgreSQL
- **Deployment:** Coolify (ready for deployment)

## Current Status
✅ **COMPLETE** — All features implemented

## Completed Work
| Component | Status |
|-----------|--------|
| Homepage | ✅ Header, tagline, 4 category tiles, newsletter signup |
| Frontend | ✅ 4 section pages, card grids, dynamic routes |
| Page-turn Animation | ✅ 3D book-opening effect, Framer Motion |
| Design System | ✅ Warm palette (creams, browns, gold), serif typography |
| CMS | ✅ Collections (Columns, Stories, Audio, About, Subscribers, Newsletter) |
| Admin UX | ✅ Dutch labels, emoji groups, simplified for non-technical users |
| Audio | ✅ Audio player with progress, volume, controls |
| Email | ✅ Subscription forms, Resend integration, CSV export, test emails |
| Newsletter | ✅ Admin can compose and send newsletters |

## File Paths
| Component | Location |
|-----------|----------|
| Frontend | ~/.openclaw/workspace/annemiekevertelt/apps/web/ |
| CMS | ~/.openclaw/workspace/annemiekevertelt/apps/cms/ |
| Collections | ~/.openclaw/workspace/annemiekevertelt/apps/cms/collections/ |

## Next Steps
- [ ] Deploy to Coolify
- [ ] Add sample content
- [ ] Domain configuration

## Related
- Daily Log: memory/2026-03-05.md
- RenderOwl: memory/projects/renderowl.md (concurrent project)
