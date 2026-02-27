# CLAUDE.md — SpotLight

This file provides Claude Code with context for working on this project.

## Project Overview

SpotLight is a two-sided marketplace for unconventional advertising spaces. Built with Next.js 14 App Router, Supabase, Tailwind CSS, and shadcn/ui.

## Stack

- **Next.js 14** — App Router, TypeScript, Server Components
- **Supabase** — PostgreSQL, Auth (email + Google OAuth), Storage, Realtime, RLS
- **Tailwind CSS + shadcn/ui** — styling and component library
- **react-leaflet v4 + Leaflet** — interactive map (v4 required — v5 needs React 19)
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
- `lib/supabase/client.ts` — browser client via `createBrowserClient` from `@supabase/ssr` (use in Client Components)
- `lib/supabase/server.ts` — server client via `createServerClient` with `cookies()` (use in Server Components and API routes)
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
- `export const dynamic = 'force-dynamic'` keeps searchParams fresh on every request

### Interactive map
- `components/spaces/SpaceMap.tsx` — Leaflet map with markers and popups; `'use client'`
- `components/spaces/SpaceMapWrapper.tsx` — wraps SpaceMap with `dynamic(..., { ssr: false })` to prevent SSR crash
- Leaflet CSS loaded via CDN `<link>` tag in the Server Component (not imported in JS)
- Broken default marker icons fixed in a `useEffect` by deleting `_getIconUrl` and setting CDN URLs via `L.Icon.Default.mergeOptions`
- `app/globals.css` contains `.leaflet-container { height: 100%; width: 100%; }` — required to prevent map collapsing to 0px
- Map is hidden on mobile (`hidden md:block`) — only card list shows on small screens

### Realtime
- `messages` table subscribed via Supabase Realtime in `MessageThread` component
- Subscription is set up in a `useEffect` in the Client Component

## Database Tables

- `profiles` — extends auth.users
- `ad_spaces` — listing entity (space_type, status, location, pricing, availability, lat float8, lng float8, fts tsvector)
- `space_images` — images linked to a space
- `inquiries` — booking inquiries between advertiser and owner
- `messages` — threaded messages on an inquiry
- `notifications` — in-app notification system

## Supabase SQL Setup

Run in the Supabase SQL editor to create the `ad_spaces` table with:
- `lat float8`, `lng float8` columns for map coordinates
- `fts tsvector` generated column for full-text search
- Row Level Security policies
- `set_updated_at` trigger

## File Structure

```
app/
  (auth)/login, signup, callback    # Auth pages + OAuth callback
  onboarding/                       # Role selection after signup
  spaces/
    page.tsx                        # Browse + split map layout (Server Component)
    [id]/page.tsx                   # Space detail page
  dashboard/                        # Owner + advertiser dashboard
  api/                              # API routes (upload, inquiries, messages, notifications)

components/
  layout/                           # Navbar, DashboardSidebar, Footer
  spaces/
    SpaceCard.tsx                   # Listing card (server-rendered)
    SpaceMap.tsx                    # Leaflet map client component
    SpaceMapWrapper.tsx             # dynamic() SSR wrapper
    SpaceForm.tsx                   # (planned) 5-step listing form
    ImageUploader.tsx               # (planned)
  inquiries/                        # InquiryForm, MessageThread, MessageInput
  shared/                           # Avatar, EmptyState, LoadingSpinner, etc.

lib/
  supabase/
    client.ts                       # createBrowserClient
    server.ts                       # createServerClient + cookies
  queries/
    spaces.ts                       # getSpaces(), getSpaceById()
  utils/
    formatters.ts                   # formatPrice(cents)
  types/
    database.types.ts               # AdSpace, AdSpaceMapMarker interfaces
```

## Common Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
```

## Build Order

1. **Done** — Supabase clients, types, formatters, getSpaces query
2. **Done** — `/spaces` browse page with split card list + interactive Leaflet map
3. **Done** — `/spaces/[id]` detail page
4. Next — Auth, middleware, onboarding
5. Next — Listings CRUD (SpaceForm 5-step, create/edit)
6. Next — Image uploads (Storage bucket, signed URL API, ImageUploader)
7. Next — Inquiry system (InquiryForm, API routes, MessageThread with Realtime)
8. Next — Notifications + Email (notification bell, Resend on key events)
9. Next — Profile + Polish (dashboard stats, landing page, mobile)
