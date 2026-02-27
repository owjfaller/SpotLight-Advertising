# CLAUDE.md — SpotLight

This file provides Claude Code with context for working on this project.

## Project Overview

SpotLight is a two-sided marketplace for unconventional advertising spaces. Built with Next.js 14 App Router, Supabase, Tailwind CSS, and shadcn/ui.

## Stack

- **Next.js 14** — App Router, TypeScript, Server Components
- **Supabase** — PostgreSQL, Auth (email + Google OAuth), Storage, Realtime, RLS
- **Tailwind CSS + shadcn/ui** — styling and component library
- **Resend** — transactional email
- **Zod + react-hook-form** — form validation
- **Vercel** — deployment

## Environment Variables

Required in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
NEXT_PUBLIC_SITE_URL
```

## Key Conventions

### Supabase clients
- `lib/supabase/client.ts` — browser client (use in Client Components)
- `lib/supabase/server.ts` — server client using cookies (use in Server Components and API routes)
- Never import the server client in Client Components

### Prices
- Always stored as **integer cents** in the database (`price_cents INT`)
- Use `formatPrice()` from `lib/utils/formatters.ts` for display

### Images
- Upload flow: client calls `POST /api/upload` → gets signed URL → PUTs directly to Supabase Storage
- Never pipe image data through the Next.js server
- Storage bucket: `space-images`

### Auth pattern
- `middleware.ts` refreshes the session on every request
- Dashboard routes require auth — enforced in `app/dashboard/layout.tsx`
- Owner-only routes additionally check `can_be_owner` on the profile

### Roles
- `can_be_owner` and `can_be_advertiser` are boolean flags on the `profiles` table
- A user can have both flags set (dual role)
- Set during onboarding at `/onboarding`

### Search & filters
- Full-text search via `fts` TSVECTOR generated column on `ad_spaces`
- All filter state lives in URL search params (not client state)
- `app/spaces/page.tsx` is a Server Component that reads `searchParams`

### Realtime
- `messages` table subscribed via Supabase Realtime in `MessageThread` component
- Subscription is set up in a `useEffect` in the Client Component

## Database Tables

- `profiles` — extends auth.users
- `ad_spaces` — listing entity (space_type, status, location, pricing, availability)
- `space_images` — images linked to a space
- `inquiries` — booking inquiries between advertiser and owner
- `messages` — threaded messages on an inquiry
- `notifications` — in-app notification system

## File Structure Highlights

```
app/
  (auth)/login, signup, callback    # Auth pages + OAuth callback
  onboarding/                       # Role selection after signup
  spaces/                           # Browse, detail, create
  dashboard/                        # Owner + advertiser dashboard
  api/                              # API routes (upload, inquiries, messages, notifications)

components/
  layout/                           # Navbar, DashboardSidebar, Footer
  spaces/                           # SpaceForm (5-step), SpaceCard, ImageUploader
  inquiries/                        # InquiryForm, MessageThread, MessageInput
  shared/                           # Avatar, EmptyState, LoadingSpinner, etc.

lib/
  supabase/                         # Supabase client/server/middleware
  queries/                          # Data access layer (spaces, inquiries, messages, etc.)
  validations/                      # Zod schemas
  utils/                            # formatters, storage helpers, notification helpers
  types/database.types.ts           # Supabase-generated types
```

## Common Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
```

## Build Order

1. Foundation — auth, middleware, Supabase setup
2. Listings CRUD — SpaceForm, create/edit/list/detail
3. Image uploads — Storage bucket, signed URL API, ImageUploader
4. Search & filters — FTS, getSpaces(), SearchBar, SpaceFilters
5. Inquiry system — InquiryForm, API routes, MessageThread with Realtime
6. Notifications + Email — notification bell, Resend email on key events
7. Profile + Polish — profile edit, dashboard stats, landing page, mobile
