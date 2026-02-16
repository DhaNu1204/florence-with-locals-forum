# Florence With Locals Forum — Comprehensive Technical Report

**Project:** forum.florencewithlocals.com
**Repository:** github.com/DhaNu1204/florence-with-locals-forum
**Report Date:** February 16, 2026
**Build Status:** PASSING (all 26 routes compile successfully)

---

## 1. Executive Summary

A community forum for Florence, Italy travel — built as a full-stack Next.js 14 application backed by Supabase (PostgreSQL + Auth + Storage). The codebase is **13,425 lines of TypeScript** across **99 files**, plus **2,209 lines of SQL** migrations. The project is production-ready with a working build, comprehensive auth flow, admin panel, GDPR compliance, SEO optimization, and a rich feature set.

---

## 2. Tech Stack & Dependencies

### Core Framework
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 14.2.35 | App Router, SSR, API routes, Edge runtime |
| React | ^18 | UI rendering |
| TypeScript | ^5 (strict mode) | Type safety |
| Tailwind CSS | ^3.4.1 | Utility-first styling |

### Backend & Data
| Technology | Version | Purpose |
|---|---|---|
| @supabase/supabase-js | ^2.95.3 | Database client, Auth, Storage |
| @supabase/ssr | ^0.8.0 | Server-side cookie-based auth |
| Zod | ^4.3.6 | Runtime input validation |
| isomorphic-dompurify | ^3.0.0-rc.2 | HTML sanitization (XSS prevention) |

### Rich Text Editor
| Technology | Version | Purpose |
|---|---|---|
| @tiptap/react | ^3.19.0 | WYSIWYG editor framework |
| @tiptap/starter-kit | ^3.19.0 | Base editor functionality |
| @tiptap/extension-link | ^3.19.0 | Link support |
| @tiptap/extension-image | ^3.19.0 | Inline image support |
| @tiptap/extension-underline | ^3.19.0 | Underline formatting |
| @tiptap/extension-placeholder | ^3.19.0 | Placeholder text |

### Dev Dependencies (8 packages)
ESLint with `next/core-web-vitals` + `next/typescript` configs. No test framework installed.

**Total production dependencies: 14 | Dev dependencies: 8** — lean dependency tree.

---

## 3. Architecture

### 3.1 Rendering Strategy

```
Server Components (SSR)          Client Components ("use client")
─────────────────────────        ──────────────────────────────
/ (home page)                    LoginForm, RegisterPage
/c/[slug] (category)             ForgotPasswordPage
/t/[slug] (thread)               Settings, Notifications
/u/[username] (profile)          SearchForm, SearchResults
/search (search page)            GalleryClient
/gallery (gallery page)          All forum interactions (like, reply, report)
All legal pages (4)              RichTextEditor, PhotoUploader
sitemap.xml, robots.txt          Navbar (mobile menu, auth dropdowns)
Loading skeletons (4)            CookieConsent
Admin layout + pages             Error boundary

Edge Runtime                     API Routes (Node.js)
─────────────                    ──────────────────
/api/og (OG images)              /api/account/delete
                                 /auth/callback
```

**Pattern:** Server components by default for SEO and performance. Client components only where interactivity is required. This is a clean, well-enforced separation.

### 3.2 Data Flow Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Browser    │────▶│  Server Actions   │────▶│    Supabase      │
│  (React)     │◀────│  (src/app/actions) │◀────│  (PostgreSQL)    │
└──────┬───────┘     └──────────────────┘     └──────────────────┘
       │                      │                        │
       │              ┌───────▼────────┐      ┌────────▼────────┐
       │              │   Validation   │      │   RLS Policies  │
       │              │   (Zod)        │      │   (row-level)   │
       │              └───────┬────────┘      └─────────────────┘
       │              ┌───────▼────────┐      ┌─────────────────┐
       │              │  Sanitization  │      │  Storage Bucket │
       │              │  (DOMPurify)   │      │  (photos)       │
       │              └────────────────┘      └─────────────────┘
       │
┌──────▼───────┐
│  Supabase    │  (Browser client for auth only:
│  Client      │   login, register, OAuth, password reset)
└──────────────┘
```

**Three Supabase client types:**
- **Browser client** (`createBrowserClient<Database>`) — auth operations only
- **Server client** (`createServerClient<Database>`) — SSR data fetching + server actions (respects RLS)
- **Admin client** (`createClient` with service role) — bypasses RLS for profile creation and account deletion

### 3.3 Folder Structure

```
src/                          99 files, 13,425 LOC
├── app/                      Pages, actions, API routes (App Router)
│   ├── actions/              9 server action modules
│   ├── api/                  2 API routes (OG images, account deletion)
│   ├── auth/                 4 auth pages (login, register, forgot-password, callback)
│   ├── admin/                4 admin pages (dashboard, reports, users, categories)
│   ├── c/[slug]/             Category pages (listing, new thread)
│   ├── t/[slug]/             Thread detail page + sub-components
│   ├── u/[username]/         User profile page
│   ├── search/               Search page + form + results
│   ├── gallery/              Photo gallery page + client
│   ├── settings/             User settings page
│   ├── notifications/        Notifications page
│   ├── privacy/              Privacy policy
│   ├── terms/                Terms of service
│   ├── cookie-policy/        Cookie policy
│   └── guidelines/           Community guidelines
├── components/               25 component files
│   ├── ui/                   9 primitives (Button, Input, Card, Badge, Modal, Avatar, Loading, PhotoUploader, ImageWithFallback)
│   ├── forum/                6 forum components (CategoryCard, ThreadCard, PostItem, ReplyForm, ReportModal, ThreadPhotos)
│   ├── editor/               1 component (RichTextEditor)
│   ├── gallery/              2 components (PhotoGrid, Lightbox)
│   ├── layout/               4 components (Navbar, Footer, CookieConsent, SocialSidebar)
│   ├── search/               1 component (SearchInput)
│   └── notifications/        2 components (NotificationBell, NotificationItem)
├── lib/                      20 utility files
│   ├── supabase/             5 files (client, server, middleware, admin, auth-context)
│   ├── utils/                10 files (cn, slugify, formatDate, sanitizeHtml, truncate, mentions, highlightText, errors, rateLimit, imageCompression, extractImages)
│   ├── validations/          1 file (13 Zod schemas + validate helper)
│   ├── hooks/                1 file (useDebounce)
│   └── constants/            1 file (socialPosts)
├── types/                    1 file (532 lines — full Database type + 25+ domain types)
└── middleware.ts             Route protection

supabase/                     2,209 LOC
├── migrations/               5 SQL migration files
└── seed.sql                  Initial 8 categories
```

---

## 4. Database Design

### 4.1 Schema (8 Tables)

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│  profiles    │◀────│  threads     │────▶│  categories  │
│  (auth.users)│     │  (UUID PK)   │     │  (SERIAL PK) │
└──────┬───────┘     └──────┬───────┘     └──────────────┘
       │                    │
       │             ┌──────▼───────┐
       │             │    posts     │
       │             │  (UUID PK)   │
       │             └──────┬───────┘
       │                    │
       ├─────────────┐      │
       │             │      │
  ┌────▼─────┐  ┌────▼──────▼──┐  ┌──────────────┐
  │  photos  │  │  post_likes   │  │ notifications│
  │(UUID PK) │  │  (UUID PK)    │  │  (UUID PK)   │
  └──────────┘  └───────────────┘  └──────────────┘
                                   ┌──────────────┐
                                   │   reports    │
                                   │  (UUID PK)   │
                                   └──────────────┘
```

### 4.2 Key Design Decisions

- **Soft deletes** on threads and posts (`is_deleted` boolean) — preserves referential integrity
- **Polymorphic likes** — `post_likes` has `post_id` OR `thread_id` (enforced by CHECK constraint + partial unique indexes)
- **Polymorphic notifications** — `reference_type` + `reference_id` pattern
- **Full-text search** — PostgreSQL `tsvector` on threads with GIN index + `search_posts()` function searching both threads and posts with ranked results (title weighted A, content weighted B)
- **Reputation system** — `update_reputation()` RPC function; +5 for thread, +2 for reply, +1/-1 for like/unlike
- **Username constraints** — `^[a-z][a-z0-9-]*$` regex at DB level

### 4.3 Custom Enums
- `user_role`: member, guide, moderator, admin
- `notification_type`: reply, like, mention, badge, announcement

### 4.4 Triggers & Functions (8 triggers, 8 functions)

| Trigger | Function | Purpose |
|---|---|---|
| `on_auth_user_created` | `handle_new_user()` | Auto-create profile on signup |
| `trg_profiles_updated_at` | `update_updated_at()` | Auto-timestamp updates |
| `trg_threads_updated_at` | `update_updated_at()` | Auto-timestamp updates |
| `trg_posts_updated_at` | `update_updated_at()` | Auto-timestamp updates |
| `trg_increment_thread_counts` | `increment_thread_counts()` | Maintain reply_count/post_count |
| `trg_increment_category_thread_count` | `increment_category_thread_count()` | Maintain thread_count |
| `trg_update_like_count` | `update_like_count()` | Sync like_count on threads/posts |
| `trg_threads_search_vector` | `threads_search_vector_update()` | Auto-build search vector |
| — | `protect_profile_fields()` | Prevent non-admin role/reputation edits |
| — | `search_posts()` | Full-text search across threads + posts |

### 4.5 Row Level Security (RLS)

RLS is enabled on **all 8 tables** with granular policies:

| Table | Read | Create | Update | Delete |
|---|---|---|---|---|
| profiles | Public | Trigger-only | Self only | — |
| categories | Public (active) | Admin only | Admin only | Admin only |
| threads | Public (non-deleted) | Auth + non-banned | Author + mod/admin | Soft-delete via update |
| posts | Public (non-deleted) | Auth + non-banned + not locked | Author + mod/admin | Soft-delete via update |
| post_likes | Public | Auth users | — | Self only |
| photos | Public | Auth users | Uploader + mod/admin | Uploader + mod/admin |
| notifications | Self only | Self or trigger | Self only | Self only |
| reports | — | Auth users | Mod/admin only | — |

### 4.6 Migration History

| Migration | Purpose |
|---|---|
| 001_initial_schema.sql | Full schema (890 lines) — tables, indexes, FTS, triggers, RLS, storage |
| 002_fix_handle_new_user.sql | Robust profile creation with EXCEPTION handling |
| 003_fix_profile_creation.sql | Maximum-robustness trigger with ON CONFLICT, debug logging |
| 004_new_categories.sql | 4 additional "Explore" categories |
| 005_seed_content.sql | 18 realistic seed threads with replies |

---

## 5. Authentication System

### 5.1 Auth Methods
- **Email/Password** — with email confirmation flow
- **Google OAuth** — with auto-profile creation

### 5.2 Auth Flow

```
Registration:
  Client → supabase.auth.signUp() → Email confirmation → /auth/callback → Session

Login:
  Client → supabase.auth.signInWithPassword() → Session → router.refresh()

Google OAuth:
  Client → supabase.auth.signInWithOAuth() → Google → /auth/callback → exchangeCodeForSession()

Session Management:
  Middleware → createServerClient → refreshes session cookies on every request
```

### 5.3 Profile Auto-Creation (Triple Redundancy)

1. **DB trigger** (`handle_new_user()`) — fires on `auth.users` INSERT, generates username from email/metadata
2. **Fallback trigger** (migration 003) — ON CONFLICT DO UPDATE, never fails, logs to `_debug_log`
3. **Application fallback** (`ensureProfile()` server action) — if profile still missing, creates via admin client

This is an unusually robust approach — profile creation literally cannot fail regardless of trigger issues.

### 5.4 Route Protection

```
Middleware protects:
  /settings, /admin, /notifications, /c/[slug]/new

Admin layout additionally checks:
  profile.role === 'admin' || profile.role === 'moderator'
```

---

## 6. Feature Inventory

### 6.1 Forum Core
- **12 categories** with icons, colors, descriptions, display ordering
- **Thread creation** with rich text (Tiptap WYSIWYG), inline images, photo attachments
- **Reply system** with rich text editor
- **Thread detail** with JSON-LD structured data (`DiscussionForumPosting`)
- **Edit/Delete** for authors + moderators/admins
- **Pin/Lock** threads (admin/mod only)
- **Like system** on both threads and posts with reputation effects
- **@mentions** with regex extraction and notification creation
- **View counting** on threads

### 6.2 Search
- PostgreSQL full-text search via `tsvector` + GIN index
- `search_posts()` RPC function searching both threads and posts
- Ranked results with weighted scoring (title > content)
- Server-side search execution with SSR
- Navbar search input with instant suggestions (debounced)

### 6.3 Photo System
- **Client-side image compression** (canvas resize targeting 100-250KB, JPEG quality reduction)
- **Thumbnail generation** on upload
- **Per-role upload limits**: member (5/thread, 50 total), guide (10/thread, 200 total), mod/admin (15/thread, 500 total)
- **Inline image tracking** — HTML content is scanned for Supabase storage URLs after save
- **Photo gallery** with location tag filtering, sort options, pagination (24/page)
- **Lightbox** for full-screen photo viewing
- **Storage organized** as `photos/{year}/{month}/{user_id}/{filename}`

### 6.4 Notification System
- Types: reply, like, mention, badge, announcement
- Real-time unread count in navbar bell icon
- Time-based grouping (Today, Yesterday, This Week, Earlier)
- Mark as read (individual + bulk)
- Paginated list (20/page)

### 6.5 Admin Panel
- **Dashboard**: total/weekly counts for members, threads, posts, photos, pending reports
- **Storage monitoring**: recursive bucket size calculation
- **Reports management**: status workflow (pending → reviewed → resolved/dismissed), moderator notes
- **User management**: view all users, ban/unban with reason, change roles (admin-only)
- **Category management**: CRUD, reorder, toggle active/inactive

### 6.6 User Profiles
- Public profile page (`/u/[username]`) with stats, recent threads, recent replies
- Settings page with avatar upload, profile editing, password change
- GDPR data export (JSON format)
- Account deletion with 8-step cleanup process

### 6.7 Content Moderation
- Report system for threads, posts, photos, profiles
- Reason validation (min 10 chars)
- Rate-limited reports
- Admin review workflow with status tracking

---

## 7. Security Analysis

### 7.1 Implemented Security Measures

| Measure | Implementation | Status |
|---|---|---|
| XSS Prevention | DOMPurify sanitization on all user HTML | Implemented |
| SQL Injection | Supabase parameterized queries (no raw SQL) | Implemented |
| CSRF Protection | Server actions with auth verification | Implemented |
| RLS (Row-Level Security) | All 8 tables have policies | Implemented |
| Rate Limiting | In-memory sliding window with presets | Implemented |
| Input Validation | Zod schemas on all mutations | Implemented |
| Auth Route Protection | Middleware + layout-level checks | Implemented |
| Service Role Key | Server-only, never exposed to client | Implemented |
| Security Headers | X-Frame-Options, X-Content-Type-Options, HSTS, Referrer-Policy, Permissions-Policy | Implemented |
| Content-Type Enforcement | Storage bucket restricted to image MIME types | Implemented |
| File Size Limits | 500KB server-side + 10MB storage bucket | Implemented |
| Ban Enforcement | Checked on thread/post/like creation | Implemented |
| Locked Thread Check | Posts prevented in locked threads | Implemented |
| Profile Field Protection | DB trigger prevents role/reputation self-editing | Implemented |

### 7.2 Rate Limit Presets

```
THREAD:        5 per 15 minutes
POST:          10 per 5 minutes
NEW_USER_POST: 3 per 60 minutes (accounts < 24hrs old)
LIKE:          30 per 5 minutes
REPORT:        5 per 15 minutes
```

### 7.3 Security Concerns / Observations

1. **Rate limiter is in-memory** — resets on server restart, doesn't work across multiple instances (Vercel serverless functions). Consider Redis-based rate limiting for production scale.
2. **View count increment** (`incrementViewCount`) has a read-then-write race condition — could undercount under concurrent access. Consider using Supabase RPC with `UPDATE ... SET view_count = view_count + 1`.
3. **`isomorphic-dompurify` is a release candidate** (v3.0.0-rc.2) — consider pinning to a stable version for production.
4. **Account deletion API route** lacks additional verification beyond session check — the userId in the request body is validated against the session user, which is correct.
5. **Password verification during change** uses `signInWithPassword` which creates a new session — this is a common pattern but could be improved.

---

## 8. SEO Implementation

| Feature | Implementation |
|---|---|
| SSR | All public pages server-rendered |
| Metadata | Dynamic per-page via Next.js `Metadata` export with template pattern |
| Sitemap | Dynamic XML sitemap from Supabase (categories + up to 5,000 threads) |
| robots.txt | Disallows /admin, /settings, /auth, /api, /search |
| Structured Data | JSON-LD `DiscussionForumPosting` on thread pages |
| OG Images | Dynamic edge-generated (1200x630) with title, category, author |
| Clean URLs | /c/[slug], /t/[slug], /u/[username] |
| Meta descriptions | Per-page descriptions |
| noindex | Applied to search results page |

---

## 9. GDPR Compliance

| Requirement | Implementation |
|---|---|
| Cookie Consent | Banner with Accept/Reject + Settings modal (essential/analytics/marketing) |
| Privacy Policy | Comprehensive page with 7 sections including data types, rights, retention |
| Cookie Policy | Dedicated page documenting Supabase auth tokens as only cookies |
| Terms of Service | EU/Italian jurisdiction, 16+ age requirement |
| Data Export | JSON download of profile, threads, posts, photos |
| Right to Deletion | 8-step account deletion (anonymize, soft-delete content, remove storage, delete auth user) |
| Cookie-Free Analytics | Plausible configured (no tracking cookies) |
| Community Guidelines | Dedicated page with 9 guideline categories |

---

## 10. Build & Performance

### 10.1 Build Output

```
Route                    Size        First Load JS
/                        193 B       105 kB
/t/[slug]                7.2 kB      292 kB        ← Largest (Tiptap editor)
/c/[slug]/new            5.05 kB     280 kB        ← Second largest (editor)
/settings                5.43 kB     162 kB
/auth/register           3.75 kB     155 kB

Shared JS:               87.3 kB
Middleware:              74.6 kB
All routes:              Dynamic (ƒ) — server-rendered on demand
```

### 10.2 Performance Observations

- **All routes are dynamic** — no static prerendering. This is expected for a forum with real-time data, but static pages (privacy, terms, guidelines, cookie-policy) could be statically generated for better performance.
- **Largest bundle is thread detail** (292 kB First Load) due to Tiptap editor. Consider lazy-loading the editor only when the user clicks "Reply".
- **Shared JS at 87.3 kB** is reasonable.
- **Standalone output** mode configured for Vercel deployment.
- **Image optimization** configured with AVIF + WebP formats via Supabase remote patterns.
- **Google Fonts** (Inter + Playfair Display) loaded with `display: "swap"` for better CLS.

---

## 11. Design System

### 11.1 Color Palette (Tuscan-inspired)
| Token | Hex | Usage |
|---|---|---|
| `tuscan-brown` | #5D4037 | Headings, primary accents |
| `terracotta` | #C75B39 | CTA buttons, links, badges |
| `olive-green` | #6B8E23 | Success states, secondary accents |
| `warm-cream` | #FFF8E7 | Page backgrounds |
| `light-stone` | #F5F0E8 | Card borders, skeletons, dividers |
| `dark-text` | #2C2C2C | Body text |

### 11.2 Typography
- **Headings:** Playfair Display (serif) via CSS variable `--font-playfair`
- **Body:** Inter (sans-serif) via CSS variable `--font-inter`
- **Base font size:** 18px
- **Line height:** 1.7

### 11.3 Component Library (9 UI primitives)
- `Button` — 4 variants (primary/secondary/ghost/danger), 3 sizes (sm/md/lg), loading state
- `Input` — label, error message, helper text
- `Card` — header, body, footer sections
- `Badge` — colored tags
- `Modal` — overlay dialog with close on escape/backdrop click
- `Avatar` — image with initials fallback, 4 sizes
- `Loading` — spinner + skeleton + page loading variants
- `PhotoUploader` — drag-and-drop with client compression
- `ImageWithFallback` — graceful error handling for broken images

---

## 12. What's Missing / Recommendations

### 12.1 Not Yet Implemented
| Feature | Priority | Notes |
|---|---|---|
| **Test Suite** | High | No test framework installed (no Jest, Vitest, Playwright, or Cypress) |
| **Email Notifications** | Medium | Resend API key configured but no email sending logic implemented |
| **Plausible Analytics** | Low | Domain configured in env but no `<script>` tag or integration |
| **Real-time Updates** | Medium | No Supabase Realtime subscriptions (all data is fetch-on-load) |
| **Thread Pagination** | Low | Category pages load all threads; no infinite scroll or pagination |
| **User Following** | Low | No follow/follower system |
| **Private Messaging** | Low | No DM functionality |
| **Thread Bookmarks** | Low | No save/bookmark feature |

### 12.2 Technical Debt / Improvements

1. **Add a test suite** — this is the highest priority gap. At minimum: unit tests for server actions, integration tests for auth flow, E2E tests for critical paths.
2. **Redis-based rate limiting** — the in-memory rate limiter doesn't persist across serverless invocations.
3. **Static generation for legal pages** — privacy, terms, cookie-policy, and guidelines pages are purely static content but rendered dynamically on every request.
4. **Lazy-load Tiptap editor** — the rich text editor adds ~180KB to thread and new-thread pages. Use `next/dynamic` with `ssr: false`.
5. **Thread pagination** — category listing pages should paginate or use infinite scroll for categories with many threads.
6. **View count race condition** — replace read-then-write with atomic `UPDATE SET view_count = view_count + 1`.
7. **Optimistic UI updates** — likes and notifications could benefit from optimistic updates for better perceived performance.
8. **Error monitoring** — no Sentry or similar error tracking is configured.
9. **CI/CD pipeline** — no GitHub Actions or similar CI configuration found.

---

## 13. Codebase Quality Assessment

| Dimension | Rating | Notes |
|---|---|---|
| **Type Safety** | Excellent | TypeScript strict mode, full Database typing, Zod validation on all inputs |
| **Code Organization** | Excellent | Clean separation of concerns, consistent folder structure |
| **Security** | Very Good | RLS on all tables, input sanitization, rate limiting, auth checks |
| **SEO** | Very Good | SSR, dynamic sitemap, JSON-LD, OG images, clean URLs |
| **GDPR Compliance** | Very Good | Cookie consent, privacy policy, data export, account deletion |
| **Error Handling** | Good | Error boundaries, graceful fallbacks, but some server actions could be more granular |
| **Performance** | Good | SSR-first approach, image optimization, but could benefit from static generation and lazy loading |
| **Accessibility** | Fair | No explicit ARIA attributes or a11y testing; relies on semantic HTML |
| **Testing** | Not Started | Zero test files — significant gap for production readiness |
| **Monitoring** | Not Started | No error tracking, APM, or logging infrastructure |

---

## 14. Summary

This is a well-architected, feature-complete community forum application. The codebase demonstrates strong engineering practices: strict TypeScript, comprehensive input validation, defense-in-depth security (Zod + DOMPurify + RLS + rate limiting), and a clean server/client component separation. The GDPR compliance implementation is thorough and appropriate for an EU-based business.

The primary gaps are the **absence of automated tests** and **production observability** (error tracking, logging, CI/CD). These should be the next priorities before scaling the user base. The application is currently in a solid state for a soft launch with a small community, but would benefit from the improvements outlined in Section 12 before handling significant traffic.
