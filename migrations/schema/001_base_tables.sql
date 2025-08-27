-- Schema Migration 1: Base Tables
-- Core tables for the Hum Awaaz platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- PROFILES TABLE
-- =====================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  location TEXT,
  preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'ur')),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- =====================================================
-- PROCESSES TABLE  
-- =====================================================
CREATE TABLE processes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  title_ur TEXT,
  description TEXT NOT NULL,
  description_ur TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed', 'completed')),
  category TEXT NOT NULL CHECK (category IN ('education', 'healthcare', 'infrastructure', 'economy', 'environment', 'governance', 'other')),
  process_type TEXT DEFAULT 'consultation' CHECK (process_type IN ('consultation', 'initiative', 'assembly', 'poll', 'petition', 'budget', 'debate')),
  scope TEXT DEFAULT 'city' CHECK (scope IN ('federal', 'provincial', 'city', 'district', 'community')),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 days'),
  created_by UUID REFERENCES auth.users(id),
  organization TEXT DEFAULT 'Government Initiative',
  participation_count INTEGER DEFAULT 0,
  signature_threshold INTEGER DEFAULT 0,
  current_signatures INTEGER DEFAULT 0,
  signature_deadline TIMESTAMP WITH TIME ZONE,
  response_required BOOLEAN DEFAULT false,
  response_deadline TIMESTAMP WITH TIME ZONE,
  government_response TEXT,
  government_response_ur TEXT,
  response_date TIMESTAMP WITH TIME ZONE,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'restricted', 'private')),
  participation_method TEXT DEFAULT 'open' CHECK (participation_method IN ('open', 'invited', 'random_selection', 'application')),
  min_participants INTEGER DEFAULT 0,
  max_participants INTEGER,
  verification_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- =====================================================
-- PROPOSALS TABLE
-- =====================================================
CREATE TABLE proposals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  process_id UUID NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_ur TEXT,
  description TEXT NOT NULL,
  description_ur TEXT,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'under_review' CHECK (status IN ('under_review', 'pending', 'approved', 'rejected', 'implemented')),
  vote_count INTEGER DEFAULT 0,
  support_percentage NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- =====================================================
-- VOTES TABLE
-- =====================================================
CREATE TABLE votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('support', 'oppose', 'neutral')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, proposal_id)
);

-- =====================================================
-- DISCUSSIONS TABLE
-- =====================================================
CREATE TABLE discussions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  process_id UUID REFERENCES processes(id) ON DELETE CASCADE,
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  content_ur TEXT,
  likes_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  CONSTRAINT discussion_target_check CHECK (
    (process_id IS NOT NULL AND proposal_id IS NULL) OR
    (process_id IS NULL AND proposal_id IS NOT NULL)
  )
);

-- =====================================================
-- PARTICIPATIONS TABLE
-- =====================================================
CREATE TABLE participations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  process_id UUID NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
  participation_type TEXT NOT NULL CHECK (participation_type IN ('view', 'proposal', 'vote', 'comment')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, process_id, participation_type)
);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('proposal_approved', 'proposal_rejected', 'new_comment', 'process_ending', 'vote_milestone', 'admin_announcement')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_process_id UUID REFERENCES processes(id) ON DELETE SET NULL,
  related_proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Profiles indexes
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_preferred_language ON profiles(preferred_language);
CREATE INDEX idx_profiles_is_verified ON profiles(is_verified);

-- Processes indexes
CREATE INDEX idx_processes_status ON processes(status);
CREATE INDEX idx_processes_category ON processes(category);
CREATE INDEX idx_processes_created_by ON processes(created_by);
CREATE INDEX idx_processes_start_date ON processes(start_date);
CREATE INDEX idx_processes_end_date ON processes(end_date);
CREATE INDEX idx_processes_process_type ON processes(process_type);

-- Proposals indexes
CREATE INDEX idx_proposals_process_id ON proposals(process_id);
CREATE INDEX idx_proposals_author_id ON proposals(author_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_created_at ON proposals(created_at);

-- Votes indexes
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_votes_proposal_id ON votes(proposal_id);
CREATE INDEX idx_votes_vote_type ON votes(vote_type);

-- Discussions indexes
CREATE INDEX idx_discussions_process_id ON discussions(process_id);
CREATE INDEX idx_discussions_proposal_id ON discussions(proposal_id);
CREATE INDEX idx_discussions_author_id ON discussions(author_id);
CREATE INDEX idx_discussions_parent_id ON discussions(parent_id);
CREATE INDEX idx_discussions_is_deleted ON discussions(is_deleted) WHERE is_deleted = false;
CREATE INDEX idx_discussions_created_at ON discussions(created_at);

-- Participations indexes
CREATE INDEX idx_participations_user_id ON participations(user_id);
CREATE INDEX idx_participations_process_id ON participations(process_id);
CREATE INDEX idx_participations_type ON participations(participation_type);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- =====================================================
-- CREATE UPDATED_AT TRIGGER FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- ADD UPDATED_AT TRIGGERS
-- =====================================================
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_processes_updated_at
  BEFORE UPDATE ON processes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at
  BEFORE UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discussions_updated_at
  BEFORE UPDATE ON discussions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- CREATE PROFILE ON USER SIGNUP TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ language 'plpgsql' security definer;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMENT ON TABLE profiles IS 'User profile information extending auth.users';
COMMENT ON TABLE processes IS 'Democratic processes and consultations';
COMMENT ON TABLE proposals IS 'Citizen proposals submitted to processes';
COMMENT ON TABLE votes IS 'Votes cast on proposals';
COMMENT ON TABLE discussions IS 'Comments and discussions on processes and proposals';
COMMENT ON TABLE participations IS 'Tracking user engagement in processes';
COMMENT ON TABLE notifications IS 'User notifications and alerts';