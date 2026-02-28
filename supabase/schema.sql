-- ============================================================
-- SpotLight Mockup Schema
-- Run this in the Supabase SQL editor
-- ============================================================

-- Space type enum
CREATE TYPE space_type AS ENUM (
  'Billboard',
  'Vehicle',
  'Indoor',
  'Outdoor',
  'Digital',
  'Event',
  'Other'
);

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
  username  TEXT PRIMARY KEY,
  password  TEXT NOT NULL
);

-- ============================================================
-- LISTINGS
-- ============================================================
CREATE TABLE ad_spaces (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  owner            TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE,
  type             space_type NOT NULL,
  price_cents      INT NOT NULL CHECK (price_cents >= 0),
  start_date       DATE NOT NULL,
  end_date         DATE NOT NULL CHECK (end_date >= start_date),
  location_address TEXT,
  lat              FLOAT8,
  lng              FLOAT8,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prevent the same owner from having two listings with the same title
ALTER TABLE listings ADD CONSTRAINT unique_title_per_owner UNIQUE (title, owner);

-- ============================================================
-- LISTING BUYERS  (many-to-many: listings <-> users)
-- ============================================================
CREATE TABLE listing_buyers (
  listing_id  UUID NOT NULL REFERENCES ad_spaces(id) ON DELETE CASCADE,
  username    TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE,
  added_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (listing_id, username)
);
