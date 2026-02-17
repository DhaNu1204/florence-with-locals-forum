# Florence With Locals Forum

A community forum for travelers and locals to share tips, ask questions, and connect about Florence, Italy.

**Live:** [forum.florencewithlocals.com](https://forum.florencewithlocals.com)

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v3
- **Database / Auth / Storage:** Supabase
- **Rich Text Editor:** Tiptap
- **Email:** Resend
- **Analytics:** Google Analytics GA4 (GDPR compliant, consent-gated)
- **Hosting:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A [Supabase](https://supabase.com) project

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/DhaNu1204/florence-with-locals-forum.git
   cd florence-with-locals-forum
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in your Supabase credentials and other values.

4. Run database migrations:
   ```bash
   npx supabase db push
   ```

5. Start the dev server:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | TypeScript check (tsc --noEmit) |

## Project Structure

```
src/
  app/              Pages and API routes (App Router)
  components/
    ui/             Reusable primitives (Button, Input, Card, Modal, Avatar)
    forum/          Forum-specific (ThreadCard, PostItem, ReplyForm, ReportModal)
    editor/         Tiptap rich text editor
    gallery/        PhotoGrid, Lightbox
    layout/         Navbar, Footer, CookieConsent
    notifications/  NotificationBell, NotificationItem
    search/         SearchInput
  lib/
    supabase/       Supabase clients (browser + server) and auth context
    utils/          Helpers (slugify, formatDate, sanitizeHtml, rateLimit)
    validations/    Zod validation schemas
    hooks/          Custom React hooks
  types/            TypeScript type definitions
supabase/
  migrations/       SQL migration files
  seed.sql          Default categories and admin user
```

## Key Features

- **Forum:** Categories, threads, replies with rich text editing
- **User Profiles:** Customizable profiles with avatar, bio, reputation system
- **Photo Gallery:** Upload, browse, and view community photos with lightbox
- **Search:** Full-text search across threads and posts
- **Notifications:** Real-time notification bell with mention detection
- **Moderation:** Admin dashboard with reports, user management, category management
- **SEO:** SSR, JSON-LD structured data, dynamic OG images, XML sitemap
- **GDPR Compliance:** Cookie consent, privacy policy, data export, account deletion

## Environment Variables

See `.env.local.example` for the full list. Key variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `NEXT_PUBLIC_SITE_URL` | Public site URL |
| `RESEND_API_KEY` | Resend email API key |

## Deployment

This project is configured for Vercel deployment with `output: 'standalone'`.

1. Push to GitHub
2. Connect repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy

## License

Private repository. All rights reserved.
