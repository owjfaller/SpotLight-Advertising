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
| Map | react-leaflet v4 + OpenStreetMap |
| Email | Resend |
| Deployment | Vercel |

---

## What's Built

### Browse page — `/spaces`
- Split layout: scrollable card list on the left, interactive Leaflet map on the right
- Map markers are clickable — popup shows name, type, price, and a "View listing" link
- Filters via URL search params: full-text search (`q`), space type (`type`), city (`city`)
- Server Component with `force-dynamic` so filters are always fresh
- Map hidden on mobile — card list only

### Space detail page — `/spaces/[id]`
- Fetches single published space by ID
- Shows title, type, city, price, description, and a "Send Inquiry" button placeholder
- Returns 404 via `notFound()` if the space doesn't exist or isn't published

### Data layer
- `lib/supabase/client.ts` + `lib/supabase/server.ts` — Supabase clients for browser and server
- `lib/queries/spaces.ts` — `getSpaces()` and `getSpaceById()`
- `lib/utils/formatters.ts` — `formatPrice(cents)` integer cents → `$1,500`
- `lib/types/database.types.ts` — `AdSpace` and `AdSpaceMapMarker` TypeScript interfaces

---

## Planned Features

- **Auth** — email/password + Google OAuth, session middleware
- **Onboarding** — post-signup role selection (owner, advertiser, or both)
- **Listings CRUD** — 5-step SpaceForm, multi-image upload via Supabase Storage
- **Inquiry system** — structured booking inquiries + real-time message threads
- **Notifications** — in-app notification bell + transactional email via Resend
- **Dashboard** — unified inbox, listing management, profile editing, stats

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Resend](https://resend.com) account (for email — not required for map/browse)

### 1. Clone and install

```bash
git clone https://github.com/owjfaller/SpotLight-Advertising.git
cd SpotLight-Advertising
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

Run the following SQL in your Supabase project's SQL editor:

```sql
-- ad_spaces table
create table ad_spaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users not null,
  title text not null,
  description text,
  space_type text not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  price_cents int not null,
  city text not null,
  address text,
  lat float8,
  lng float8,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  fts tsvector generated always as (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(city, ''))
  ) stored
);

-- Full-text search index
create index ad_spaces_fts_idx on ad_spaces using gin(fts);

-- Updated-at trigger
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on ad_spaces
  for each row execute function set_updated_at();

-- RLS
alter table ad_spaces enable row level security;

create policy "Published spaces are publicly readable"
  on ad_spaces for select
  using (status = 'published');

create policy "Owners can manage their own spaces"
  on ad_spaces for all
  using (auth.uid() = owner_id);
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000/spaces](http://localhost:3000/spaces).

---

## Project Structure

```
app/
  spaces/
    page.tsx                  # Browse page — split card list + map
    [id]/page.tsx             # Space detail page

components/
  spaces/
    SpaceCard.tsx             # Listing card
    SpaceMap.tsx              # Leaflet map (client)
    SpaceMapWrapper.tsx       # dynamic() SSR wrapper

lib/
  supabase/
    client.ts                 # Browser Supabase client
    server.ts                 # Server Supabase client
  queries/
    spaces.ts                 # getSpaces(), getSpaceById()
  utils/
    formatters.ts             # formatPrice()
  types/
    database.types.ts         # TypeScript interfaces
```

---

## Key Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Map library | react-leaflet v4 + OpenStreetMap | Free, no API key, works with React 18 |
| Map SSR | `dynamic(..., { ssr: false })` | Leaflet uses `window` — can't run on server |
| Roles | Boolean flags on `profiles` | Supports dual roles, no join complexity |
| Image upload | Client → signed URL → Storage | No server memory/bandwidth overhead |
| Search | Postgres FTS generated column | No external service at MVP scale |
| Filter state | URL search params + Server Components | Shareable URLs, no client state |
| Realtime | Supabase Realtime on `messages` | Built-in, no extra infrastructure |
| Price storage | Integer cents | Avoids floating point errors |

---

## License

MIT
