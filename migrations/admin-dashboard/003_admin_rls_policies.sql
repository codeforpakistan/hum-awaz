-- Admin Dashboard Migration 3: RLS Policies for Admin Access
-- This migration creates RLS policies that allow admins to bypass normal restrictions

-- Drop existing restrictive policies if they exist and recreate with admin bypass
-- We'll add admin bypass to existing tables

-- Helper function to check if user is admin
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

-- Helper function to check if user is government admin (higher privileges)
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

-- Update proposals policies to allow admin access
-- Admin can view all proposals (including under_review)
CREATE POLICY "Admins can view all proposals" ON proposals
  FOR SELECT USING (is_admin());

-- Admin can update proposal status and details
CREATE POLICY "Admins can update proposals" ON proposals
  FOR UPDATE USING (is_admin());

-- Admin can delete proposals if needed
CREATE POLICY "Government admins can delete proposals" ON proposals
  FOR DELETE USING (is_government_admin());

-- Update processes policies
-- Admin can view all processes regardless of status
CREATE POLICY "Admins can view all processes" ON processes
  FOR SELECT USING (is_admin());

-- Admin can update processes
CREATE POLICY "Admins can update processes" ON processes
  FOR UPDATE USING (is_admin());

-- Admin can insert new processes
CREATE POLICY "Admins can create processes" ON processes
  FOR INSERT WITH CHECK (is_admin());

-- Admin can delete processes
CREATE POLICY "Government admins can delete processes" ON processes
  FOR DELETE USING (is_government_admin());

-- Update discussions policies for admin moderation
CREATE POLICY "Admins can view all discussions" ON discussions
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update discussions" ON discussions
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete discussions" ON discussions
  FOR DELETE USING (is_admin());

-- Update votes policies for admin oversight
CREATE POLICY "Admins can view all votes" ON votes
  FOR SELECT USING (is_admin());

-- Update profiles policies for admin user management
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update profiles" ON profiles
  FOR UPDATE USING (is_admin());

-- Update participations policies for admin analytics
CREATE POLICY "Admins can view all participations" ON participations
  FOR SELECT USING (is_admin());

-- Create view for admin dashboard stats
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM proposals WHERE status = 'under_review') as pending_proposals,
  (SELECT COUNT(*) FROM proposals WHERE status = 'approved') as approved_proposals,
  (SELECT COUNT(*) FROM proposals WHERE status = 'rejected') as rejected_proposals,
  (SELECT COUNT(*) FROM processes WHERE status = 'draft') as draft_processes,
  (SELECT COUNT(*) FROM processes WHERE status = 'active') as active_processes,
  (SELECT COUNT(*) FROM processes WHERE status = 'closed') as closed_processes,
  (SELECT COUNT(*) FROM profiles) as total_users,
  (SELECT COUNT(*) FROM user_roles WHERE role IN ('government_admin', 'moderator') AND is_active = true) as total_admins,
  (SELECT COUNT(*) FROM votes WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as votes_this_week,
  (SELECT COUNT(*) FROM discussions WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as discussions_this_week;

-- Grant access to admin view
GRANT SELECT ON admin_dashboard_stats TO authenticated;

-- Create RLS policy for the view
CREATE POLICY "Admins can view dashboard stats" ON admin_dashboard_stats
  FOR SELECT USING (is_admin());

-- Create materialized view for admin dashboard (for performance)
CREATE MATERIALIZED VIEW admin_dashboard_metrics AS
SELECT
  p.status,
  p.created_at::date as date,
  COUNT(*) as count,
  'proposals' as entity_type
FROM proposals p
WHERE p.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY p.status, p.created_at::date

UNION ALL

SELECT
  pr.status,
  pr.created_at::date as date,
  COUNT(*) as count,
  'processes' as entity_type
FROM processes pr
WHERE pr.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY pr.status, pr.created_at::date

ORDER BY date DESC;

-- Create index on materialized view
CREATE INDEX idx_admin_dashboard_metrics_date ON admin_dashboard_metrics(date);
CREATE INDEX idx_admin_dashboard_metrics_entity ON admin_dashboard_metrics(entity_type);

-- Grant access to materialized view
GRANT SELECT ON admin_dashboard_metrics TO authenticated;

-- Function to refresh dashboard metrics (can be called by cron or admin action)
CREATE OR REPLACE FUNCTION refresh_admin_dashboard_metrics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW admin_dashboard_metrics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to admins
GRANT EXECUTE ON FUNCTION refresh_admin_dashboard_metrics() TO authenticated;

-- Create policy for materialized view
ALTER TABLE admin_dashboard_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view dashboard metrics" ON admin_dashboard_metrics
  FOR SELECT USING (is_admin());

COMMENT ON FUNCTION is_admin IS 'Helper function to check if current user has admin privileges';
COMMENT ON FUNCTION is_government_admin IS 'Helper function to check if current user has government admin privileges';
COMMENT ON VIEW admin_dashboard_stats IS 'Real-time stats for admin dashboard';
COMMENT ON MATERIALIZED VIEW admin_dashboard_metrics IS 'Historical metrics for admin dashboard charts';