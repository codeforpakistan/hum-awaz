-- Schema Migration 5: Functions and Triggers
-- Utility functions, business logic, and automated triggers

-- =====================================================
-- VOTE CALCULATION FUNCTIONS
-- =====================================================

-- Function to calculate proposal vote statistics
CREATE OR REPLACE FUNCTION calculate_proposal_votes(proposal_id_param UUID)
RETURNS void AS $$
DECLARE
  total_votes INTEGER;
  support_votes INTEGER;
  support_pct NUMERIC;
BEGIN
  SELECT COUNT(*) INTO total_votes
  FROM votes
  WHERE proposal_id = proposal_id_param;
  
  SELECT COUNT(*) INTO support_votes
  FROM votes
  WHERE proposal_id = proposal_id_param
  AND vote_type = 'support';
  
  IF total_votes > 0 THEN
    support_pct := ROUND((support_votes * 100.0) / total_votes, 2);
  ELSE
    support_pct := 0;
  END IF;
  
  UPDATE proposals
  SET 
    vote_count = total_votes,
    support_percentage = support_pct,
    updated_at = timezone('utc'::text, now())
  WHERE id = proposal_id_param;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to update vote counts automatically
CREATE OR REPLACE FUNCTION update_proposal_votes()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT and UPDATE
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM calculate_proposal_votes(NEW.proposal_id);
    RETURN NEW;
  END IF;
  
  -- Handle DELETE
  IF TG_OP = 'DELETE' THEN
    PERFORM calculate_proposal_votes(OLD.proposal_id);
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for vote count updates
CREATE TRIGGER update_proposal_votes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_proposal_votes();

-- =====================================================
-- PARTICIPATION TRACKING FUNCTIONS
-- =====================================================

-- Function to update process participation count
CREATE OR REPLACE FUNCTION update_process_participation_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE processes
  SET 
    participation_count = (
      SELECT COUNT(DISTINCT user_id)
      FROM participations
      WHERE process_id = COALESCE(NEW.process_id, OLD.process_id)
    ),
    updated_at = timezone('utc'::text, now())
  WHERE id = COALESCE(NEW.process_id, OLD.process_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for participation count updates
CREATE TRIGGER update_participation_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON participations
  FOR EACH ROW
  EXECUTE FUNCTION update_process_participation_count();

-- =====================================================
-- NOTIFICATION FUNCTIONS
-- =====================================================

-- Function to send notification to user
CREATE OR REPLACE FUNCTION send_notification(
  user_id_param UUID,
  type_param TEXT,
  title_param TEXT,
  message_param TEXT,
  process_id_param UUID DEFAULT NULL,
  proposal_id_param UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id, type, title, message, related_process_id, related_proposal_id
  ) VALUES (
    user_id_param, type_param, title_param, message_param, process_id_param, proposal_id_param
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to notify followers about process updates
CREATE OR REPLACE FUNCTION notify_process_followers()
RETURNS TRIGGER AS $$
DECLARE
  follower_record RECORD;
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  -- Only notify on significant changes
  IF TG_OP = 'UPDATE' AND (
    OLD.status != NEW.status OR
    OLD.end_date != NEW.end_date OR
    NEW.government_response IS NOT NULL AND OLD.government_response IS NULL
  ) THEN
    
    -- Determine notification content based on change
    IF OLD.status != NEW.status THEN
      notification_title := 'Process Status Updated';
      notification_message := 'The process "' || NEW.title || '" status changed to ' || NEW.status;
    ELSIF OLD.end_date != NEW.end_date THEN
      notification_title := 'Process Timeline Changed';
      notification_message := 'The process "' || NEW.title || '" end date has been updated';
    ELSIF NEW.government_response IS NOT NULL AND OLD.government_response IS NULL THEN
      notification_title := 'Government Response Available';
      notification_message := 'The government has responded to "' || NEW.title || '"';
    END IF;
    
    -- Send notification to all followers
    FOR follower_record IN 
      SELECT user_id FROM process_followers WHERE process_id = NEW.id
    LOOP
      PERFORM send_notification(
        follower_record.user_id,
        'process_update',
        notification_title,
        notification_message,
        NEW.id
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for process follower notifications
CREATE TRIGGER notify_process_followers_trigger
  AFTER UPDATE ON processes
  FOR EACH ROW
  EXECUTE FUNCTION notify_process_followers();

-- Function to notify proposal author about status changes
CREATE OR REPLACE FUNCTION notify_proposal_status_change()
RETURNS TRIGGER AS $$
DECLARE
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  IF OLD.status != NEW.status THEN
    CASE NEW.status
      WHEN 'approved' THEN
        notification_title := 'Proposal Approved';
        notification_message := 'Your proposal "' || NEW.title || '" has been approved!';
      WHEN 'rejected' THEN
        notification_title := 'Proposal Rejected';
        notification_message := 'Your proposal "' || NEW.title || '" was not approved.';
      WHEN 'implemented' THEN
        notification_title := 'Proposal Implemented';
        notification_message := 'Your proposal "' || NEW.title || '" has been implemented!';
      ELSE
        RETURN NEW; -- Don't notify for other status changes
    END CASE;
    
    PERFORM send_notification(
      NEW.author_id,
      'proposal_' || NEW.status,
      notification_title,
      notification_message,
      NEW.process_id,
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for proposal status notifications
CREATE TRIGGER notify_proposal_status_trigger
  AFTER UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION notify_proposal_status_change();

-- =====================================================
-- MEETING FUNCTIONS
-- =====================================================

-- Function to automatically update meeting status
CREATE OR REPLACE FUNCTION update_meeting_status()
RETURNS void AS $$
BEGIN
  -- Mark meetings as ongoing if they've started
  UPDATE meetings
  SET status = 'ongoing'
  WHERE status = 'upcoming'
  AND start_time <= now()
  AND end_time > now();
  
  -- Mark meetings as completed if they've ended
  UPDATE meetings
  SET status = 'completed'
  WHERE status IN ('upcoming', 'ongoing')
  AND end_time <= now();
END;
$$ LANGUAGE plpgsql;

-- Function to check meeting capacity before registration
CREATE OR REPLACE FUNCTION check_meeting_capacity()
RETURNS TRIGGER AS $$
DECLARE
  current_attendees INTEGER;
  max_capacity INTEGER;
BEGIN
  SELECT max_attendees INTO max_capacity
  FROM meetings
  WHERE id = NEW.meeting_id;
  
  IF max_capacity IS NOT NULL THEN
    SELECT COUNT(*) INTO current_attendees
    FROM meeting_attendees
    WHERE meeting_id = NEW.meeting_id
    AND attendance_status != 'cancelled';
    
    IF current_attendees >= max_capacity THEN
      RAISE EXCEPTION 'Meeting has reached maximum capacity of % attendees', max_capacity;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for meeting capacity check
CREATE TRIGGER check_meeting_capacity_trigger
  BEFORE INSERT ON meeting_attendees
  FOR EACH ROW
  EXECUTE FUNCTION check_meeting_capacity();

-- =====================================================
-- BUDGET CALCULATION FUNCTIONS
-- =====================================================

-- Function to validate budget proposal costs
CREATE OR REPLACE FUNCTION validate_budget_proposal_cost()
RETURNS TRIGGER AS $$
DECLARE
  category_max_amount NUMERIC;
  category_total_cost NUMERIC;
BEGIN
  -- Get category maximum amount
  SELECT max_amount INTO category_max_amount
  FROM budget_categories
  WHERE id = NEW.category_id;
  
  -- If category has a maximum, check if proposal exceeds it
  IF category_max_amount IS NOT NULL AND NEW.estimated_cost > category_max_amount THEN
    RAISE EXCEPTION 'Proposal cost (%) exceeds category maximum (%)', NEW.estimated_cost, category_max_amount;
  END IF;
  
  -- Check if adding this proposal would exceed category total allocated funds
  SELECT COALESCE(SUM(estimated_cost), 0) INTO category_total_cost
  FROM budget_proposals
  WHERE category_id = NEW.category_id
  AND status = 'approved'
  AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
  
  IF category_max_amount IS NOT NULL AND (category_total_cost + NEW.estimated_cost) > category_max_amount THEN
    RAISE EXCEPTION 'Adding this proposal would exceed category budget. Available: %, Requested: %', 
           (category_max_amount - category_total_cost), NEW.estimated_cost;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for budget proposal validation
CREATE TRIGGER validate_budget_proposal_cost_trigger
  BEFORE INSERT OR UPDATE ON budget_proposals
  FOR EACH ROW
  EXECUTE FUNCTION validate_budget_proposal_cost();

-- =====================================================
-- DATA CLEANUP FUNCTIONS
-- =====================================================

-- Function to clean up old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete read notifications older than 90 days
  DELETE FROM notifications
  WHERE is_read = true
  AND created_at < (now() - interval '90 days');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to archive completed processes
CREATE OR REPLACE FUNCTION archive_completed_processes()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Mark processes as completed if they've ended and have government response
  UPDATE processes
  SET status = 'completed'
  WHERE status = 'closed'
  AND end_date < now()
  AND government_response IS NOT NULL;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ANALYTICS FUNCTIONS
-- =====================================================

-- Function to get user engagement summary
CREATE OR REPLACE FUNCTION get_user_engagement_stats(user_id_param UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'proposals_created', (
      SELECT COUNT(*) FROM proposals WHERE author_id = user_id_param
    ),
    'votes_cast', (
      SELECT COUNT(*) FROM votes WHERE user_id = user_id_param
    ),
    'discussions_posted', (
      SELECT COUNT(*) FROM discussions WHERE author_id = user_id_param
    ),
    'processes_followed', (
      SELECT COUNT(*) FROM process_followers WHERE user_id = user_id_param
    ),
    'meetings_attended', (
      SELECT COUNT(*) FROM meeting_attendees 
      WHERE user_id = user_id_param AND attendance_status = 'attended'
    ),
    'processes_signed', (
      SELECT COUNT(*) FROM process_signatures WHERE user_id = user_id_param
    ),
    'budget_participations', (
      SELECT COUNT(*) FROM budget_votes WHERE user_id = user_id_param
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get platform-wide statistics
CREATE OR REPLACE FUNCTION get_platform_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'active_processes', (SELECT COUNT(*) FROM processes WHERE status = 'active'),
    'total_proposals', (SELECT COUNT(*) FROM proposals),
    'approved_proposals', (SELECT COUNT(*) FROM proposals WHERE status = 'approved'),
    'total_votes', (SELECT COUNT(*) FROM votes),
    'total_discussions', (SELECT COUNT(*) FROM discussions WHERE is_deleted = false),
    'active_budgets', (SELECT COUNT(*) FROM budgets WHERE status = 'active'),
    'upcoming_meetings', (
      SELECT COUNT(*) FROM meetings 
      WHERE status = 'upcoming' AND start_time > now()
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function to get process progress percentage
CREATE OR REPLACE FUNCTION get_process_progress(process_id_param UUID)
RETURNS NUMERIC AS $$
DECLARE
  start_date TIMESTAMP WITH TIME ZONE;
  end_date TIMESTAMP WITH TIME ZONE;
  current_time TIMESTAMP WITH TIME ZONE;
  total_duration INTERVAL;
  elapsed_duration INTERVAL;
  progress_percentage NUMERIC;
BEGIN
  SELECT p.start_date, p.end_date INTO start_date, end_date
  FROM processes p
  WHERE p.id = process_id_param;
  
  IF start_date IS NULL OR end_date IS NULL THEN
    RETURN 0;
  END IF;
  
  current_time := now();
  
  IF current_time <= start_date THEN
    RETURN 0;
  ELSIF current_time >= end_date THEN
    RETURN 100;
  ELSE
    total_duration := end_date - start_date;
    elapsed_duration := current_time - start_date;
    progress_percentage := ROUND((EXTRACT(EPOCH FROM elapsed_duration) / EXTRACT(EPOCH FROM total_duration)) * 100, 2);
    RETURN progress_percentage;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions to authenticated users
GRANT EXECUTE ON FUNCTION send_notification(UUID, TEXT, TEXT, TEXT, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_engagement_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_platform_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_process_progress(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_meeting_status() TO authenticated;

-- Grant admin-only functions to service role
GRANT EXECUTE ON FUNCTION cleanup_old_notifications() TO service_role;
GRANT EXECUTE ON FUNCTION archive_completed_processes() TO service_role;

COMMENT ON FUNCTION calculate_proposal_votes IS 'Recalculate vote statistics for a proposal';
COMMENT ON FUNCTION send_notification IS 'Send a notification to a specific user';
COMMENT ON FUNCTION get_user_engagement_stats IS 'Get comprehensive engagement statistics for a user';
COMMENT ON FUNCTION get_platform_stats IS 'Get platform-wide statistics';
COMMENT ON FUNCTION get_process_progress IS 'Calculate process progress as percentage';
COMMENT ON FUNCTION cleanup_old_notifications IS 'Clean up old read notifications (service_role only)';
COMMENT ON FUNCTION archive_completed_processes IS 'Archive processes that should be completed (service_role only)';