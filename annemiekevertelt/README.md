# Annemieke Vertelt

Een warme, persoonlijke blog met een boekachtige leeservaring.

## Structuur

- `apps/web/` - Astro 5 frontend
- `apps/cms/` - PayloadCMS backend
- `packages/` - Gedeelde code

## Categorieën

1. **…in columns** — geschreven columns
2. **…verhalen voor kinderen** — verhalen voor kinderen
3. **…hardop** — audio content
4. **…over zichzelf** — over Annemieke

## Tech Stack

- Astro 5 (static site)
- PayloadCMS (admin panel)
- React + Framer Motion (page-turn animaties)
- PostgreSQL
- Resend (nieuwsbrieven)
- Coolify deployment

## Ontwikkeling

```bash
# Start alles
docker-compose up -d

# Of apart
pnpm dev:web    # Astro dev server
pnpm dev:cms    # PayloadCMS dev server
```
