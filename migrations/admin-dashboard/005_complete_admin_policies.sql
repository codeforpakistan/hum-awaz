-- Admin Dashboard Migration 5: Complete Admin Policies for All Tables
-- This migration adds admin access policies for all remaining tables

-- =======================
-- BUDGET SYSTEM TABLES
-- =======================

-- Budget Categories
CREATE POLICY "Admins can view all budget categories" ON budget_categories
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can manage budget categories" ON budget_categories
  FOR ALL USING (is_admin());

-- Budget Proposals  
CREATE POLICY "Admins can view all budget proposals" ON budget_proposals
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can manage budget proposals" ON budget_proposals
  FOR ALL USING (is_admin());

-- Budget Proposal Votes
CREATE POLICY "Admins can view all budget proposal votes" ON budget_proposal_votes
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can manage budget proposal votes" ON budget_proposal_votes
  FOR ALL USING (is_admin());

-- Budget Vote Allocations
CREATE POLICY "Admins can view all budget vote allocations" ON budget_vote_allocations
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can manage budget vote allocations" ON budget_vote_allocations
  FOR ALL USING (is_admin());

-- Budget Votes
CREATE POLICY "Admins can view all budget votes" ON budget_votes
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can manage budget votes" ON budget_votes
  FOR ALL USING (is_admin());

-- Budgets
CREATE POLICY "Admins can view all budgets" ON budgets
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can manage budgets" ON budgets
  FOR ALL USING (is_admin());

-- =======================
-- MEETINGS & EVENTS
-- =======================

-- Meetings
CREATE POLICY "Admins can view all meetings" ON meetings
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can manage meetings" ON meetings
  FOR ALL USING (is_admin());

-- =======================
-- NOTIFICATIONS
-- =======================

-- Notifications
CREATE POLICY "Admins can view all notifications" ON notifications
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can manage notifications" ON notifications
  FOR ALL USING (is_admin());

-- =======================
-- PROCESS ENHANCEMENTS
-- =======================

-- Process Phases
CREATE POLICY "Admins can view all process phases" ON process_phases
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can manage process phases" ON process_phases
  FOR ALL USING (is_admin());

-- Process Signatures  
CREATE POLICY "Admins can view all process signatures" ON process_signatures
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can manage process signatures" ON process_signatures
  FOR ALL USING (is_admin());

-- =======================
-- ADMIN UTILITY FUNCTIONS FOR EXTENDED TABLES
-- =======================

-- Function to get comprehensive admin analytics
CREATE OR REPLACE FUNCTION get_admin_analytics()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Check if user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can access analytics data';
  END IF;

  SELECT json_build_object(
    'core_stats', json_build_object(
      'total_users', (SELECT COUNT(*) FROM profiles),
      'verified_users', (SELECT COUNT(*) FROM profiles WHERE is_verified = true),
      'total_processes', (SELECT COUNT(*) FROM processes),
      'total_proposals', (SELECT COUNT(*) FROM proposals),
      'total_votes', (SELECT COUNT(*) FROM votes),
      'total_discussions', (SELECT COUNT(*) FROM discussions)
    ),
    'budget_stats', json_build_object(
      'total_budgets', (SELECT COUNT(*) FROM budgets),
      'active_budgets', (SELECT COUNT(*) FROM budgets WHERE status = 'active'),
      'budget_proposals', (SELECT COUNT(*) FROM budget_proposals),
      'budget_votes', (SELECT COUNT(*) FROM budget_votes)
    ),
    'engagement_stats', json_build_object(
      'total_participations', (SELECT COUNT(*) FROM participations),
      'meeting_attendees', (SELECT COUNT(*) FROM meetings),
      'process_signatures', (SELECT COUNT(*) FROM process_signatures),
      'notification_count', (SELECT COUNT(*) FROM notifications)
    ),
    'recent_activity', json_build_object(
      'new_users_week', (
        SELECT COUNT(*) FROM profiles 
        WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      ),
      'proposals_week', (
        SELECT COUNT(*) FROM proposals 
        WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      ),
      'votes_week', (
        SELECT COUNT(*) FROM votes 
        WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      ),
      'discussions_week', (
        SELECT COUNT(*) FROM discussions 
        WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      )
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user activity summary for admin review
CREATE OR REPLACE FUNCTION get_user_activity_summary(
  user_id_param UUID,
  days_back INTEGER DEFAULT 30
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  start_date TIMESTAMPTZ;
BEGIN
  -- Check if user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can access user activity data';
  END IF;

  start_date := CURRENT_DATE - (days_back || ' days')::INTERVAL;

  SELECT json_build_object(
    'user_info', (
      SELECT json_build_object(
        'id', id,
        'username', username,
        'full_name', full_name,
        'is_verified', is_verified,
        'created_at', created_at
      )
      FROM profiles WHERE id = user_id_param
    ),
    'activity_counts', json_build_object(
      'proposals_created', (
        SELECT COUNT(*) FROM proposals 
        WHERE author_id = user_id_param AND created_at >= start_date
      ),
      'votes_cast', (
        SELECT COUNT(*) FROM votes 
        WHERE user_id = user_id_param AND created_at >= start_date
      ),
      'discussions_posted', (
        SELECT COUNT(*) FROM discussions 
        WHERE author_id = user_id_param AND created_at >= start_date
      ),
      'participations', (
        SELECT COUNT(*) FROM participations 
        WHERE user_id = user_id_param AND created_at >= start_date
      ),
      'process_signatures', (
        SELECT COUNT(*) FROM process_signatures 
        WHERE user_id = user_id_param AND created_at >= start_date
      ),
      'budget_votes', (
        SELECT COUNT(*) FROM budget_votes 
        WHERE user_id = user_id_param AND created_at >= start_date
      )
    ),
    'roles', (
      SELECT json_agg(
        json_build_object(
          'role', role,
          'scope', scope,
          'is_active', is_active,
          'granted_at', granted_at
        )
      )
      FROM user_roles WHERE user_id = user_id_param
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to moderate content (soft delete discussions, etc.)
CREATE OR REPLACE FUNCTION admin_moderate_content(
  content_type TEXT,
  content_id UUID,
  action_type TEXT, -- 'hide', 'delete', 'pin', 'unpin'
  reason TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  admin_id UUID;
  old_values JSONB;
  new_values JSONB;
BEGIN
  -- Check if user is admin
  admin_id := auth.uid();
  IF NOT is_admin(admin_id) THEN
    RAISE EXCEPTION 'Only admins can moderate content';
  END IF;

  -- Validate content type and action
  IF content_type NOT IN ('discussion', 'proposal', 'process') THEN
    RAISE EXCEPTION 'Invalid content type: %', content_type;
  END IF;

  IF action_type NOT IN ('hide', 'delete', 'pin', 'unpin') THEN
    RAISE EXCEPTION 'Invalid action type: %', action_type;
  END IF;

  -- Apply moderation based on content type
  IF content_type = 'discussion' THEN
    IF action_type = 'hide' OR action_type = 'delete' THEN
      SELECT to_jsonb(d) INTO old_values FROM discussions d WHERE id = content_id;
      
      UPDATE discussions 
      SET is_deleted = true, updated_at = timezone('utc'::text, now())
      WHERE id = content_id;
      
      new_values := jsonb_build_object('is_deleted', true);
      
    ELSIF action_type = 'pin' THEN
      SELECT to_jsonb(d) INTO old_values FROM discussions d WHERE id = content_id;
      
      UPDATE discussions 
      SET is_pinned = true, updated_at = timezone('utc'::text, now())
      WHERE id = content_id;
      
      new_values := jsonb_build_object('is_pinned', true);
      
    ELSIF action_type = 'unpin' THEN
      SELECT to_jsonb(d) INTO old_values FROM discussions d WHERE id = content_id;
      
      UPDATE discussions 
      SET is_pinned = false, updated_at = timezone('utc'::text, now())
      WHERE id = content_id;
      
      new_values := jsonb_build_object('is_pinned', false);
    END IF;
  END IF;

  -- Log the moderation action
  PERFORM log_admin_action(
    admin_id,
    'content_moderation',
    content_type::TEXT,
    content_id,
    old_values,
    new_values,
    reason,
    jsonb_build_object('action_type', action_type)
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to bulk manage notifications
CREATE OR REPLACE FUNCTION admin_bulk_notifications(
  user_ids UUID[],
  notification_type TEXT,
  title TEXT,
  message TEXT,
  related_process_id UUID DEFAULT NULL,
  related_proposal_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  admin_id UUID;
  user_id UUID;
  inserted_count INTEGER := 0;
BEGIN
  -- Check if user is admin
  admin_id := auth.uid();
  IF NOT is_admin(admin_id) THEN
    RAISE EXCEPTION 'Only admins can send bulk notifications';
  END IF;

  -- Validate notification type
  IF notification_type NOT IN ('proposal_approved', 'proposal_rejected', 'new_comment', 'process_ending', 'vote_milestone', 'admin_announcement') THEN
    RAISE EXCEPTION 'Invalid notification type: %', notification_type;
  END IF;

  -- Send notification to each user
  FOREACH user_id IN ARRAY user_ids
  LOOP
    INSERT INTO notifications (
      user_id, type, title, message, 
      related_process_id, related_proposal_id, is_read
    ) VALUES (
      user_id, notification_type, title, message,
      related_process_id, related_proposal_id, false
    );
    
    inserted_count := inserted_count + 1;
  END LOOP;

  -- Log the bulk notification
  PERFORM log_admin_action(
    admin_id,
    'bulk_notification',
    'notifications',
    admin_id, -- Using admin_id as target since it's a bulk action
    NULL,
    jsonb_build_object(
      'notification_type', notification_type,
      'title', title,
      'user_count', array_length(user_ids, 1)
    ),
    'Bulk notification sent',
    jsonb_build_object('user_ids', user_ids)
  );

  RETURN inserted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION get_admin_analytics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_activity_summary(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_moderate_content(TEXT, UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_bulk_notifications(UUID[], TEXT, TEXT, TEXT, UUID, UUID) TO authenticated;

-- Update audit log action types to include new actions
ALTER TABLE admin_actions DROP CONSTRAINT IF EXISTS admin_actions_action_type_check;
ALTER TABLE admin_actions ADD CONSTRAINT admin_actions_action_type_check 
  CHECK (action_type IN (
    'proposal_approved', 'proposal_rejected', 'proposal_status_changed',
    'process_status_changed', 'process_updated', 'user_role_granted', 
    'user_role_revoked', 'bulk_action', 'content_moderation', 'bulk_notification'
  ));

COMMENT ON FUNCTION get_admin_analytics IS 'Get comprehensive platform analytics for admin dashboard';
COMMENT ON FUNCTION get_user_activity_summary IS 'Get detailed user activity summary for admin review';
COMMENT ON FUNCTION admin_moderate_content IS 'Moderate content with audit logging';
COMMENT ON FUNCTION admin_bulk_notifications IS 'Send bulk notifications to users';