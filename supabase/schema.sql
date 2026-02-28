-- ============================================================
-- SpotLight Database Schema
-- ============================================================

-- Cleanup old mockup tables if they exist
DROP TABLE IF EXISTS ad_space_interests CASCADE;
DROP TABLE IF EXISTS ad_space_buyers CASCADE;
DROP TABLE IF EXISTS ad_spaces CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Cleanup types
DROP TYPE IF EXISTS space_type CASCADE;
DROP TYPE IF EXISTS ad_space_status CASCADE;

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
-- MESSAGING
-- ============================================================

CREATE TABLE conversations (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_space_id  UUID REFERENCES ad_spaces(id) ON DELETE SET NULL,
  buyer_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(buyer_id, seller_id, ad_space_id)
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations" ON conversations
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can start a conversation" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = messages.conversation_id
      AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = messages.conversation_id
      AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
  );

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

-- ============================================================
-- ENABLE REALTIME
-- ============================================================
-- Add tables to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
