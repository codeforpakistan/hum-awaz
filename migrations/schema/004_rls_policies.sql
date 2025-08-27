-- Schema Migration 4: Row Level Security Policies
-- Comprehensive RLS policies for all tables

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_vote_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_proposal_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_followers ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTIONS FOR RLS
-- =====================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = COALESCE(user_id, auth.uid())
    AND ur.role IN ('government_admin', 'moderator')
    AND ur.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is government admin
CREATE OR REPLACE FUNCTION is_government_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = COALESCE(user_id, auth.uid())
    AND ur.role = 'government_admin'
    AND ur.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

-- Users can view all public profiles
CREATE POLICY "Anyone can view profiles" ON profiles
  FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (handled by trigger)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "Admins can update profiles" ON profiles
  FOR ALL USING (is_admin());

-- =====================================================
-- PROCESSES POLICIES
-- =====================================================

-- Anyone can view public processes
CREATE POLICY "Anyone can view public processes" ON processes
  FOR SELECT USING (
    visibility = 'public' 
    OR auth.uid() = created_by 
    OR is_admin()
  );

-- Authenticated users can create processes
CREATE POLICY "Authenticated users can create processes" ON processes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Process creators can update their own processes
CREATE POLICY "Process creators can update own processes" ON processes
  FOR UPDATE USING (auth.uid() = created_by OR is_admin());

-- Admins can manage all processes
CREATE POLICY "Admins can manage processes" ON processes
  FOR ALL USING (is_admin());

-- =====================================================
-- PROPOSALS POLICIES
-- =====================================================

-- Anyone can view approved proposals
CREATE POLICY "Anyone can view approved proposals" ON proposals
  FOR SELECT USING (
    status = 'approved' 
    OR auth.uid() = author_id 
    OR is_admin()
  );

-- Authenticated users can create proposals
CREATE POLICY "Authenticated users can create proposals" ON proposals
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Authors can update their own proposals (if not yet approved)
CREATE POLICY "Authors can update own proposals" ON proposals
  FOR UPDATE USING (
    (auth.uid() = author_id AND status IN ('under_review', 'pending')) 
    OR is_admin()
  );

-- Admins can manage all proposals
CREATE POLICY "Admins can manage proposals" ON proposals
  FOR ALL USING (is_admin());

-- =====================================================
-- VOTES POLICIES
-- =====================================================

-- Users can view votes on approved proposals
CREATE POLICY "Users can view votes on approved proposals" ON votes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM proposals p 
      WHERE p.id = proposal_id 
      AND (p.status = 'approved' OR is_admin())
    )
  );

-- Authenticated users can vote
CREATE POLICY "Authenticated users can vote" ON votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own votes
CREATE POLICY "Users can update own votes" ON votes
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own votes
CREATE POLICY "Users can delete own votes" ON votes
  FOR DELETE USING (auth.uid() = user_id);

-- Admins can manage all votes
CREATE POLICY "Admins can manage votes" ON votes
  FOR ALL USING (is_admin());

-- =====================================================
-- DISCUSSIONS POLICIES
-- =====================================================

-- Anyone can view discussions on public content
CREATE POLICY "Anyone can view public discussions" ON discussions
  FOR SELECT USING (
    is_deleted = false 
    AND (
      process_id IN (SELECT id FROM processes WHERE visibility = 'public')
      OR proposal_id IN (SELECT id FROM proposals WHERE status = 'approved')
      OR auth.uid() = author_id
      OR is_admin()
    )
  );

-- Authenticated users can create discussions
CREATE POLICY "Authenticated users can create discussions" ON discussions
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Authors can update their own discussions
CREATE POLICY "Authors can update own discussions" ON discussions
  FOR UPDATE USING (auth.uid() = author_id OR is_admin());

-- Authors can delete their own discussions
CREATE POLICY "Authors can delete own discussions" ON discussions
  FOR DELETE USING (auth.uid() = author_id OR is_admin());

-- Admins can manage all discussions
CREATE POLICY "Admins can manage discussions" ON discussions
  FOR ALL USING (is_admin());

-- =====================================================
-- PARTICIPATIONS POLICIES
-- =====================================================

-- Users can view their own participations
CREATE POLICY "Users can view own participations" ON participations
  FOR SELECT USING (auth.uid() = user_id OR is_admin());

-- Users can insert their own participations
CREATE POLICY "Users can insert own participations" ON participations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all participations
CREATE POLICY "Admins can view all participations" ON participations
  FOR ALL USING (is_admin());

-- =====================================================
-- NOTIFICATIONS POLICIES
-- =====================================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id OR is_admin());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- System can insert notifications
CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Admins can manage all notifications
CREATE POLICY "Admins can manage notifications" ON notifications
  FOR ALL USING (is_admin());

-- =====================================================
-- BUDGET SYSTEM POLICIES
-- =====================================================

-- Anyone can view active budgets
CREATE POLICY "Anyone can view active budgets" ON budgets
  FOR SELECT USING (status = 'active' OR is_admin());

-- Admins can manage budgets
CREATE POLICY "Admins can manage budgets" ON budgets
  FOR ALL USING (is_admin());

-- Anyone can view budget categories for active budgets
CREATE POLICY "Anyone can view budget categories" ON budget_categories
  FOR SELECT USING (
    budget_id IN (SELECT id FROM budgets WHERE status = 'active')
    OR is_admin()
  );

-- Admins can manage budget categories
CREATE POLICY "Admins can manage budget categories" ON budget_categories
  FOR ALL USING (is_admin());

-- Anyone can view approved budget proposals
CREATE POLICY "Anyone can view approved budget proposals" ON budget_proposals
  FOR SELECT USING (
    status = 'approved' 
    OR auth.uid() = submitted_by 
    OR is_admin()
  );

-- Authenticated users can submit budget proposals
CREATE POLICY "Users can submit budget proposals" ON budget_proposals
  FOR INSERT WITH CHECK (auth.uid() = submitted_by);

-- Users can update their own budget proposals
CREATE POLICY "Users can update own budget proposals" ON budget_proposals
  FOR UPDATE USING (auth.uid() = submitted_by OR is_admin());

-- Admins can manage all budget proposals
CREATE POLICY "Admins can manage budget proposals" ON budget_proposals
  FOR ALL USING (is_admin());

-- Users can view and manage their own budget votes
CREATE POLICY "Users can manage own budget votes" ON budget_votes
  FOR ALL USING (auth.uid() = user_id OR is_admin());

-- Users can manage their own budget allocations
CREATE POLICY "Users can manage own budget allocations" ON budget_vote_allocations
  FOR ALL USING (
    vote_id IN (SELECT id FROM budget_votes WHERE user_id = auth.uid())
    OR is_admin()
  );

-- Users can manage their own budget proposal votes
CREATE POLICY "Users can manage own budget proposal votes" ON budget_proposal_votes
  FOR ALL USING (auth.uid() = user_id OR is_admin());

-- =====================================================
-- USER ROLES POLICIES
-- =====================================================

-- Users can view their own roles
CREATE POLICY "Users can view own roles" ON user_roles
  FOR SELECT USING (auth.uid() = user_id OR is_admin());

-- Admins can manage user roles
CREATE POLICY "Admins can manage user roles" ON user_roles
  FOR ALL USING (is_government_admin());

-- =====================================================
-- ENHANCED FEATURES POLICIES
-- =====================================================

-- Anyone can view process phases for public processes
CREATE POLICY "Anyone can view public process phases" ON process_phases
  FOR SELECT USING (
    process_id IN (SELECT id FROM processes WHERE visibility = 'public')
    OR is_admin()
  );

-- Admins can manage process phases
CREATE POLICY "Admins can manage process phases" ON process_phases
  FOR ALL USING (is_admin());

-- Anyone can view process signatures for public processes
CREATE POLICY "Anyone can view public process signatures" ON process_signatures
  FOR SELECT USING (
    process_id IN (SELECT id FROM processes WHERE visibility = 'public')
    OR auth.uid() = user_id
    OR is_admin()
  );

-- Authenticated users can sign processes
CREATE POLICY "Users can sign processes" ON process_signatures
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own signatures
CREATE POLICY "Users can update own signatures" ON process_signatures
  FOR UPDATE USING (auth.uid() = user_id OR is_admin());

-- Users can delete their own signatures
CREATE POLICY "Users can delete own signatures" ON process_signatures
  FOR DELETE USING (auth.uid() = user_id OR is_admin());

-- Anyone can view public meetings
CREATE POLICY "Anyone can view public meetings" ON meetings
  FOR SELECT USING (
    process_id IS NULL 
    OR process_id IN (SELECT id FROM processes WHERE visibility = 'public')
    OR auth.uid() = organizer_id
    OR is_admin()
  );

-- Authenticated users can create meetings
CREATE POLICY "Users can create meetings" ON meetings
  FOR INSERT WITH CHECK (auth.uid() = organizer_id);

-- Organizers can update their own meetings
CREATE POLICY "Organizers can update own meetings" ON meetings
  FOR UPDATE USING (auth.uid() = organizer_id OR is_admin());

-- Admins can manage all meetings
CREATE POLICY "Admins can manage meetings" ON meetings
  FOR ALL USING (is_admin());

-- Users can view meeting attendees for meetings they can see
CREATE POLICY "Users can view meeting attendees" ON meeting_attendees
  FOR SELECT USING (
    meeting_id IN (
      SELECT id FROM meetings 
      WHERE process_id IS NULL 
      OR process_id IN (SELECT id FROM processes WHERE visibility = 'public')
    )
    OR auth.uid() = user_id
    OR is_admin()
  );

-- Users can register themselves for meetings
CREATE POLICY "Users can register for meetings" ON meeting_attendees
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own meeting registration
CREATE POLICY "Users can update own meeting registration" ON meeting_attendees
  FOR UPDATE USING (auth.uid() = user_id OR is_admin());

-- Users can cancel their own registration
CREATE POLICY "Users can cancel own registration" ON meeting_attendees
  FOR DELETE USING (auth.uid() = user_id OR is_admin());

-- Users can manage their own process follows
CREATE POLICY "Users can manage own follows" ON process_followers
  FOR ALL USING (auth.uid() = user_id OR is_admin());

-- =====================================================
-- VIEW POLICIES
-- =====================================================

-- Enable RLS on views
ALTER VIEW budget_allocation_summary ENABLE ROW LEVEL SECURITY;
ALTER VIEW budget_proposal_stats ENABLE ROW LEVEL SECURITY;
ALTER VIEW meeting_stats ENABLE ROW LEVEL SECURITY;
ALTER VIEW process_engagement ENABLE ROW LEVEL SECURITY;

-- View policies (inherit from underlying tables)
CREATE POLICY "Budget allocation view policy" ON budget_allocation_summary
  FOR SELECT USING (true); -- Access controlled by underlying budget tables

CREATE POLICY "Budget proposal stats view policy" ON budget_proposal_stats
  FOR SELECT USING (true); -- Access controlled by underlying tables

CREATE POLICY "Meeting stats view policy" ON meeting_stats
  FOR SELECT USING (true); -- Access controlled by underlying meetings table

CREATE POLICY "Process engagement view policy" ON process_engagement
  FOR SELECT USING (true); -- Access controlled by underlying tables

COMMENT ON FUNCTION is_admin IS 'Check if current user has admin privileges';
COMMENT ON FUNCTION is_government_admin IS 'Check if current user has government admin privileges';