-- ============================================================
-- SpotLight Database Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Ad space status enum
CREATE TYPE ad_space_status AS ENUM (
  'draft',
  'published',
  'archived'
);

-- ============================================================
-- PROFILES
-- ============================================================
-- Linked to Supabase Auth users
CREATE TABLE profiles (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email             TEXT,
  full_name         TEXT,
  avatar_url        TEXT,
  can_be_owner      BOOLEAN DEFAULT false,
  can_be_advertiser BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- AD SPACES
-- ============================================================
CREATE TABLE ad_spaces (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  description      TEXT,
  space_type       space_type NOT NULL,
  status           ad_space_status NOT NULL DEFAULT 'published',
  price_cents      INT NOT NULL CHECK (price_cents >= 0),
  city             TEXT,
  address          TEXT,
  lat              FLOAT8,
  lng              FLOAT8,
  image_url        TEXT,
  start_date       DATE,
  end_date         DATE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ad_spaces ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Ad spaces are viewable by everyone if published" ON ad_spaces
  FOR SELECT USING (status = 'published' OR auth.uid() = owner_id);

CREATE POLICY "Authenticated users can create ad spaces" ON ad_spaces
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own ad spaces" ON ad_spaces
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own ad spaces" ON ad_spaces
  FOR DELETE USING (auth.uid() = owner_id);

-- ============================================================
-- AD SPACE INTERESTS (Previously buyers)
-- ============================================================
CREATE TABLE ad_space_interests (
  ad_space_id  UUID NOT NULL REFERENCES ad_spaces(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (ad_space_id, user_id)
);

-- Enable RLS
ALTER TABLE ad_space_interests ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can see their own interests" ON ad_space_interests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Owners can see interests in their ad spaces" ON ad_space_interests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ad_spaces
      WHERE id = ad_space_interests.ad_space_id
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can express interest" ON ad_space_interests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
