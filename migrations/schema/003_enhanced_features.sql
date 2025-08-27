-- Schema Migration 3: Enhanced Democratic Features
-- Advanced features like meetings, process phases, signatures, and user roles

-- =====================================================
-- USER ROLES TABLE
-- =====================================================
CREATE TABLE user_roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('citizen', 'government_admin', 'moderator', 'facilitator', 'observer')),
  scope TEXT DEFAULT 'platform' CHECK (scope IN ('platform', 'process', 'component')),
  resource_id UUID NULL,
  granted_by UUID NULL REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- PROCESS PHASES TABLE
-- =====================================================
CREATE TABLE process_phases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  process_id UUID NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_ur TEXT,
  description TEXT,
  description_ur TEXT,
  phase_type TEXT NOT NULL CHECK (phase_type IN ('information', 'debate', 'proposal', 'voting', 'implementation', 'evaluation')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  CONSTRAINT process_phase_dates_check CHECK (end_date > start_date)
);

-- =====================================================
-- PROCESS SIGNATURES TABLE
-- =====================================================
CREATE TABLE process_signatures (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  process_id UUID NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signature_type TEXT DEFAULT 'support' CHECK (signature_type IN ('support', 'endorsement', 'participation_request')),
  comment TEXT,
  comment_ur TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(process_id, user_id, signature_type)
);

-- =====================================================
-- MEETINGS TABLE
-- =====================================================
CREATE TABLE meetings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  process_id UUID REFERENCES processes(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  title_ur TEXT,
  description TEXT,
  description_ur TEXT,
  location TEXT,
  location_ur TEXT,
  online_meeting_url TEXT,
  meeting_type TEXT DEFAULT 'in_person' CHECK (meeting_type IN ('in_person', 'online', 'hybrid')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  max_attendees INTEGER CHECK (max_attendees > 0),
  registration_required BOOLEAN DEFAULT false,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  agenda TEXT,
  agenda_ur TEXT,
  minutes TEXT,
  minutes_ur TEXT,
  organizer_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  CONSTRAINT meeting_times_check CHECK (end_time > start_time),
  CONSTRAINT registration_deadline_check CHECK (
    registration_deadline IS NULL OR 
    registration_deadline <= start_time
  )
);

-- =====================================================
-- MEETING ATTENDEES TABLE
-- =====================================================
CREATE TABLE meeting_attendees (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  attendance_status TEXT DEFAULT 'registered' CHECK (attendance_status IN ('registered', 'attended', 'no_show', 'cancelled')),
  check_in_time TIMESTAMP WITH TIME ZONE,
  UNIQUE(meeting_id, user_id)
);

-- =====================================================
-- PROCESS FOLLOWERS TABLE
-- =====================================================
CREATE TABLE process_followers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  process_id UUID NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_preferences JSONB DEFAULT '{"email": true, "push": true}',
  followed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(process_id, user_id)
);

-- =====================================================
-- ENHANCED FEATURES INDEXES
-- =====================================================

-- User Roles indexes
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);
CREATE INDEX idx_user_roles_active ON user_roles(is_active) WHERE is_active = true;
CREATE INDEX idx_user_roles_scope_resource ON user_roles(scope, resource_id);
CREATE UNIQUE INDEX idx_user_roles_unique 
  ON user_roles(user_id, role, scope, COALESCE(resource_id, '00000000-0000-0000-0000-000000000000'::uuid))
  WHERE is_active = true;

-- Process Phases indexes
CREATE INDEX idx_process_phases_process_id ON process_phases(process_id);
CREATE INDEX idx_process_phases_type ON process_phases(phase_type);
CREATE INDEX idx_process_phases_active ON process_phases(is_active);
CREATE INDEX idx_process_phases_dates ON process_phases(start_date, end_date);
CREATE INDEX idx_process_phases_order ON process_phases(process_id, order_index);

-- Process Signatures indexes
CREATE INDEX idx_process_signatures_process_id ON process_signatures(process_id);
CREATE INDEX idx_process_signatures_user_id ON process_signatures(user_id);
CREATE INDEX idx_process_signatures_type ON process_signatures(signature_type);
CREATE INDEX idx_process_signatures_verified ON process_signatures(verified);

-- Meetings indexes
CREATE INDEX idx_meetings_process_id ON meetings(process_id);
CREATE INDEX idx_meetings_organizer_id ON meetings(organizer_id);
CREATE INDEX idx_meetings_status ON meetings(status);
CREATE INDEX idx_meetings_start_time ON meetings(start_time);
CREATE INDEX idx_meetings_meeting_type ON meetings(meeting_type);

-- Meeting Attendees indexes
CREATE INDEX idx_meeting_attendees_meeting_id ON meeting_attendees(meeting_id);
CREATE INDEX idx_meeting_attendees_user_id ON meeting_attendees(user_id);
CREATE INDEX idx_meeting_attendees_status ON meeting_attendees(attendance_status);

-- Process Followers indexes
CREATE INDEX idx_process_followers_process_id ON process_followers(process_id);
CREATE INDEX idx_process_followers_user_id ON process_followers(user_id);

-- =====================================================
-- ENHANCED FEATURES TRIGGERS
-- =====================================================
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ENHANCED FEATURES FUNCTIONS
-- =====================================================

-- Function to check if current process phase is active
CREATE OR REPLACE FUNCTION get_active_process_phase(process_id_param UUID)
RETURNS process_phases AS $$
DECLARE
  active_phase process_phases;
BEGIN
  SELECT * INTO active_phase
  FROM process_phases
  WHERE process_id = process_id_param
  AND start_date <= now()
  AND end_date >= now()
  AND is_active = true
  ORDER BY order_index
  LIMIT 1;
  
  RETURN active_phase;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically advance process phases
CREATE OR REPLACE FUNCTION advance_process_phases()
RETURNS void AS $$
BEGIN
  -- Deactivate ended phases
  UPDATE process_phases
  SET is_active = false
  WHERE is_active = true
  AND end_date < now();
  
  -- Activate phases that should start
  UPDATE process_phases
  SET is_active = true
  WHERE is_active = false
  AND start_date <= now()
  AND end_date > now();
END;
$$ LANGUAGE plpgsql;

-- Function to update process signature count
CREATE OR REPLACE FUNCTION update_process_signature_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update current_signatures count in processes table
  UPDATE processes
  SET current_signatures = (
    SELECT COUNT(*)
    FROM process_signatures
    WHERE process_id = COALESCE(NEW.process_id, OLD.process_id)
    AND signature_type = 'support'
  )
  WHERE id = COALESCE(NEW.process_id, OLD.process_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update signature counts
CREATE TRIGGER update_signature_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON process_signatures
  FOR EACH ROW
  EXECUTE FUNCTION update_process_signature_count();

-- =====================================================
-- ENHANCED FEATURES VIEWS
-- =====================================================

-- View for meeting statistics
CREATE VIEW meeting_stats AS
SELECT 
  m.id,
  m.title,
  m.start_time,
  m.status,
  m.max_attendees,
  COUNT(ma.id) as registered_count,
  COUNT(CASE WHEN ma.attendance_status = 'attended' THEN 1 END) as attended_count,
  CASE 
    WHEN m.max_attendees IS NOT NULL 
    THEN ROUND((COUNT(ma.id) * 100.0) / m.max_attendees, 2)
    ELSE NULL
  END as registration_percentage
FROM meetings m
LEFT JOIN meeting_attendees ma ON m.id = ma.meeting_id
GROUP BY m.id, m.title, m.start_time, m.status, m.max_attendees;

-- View for process engagement metrics
CREATE VIEW process_engagement AS
SELECT 
  p.id,
  p.title,
  p.status,
  COUNT(DISTINCT pf.user_id) as followers_count,
  COUNT(DISTINCT ps.user_id) as signatures_count,
  COUNT(DISTINCT pr.author_id) as proposals_count,
  COUNT(DISTINCT v.user_id) as voters_count,
  COUNT(DISTINCT d.author_id) as discussants_count,
  COUNT(DISTINCT part.user_id) as participants_count
FROM processes p
LEFT JOIN process_followers pf ON p.id = pf.process_id
LEFT JOIN process_signatures ps ON p.id = ps.process_id
LEFT JOIN proposals pr ON p.id = pr.process_id
LEFT JOIN votes v ON pr.id = v.proposal_id
LEFT JOIN discussions d ON p.id = d.process_id
LEFT JOIN participations part ON p.id = part.process_id
GROUP BY p.id, p.title, p.status;

COMMENT ON TABLE user_roles IS 'Role-based access control for users';
COMMENT ON TABLE process_phases IS 'Phases/stages within democratic processes';
COMMENT ON TABLE process_signatures IS 'Citizen signatures supporting processes';
COMMENT ON TABLE meetings IS 'Physical and virtual meetings for processes';
COMMENT ON TABLE meeting_attendees IS 'Meeting registration and attendance tracking';
COMMENT ON TABLE process_followers IS 'Users following processes for notifications';
COMMENT ON VIEW meeting_stats IS 'Statistics for meeting attendance and registration';
COMMENT ON VIEW process_engagement IS 'Comprehensive engagement metrics per process';