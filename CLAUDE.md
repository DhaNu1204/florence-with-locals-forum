# Florence With Locals - Community Forum

## Project Overview
- **URL:** forum.florencewithlocals.com
- **Repo:** https://github.com/DhaNu1204/florence-with-locals-forum.git

## Tech Stack
- **Frontend:** Next.js 14 (App Router) with TypeScript
- **Styling:** Tailwind CSS v3
- **Backend/DB/Auth/Storage:** Supabase
- **Rich Text Editor:** Tiptap
- **Email:** Resend
- **Hosting:** Vercel
- **Analytics:** Plausible (privacy-friendly, GDPR compliant)

## Architecture Rules
- Use App Router (`src/app/`) with server components by default
- Mark client components explicitly with `"use client"`
- All database queries go through Supabase client in `src/lib/supabase/`
- Use Row Level Security (RLS) on every Supabase table
- Server-side render all public pages (categories, threads) for SEO
- API routes in `src/app/api/` for server-only operations (uploads, webhooks)
- TypeScript strict mode — no `any` types

## Folder Structure
```
src/
  app/              → Pages and API routes (App Router)
  components/
    ui/             → Reusable primitives (Button, Input, Card, Modal, Avatar)
    forum/          → Forum-specific (ThreadCard, PostItem, CategoryCard, ReplyForm)
    editor/         → Tiptap rich text editor components
    photos/         → PhotoUploader, Gallery, Lightbox
    layout/         → Navbar, Sidebar, Footer, Breadcrumbs
  lib/
    supabase/       → Supabase client (browser), server client, middleware
    utils/          → Helpers (slugify, formatDate, sanitizeHtml, truncate)
    constants/      → Categories, badges, reputation config
    hooks/          → Custom React hooks
  types/            → TypeScript interfaces and types
supabase/
  migrations/       → SQL migration files (numbered sequentially)
  seed.sql          → Default categories and admin user
public/             → Static assets, favicon, OG images
```

## Design System

### Colors
| Name         | Hex       | Tailwind Key    |
|--------------|-----------|-----------------|
| Tuscan Brown | `#5D4037` | `tuscan-brown`  |
| Terracotta   | `#C75B39` | `terracotta`    |
| Olive Green  | `#6B8E23` | `olive-green`   |
| Warm Cream   | `#FFF8E7` | `warm-cream`    |
| Light Stone  | `#F5F0E8` | `light-stone`   |
| Dark Text    | `#2C2C2C` | `dark-text`     |

### Typography
- **Headings:** Georgia or Playfair Display (serif)
- **Body:** Inter or system font stack (sans-serif)

### Design Principles
- Warm, inviting, Tuscan-inspired aesthetic
- Mobile-first responsive design
- Related but distinct look from the main florencewithlocals.com site

## Naming Conventions
- **Components:** PascalCase (`ThreadCard.tsx`)
- **Utilities:** camelCase (`formatDate.ts`)
- **Database tables:** snake_case (`post_likes`)
- **CSS classes:** Tailwind utilities only, no custom CSS files
- **Environment variables:** `NEXT_PUBLIC_` prefix for client-safe vars

## Security
- Sanitize all user HTML input server-side before storage
- RLS policies on every table
- Rate limit new users (< 24hrs old): max 3 posts/hour
- CSRF protection on all mutations
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to client

## GDPR (Required — EU business)
- Cookie consent banner with granular controls
- Privacy policy page
- User data export capability
- Right to deletion (full account + content removal)
- Cookie-free analytics (Plausible)

## SEO
- SSR all public pages
- Dynamic meta tags per page
- JSON-LD `DiscussionForumPosting` schema on threads
- Dynamic OG images via `@vercel/og`
- XML sitemap at `/sitemap.xml`
- Clean URLs: `/c/[category-slug]`, `/t/[thread-slug]`, `/u/[username]`

## URL Structure
| Route Pattern         | Description              |
|-----------------------|--------------------------|
| `/`                   | Home / forum landing     |
| `/c/[category-slug]`  | Category thread listing  |
| `/t/[thread-slug]`    | Thread detail + replies  |
| `/u/[username]`       | User profile             |
| `/auth/login`         | Login page               |
| `/auth/signup`        | Signup page              |
| `/auth/callback`      | Supabase OAuth callback  |
| `/settings`           | User settings            |
| `/admin`              | Admin dashboard          |
| `/search`             | Search results           |
| `/sitemap.xml`        | SEO sitemap              |

## Commands
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint check
npm run type-check   # TypeScript check (tsc --noEmit)
```

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY=       # Supabase service role key (server-only!)
NEXT_PUBLIC_SITE_URL=            # https://forum.florencewithlocals.com
RESEND_API_KEY=                  # Resend email API key
PLAUSIBLE_DOMAIN=                # forum.florencewithlocals.com
```
