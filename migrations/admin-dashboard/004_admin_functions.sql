-- Admin Dashboard Migration 4: Admin Functions and Procedures
-- This migration creates stored procedures for common admin operations

-- Function to bulk approve proposals
CREATE OR REPLACE FUNCTION bulk_approve_proposals(
  proposal_ids UUID[],
  admin_reason TEXT DEFAULT NULL
)
RETURNS TABLE(id UUID, success BOOLEAN, error_message TEXT) AS $$
DECLARE
  proposal_id UUID;
  admin_id UUID;
BEGIN
  -- Check if user is admin
  admin_id := auth.uid();
  IF NOT is_admin(admin_id) THEN
    RAISE EXCEPTION 'Only admins can approve proposals';
  END IF;

  -- Process each proposal
  FOREACH proposal_id IN ARRAY proposal_ids
  LOOP
    BEGIN
      -- Update proposal status
      UPDATE proposals 
      SET status = 'approved', updated_at = timezone('utc'::text, now())
      WHERE proposals.id = proposal_id AND status = 'under_review';
      
      -- Check if update was successful
      IF FOUND THEN
        -- Log the action
        PERFORM log_admin_action(
          admin_id,
          'proposal_approved',
          'proposals',
          proposal_id,
          jsonb_build_object('status', 'under_review'),
          jsonb_build_object('status', 'approved'),
          admin_reason,
          jsonb_build_object('bulk_action', true)
        );
        
        RETURN QUERY SELECT proposal_id, true, NULL::TEXT;
      ELSE
        RETURN QUERY SELECT proposal_id, false, 'Proposal not found or not in under_review status';
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RETURN QUERY SELECT proposal_id, false, SQLERRM;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to bulk reject proposals
CREATE OR REPLACE FUNCTION bulk_reject_proposals(
  proposal_ids UUID[],
  rejection_reason TEXT
)
RETURNS TABLE(id UUID, success BOOLEAN, error_message TEXT) AS $$
DECLARE
  proposal_id UUID;
  admin_id UUID;
BEGIN
  -- Check if user is admin
  admin_id := auth.uid();
  IF NOT is_admin(admin_id) THEN
    RAISE EXCEPTION 'Only admins can reject proposals';
  END IF;

  IF rejection_reason IS NULL OR trim(rejection_reason) = '' THEN
    RAISE EXCEPTION 'Rejection reason is required';
  END IF;

  -- Process each proposal
  FOREACH proposal_id IN ARRAY proposal_ids
  LOOP
    BEGIN
      -- Update proposal status
      UPDATE proposals 
      SET status = 'rejected', updated_at = timezone('utc'::text, now())
      WHERE proposals.id = proposal_id AND status = 'under_review';
      
      -- Check if update was successful
      IF FOUND THEN
        -- Log the action
        PERFORM log_admin_action(
          admin_id,
          'proposal_rejected',
          'proposals',
          proposal_id,
          jsonb_build_object('status', 'under_review'),
          jsonb_build_object('status', 'rejected'),
          rejection_reason,
          jsonb_build_object('bulk_action', true)
        );
        
        RETURN QUERY SELECT proposal_id, true, NULL::TEXT;
      ELSE
        RETURN QUERY SELECT proposal_id, false, 'Proposal not found or not in under_review status';
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RETURN QUERY SELECT proposal_id, false, SQLERRM;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to change proposal status with reason
CREATE OR REPLACE FUNCTION admin_change_proposal_status(
  proposal_id UUID,
  new_status TEXT,
  reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  admin_id UUID;
  old_status TEXT;
  proposal_exists BOOLEAN;
BEGIN
  -- Check if user is admin
  admin_id := auth.uid();
  IF NOT is_admin(admin_id) THEN
    RAISE EXCEPTION 'Only admins can change proposal status';
  END IF;

  -- Validate new status
  IF new_status NOT IN ('under_review', 'approved', 'rejected', 'implemented') THEN
    RAISE EXCEPTION 'Invalid status: %', new_status;
  END IF;

  -- Get current status
  SELECT status INTO old_status FROM proposals WHERE id = proposal_id;
  
  IF old_status IS NULL THEN
    RAISE EXCEPTION 'Proposal not found';
  END IF;

  -- Update status
  UPDATE proposals 
  SET status = new_status, updated_at = timezone('utc'::text, now())
  WHERE id = proposal_id;

  -- Log the action (will be caught by trigger, but let's also log explicitly)
  PERFORM log_admin_action(
    admin_id,
    CASE 
      WHEN new_status = 'approved' THEN 'proposal_approved'
      WHEN new_status = 'rejected' THEN 'proposal_rejected'
      ELSE 'proposal_status_changed'
    END,
    'proposals',
    proposal_id,
    jsonb_build_object('status', old_status),
    jsonb_build_object('status', new_status),
    reason
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to change process status
CREATE OR REPLACE FUNCTION admin_change_process_status(
  process_id UUID,
  new_status TEXT,
  reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  admin_id UUID;
  old_status TEXT;
BEGIN
  -- Check if user is admin
  admin_id := auth.uid();
  IF NOT is_admin(admin_id) THEN
    RAISE EXCEPTION 'Only admins can change process status';
  END IF;

  -- Validate new status
  IF new_status NOT IN ('draft', 'active', 'closed', 'completed') THEN
    RAISE EXCEPTION 'Invalid status: %', new_status;
  END IF;

  -- Get current status
  SELECT status INTO old_status FROM processes WHERE id = process_id;
  
  IF old_status IS NULL THEN
    RAISE EXCEPTION 'Process not found';
  END IF;

  -- Update status
  UPDATE processes 
  SET status = new_status, updated_at = timezone('utc'::text, now())
  WHERE id = process_id;

  -- Log the action
  PERFORM log_admin_action(
    admin_id,
    'process_status_changed',
    'processes',
    process_id,
    jsonb_build_object('status', old_status),
    jsonb_build_object('status', new_status),
    reason
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get admin dashboard data
CREATE OR REPLACE FUNCTION get_admin_dashboard_summary()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Check if user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can access dashboard data';
  END IF;

  SELECT json_build_object(
    'pending_reviews', (
      SELECT COUNT(*) FROM proposals WHERE status = 'under_review'
    ),
    'proposals_today', (
      SELECT COUNT(*) FROM proposals 
      WHERE created_at >= CURRENT_DATE
    ),
    'active_processes', (
      SELECT COUNT(*) FROM processes WHERE status = 'active'
    ),
    'recent_actions', (
      SELECT json_agg(
        json_build_object(
          'id', id,
          'action_type', action_type,
          'target_table', target_table,
          'reason', reason,
          'created_at', created_at
        ) ORDER BY created_at DESC
      )
      FROM admin_actions 
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      LIMIT 10
    ),
    'proposal_stats', (
      SELECT json_build_object(
        'under_review', COUNT(*) FILTER (WHERE status = 'under_review'),
        'approved', COUNT(*) FILTER (WHERE status = 'approved'),
        'rejected', COUNT(*) FILTER (WHERE status = 'rejected'),
        'implemented', COUNT(*) FILTER (WHERE status = 'implemented')
      )
      FROM proposals
    ),
    'process_stats', (
      SELECT json_build_object(
        'draft', COUNT(*) FILTER (WHERE status = 'draft'),
        'active', COUNT(*) FILTER (WHERE status = 'active'),
        'closed', COUNT(*) FILTER (WHERE status = 'closed'),
        'completed', COUNT(*) FILTER (WHERE status = 'completed')
      )
      FROM processes
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get proposals pending review with details
CREATE OR REPLACE FUNCTION get_proposals_for_review(
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  title_ur TEXT,
  description TEXT,
  description_ur TEXT,
  author_id UUID,
  process_id UUID,
  process_title TEXT,
  created_at TIMESTAMPTZ,
  vote_count INTEGER,
  support_percentage NUMERIC
) AS $$
BEGIN
  -- Check if user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can access proposals for review';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.title_ur,
    p.description,
    p.description_ur,
    p.author_id,
    p.process_id,
    pr.title as process_title,
    p.created_at,
    p.vote_count,
    p.support_percentage
  FROM proposals p
  JOIN processes pr ON p.process_id = pr.id
  WHERE p.status = 'under_review'
  ORDER BY p.created_at ASC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to assign admin role to user
CREATE OR REPLACE FUNCTION assign_admin_role(
  target_user_id UUID,
  role_type TEXT,
  reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  admin_id UUID;
BEGIN
  -- Check if current user is government admin
  admin_id := auth.uid();
  IF NOT is_government_admin(admin_id) THEN
    RAISE EXCEPTION 'Only government admins can assign roles';
  END IF;

  -- Validate role type
  IF role_type NOT IN ('government_admin', 'moderator', 'facilitator') THEN
    RAISE EXCEPTION 'Invalid role type: %', role_type;
  END IF;

  -- Insert or update role
  INSERT INTO user_roles (user_id, role, scope, granted_by, is_active)
  VALUES (target_user_id, role_type, 'platform', admin_id, true)
  ON CONFLICT (user_id, role, scope, COALESCE(resource_id, '00000000-0000-0000-0000-000000000000'::uuid))
  WHERE is_active = true
  DO UPDATE SET 
    is_active = true,
    granted_by = admin_id,
    granted_at = timezone('utc'::text, now());

  -- Log the action
  PERFORM log_admin_action(
    admin_id,
    'user_role_granted',
    'user_roles',
    target_user_id,
    NULL,
    jsonb_build_object('role', role_type),
    reason
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permissions to authenticated users (RLS will handle authorization)
GRANT EXECUTE ON FUNCTION bulk_approve_proposals(UUID[], TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION bulk_reject_proposals(UUID[], TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_change_proposal_status(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_change_process_status(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_dashboard_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION get_proposals_for_review(INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION assign_admin_role(UUID, TEXT, TEXT) TO authenticated;

COMMENT ON FUNCTION bulk_approve_proposals IS 'Bulk approve multiple proposals with audit logging';
COMMENT ON FUNCTION bulk_reject_proposals IS 'Bulk reject multiple proposals with required reason';
COMMENT ON FUNCTION admin_change_proposal_status IS 'Change individual proposal status with reason';
COMMENT ON FUNCTION admin_change_process_status IS 'Change process status with reason';
COMMENT ON FUNCTION get_admin_dashboard_summary IS 'Get comprehensive dashboard data for admins';
COMMENT ON FUNCTION get_proposals_for_review IS 'Get paginated list of proposals pending review';
COMMENT ON FUNCTION assign_admin_role IS 'Assign admin roles to users (government admin only)';