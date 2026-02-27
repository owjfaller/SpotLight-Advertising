# SpotLight — Advertising Space Marketplace

SpotLight is a two-sided marketplace for unconventional advertising spaces: warehouse walls, vehicle fleets, water bottles, event signage, and any other non-traditional ad surface that's currently hard to discover.

Space owners list their inventory. Advertisers browse, filter, and send booking inquiries. The two parties connect on-platform and handle payment offline (MVP scope).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router + TypeScript) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (email/password + Google OAuth) |
| Storage | Supabase Storage (signed URL uploads) |
| Realtime | Supabase Realtime (live message threads) |
| Email | Resend |
| Deployment | Vercel |

---

## Features

- **Space listings** — create, edit, publish, and manage ad space listings with multi-image upload
- **Browse & search** — full-text search, type filter, city filter, all synced to URL params
- **Inquiry system** — advertisers send structured booking inquiries to space owners
- **Live messaging** — real-time message threads between owner and advertiser via Supabase Realtime
- **Notifications** — in-app notification bell + transactional email on key events
- **Dual roles** — users can be both space owners and advertisers simultaneously
- **Dashboard** — unified inbox, listing management, and profile editing

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Resend](https://resend.com) account for transactional email

### 1. Clone and install

```bash
git clone https://github.com/your-username/spotlight.git
cd spotlight
npm install
```

### 2. Environment variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Supabase setup

Run the SQL migrations in your Supabase project (found in `/supabase/migrations/`):

- Creates all tables: `profiles`, `ad_spaces`, `space_images`, `inquiries`, `messages`, `notifications`
- Sets up Row Level Security policies
- Adds triggers for `handle_new_user` and `set_updated_at`
- Creates the full-text search vector column on `ad_spaces`

Create a storage bucket named `space-images` with public read access.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
app/
  page.tsx                  # Landing page
  layout.tsx                # Root layout (Navbar, Toaster)
  (auth)/
    login/page.tsx
    signup/page.tsx
    callback/route.ts       # OAuth callback
  onboarding/page.tsx       # Post-signup role selection
  spaces/
    page.tsx                # Browse & search
    [id]/page.tsx           # Space detail
    new/page.tsx            # Create listing
  dashboard/
    layout.tsx              # Auth guard + sidebar
    page.tsx                # Stats overview
    listings/               # Owner listing management
    inquiries/              # Unified inbox + message threads
    profile/page.tsx
  api/
    upload/route.ts
    inquiries/route.ts
    inquiries/[id]/route.ts
    messages/route.ts
    notifications/route.ts

components/
  layout/                   # Navbar, DashboardSidebar, Footer
  spaces/                   # SpaceCard, SpaceForm, ImageUploader, etc.
  inquiries/                # InquiryForm, MessageThread, etc.
  shared/                   # Avatar, EmptyState, LoadingSpinner, etc.

lib/
  supabase/                 # Browser + server clients, middleware helper
  queries/                  # Data access functions
  validations/              # Zod schemas
  utils/                    # Formatters, storage helpers, notification helpers
  types/                    # Supabase-generated database types
```

---

## Key Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Roles | Boolean flags on `profiles` | Supports dual roles, no join complexity |
| Image upload | Client → signed URL → Storage | No server memory/bandwidth overhead |
| Search | Postgres FTS generated column | No external service at MVP scale |
| Filter state | URL search params + Server Components | Shareable URLs, no client state |
| Realtime | Supabase Realtime on `messages` | Built-in, no extra infrastructure |
| Price storage | Integer cents | Avoids floating point errors |

---

## License

MIT
