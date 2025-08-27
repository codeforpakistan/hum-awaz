-- Admin Dashboard Migration 2: Admin Actions Audit Trail
-- This migration creates an audit table to track all admin actions

-- Create admin_actions table for audit trail
CREATE TABLE admin_actions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'proposal_approved', 'proposal_rejected', 'proposal_status_changed',
    'process_status_changed', 'process_updated', 'user_role_granted', 
    'user_role_revoked', 'bulk_action'
  )),
  target_table TEXT NOT NULL CHECK (target_table IN ('proposals', 'processes', 'user_roles')),
  target_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  reason TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for performance and querying
CREATE INDEX idx_admin_actions_admin_user ON admin_actions(admin_user_id);
CREATE INDEX idx_admin_actions_action_type ON admin_actions(action_type);
CREATE INDEX idx_admin_actions_target ON admin_actions(target_table, target_id);
CREATE INDEX idx_admin_actions_created_at ON admin_actions(created_at DESC);
CREATE INDEX idx_admin_actions_metadata ON admin_actions USING GIN(metadata);

-- Enable RLS
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_actions table
-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON admin_actions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('government_admin', 'moderator')
      AND ur.is_active = true
    )
  );

-- Only admins can insert audit logs (handled by triggers/functions)
CREATE POLICY "System can insert audit logs" ON admin_actions
  FOR INSERT WITH CHECK (true); -- Will be restricted by application logic

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  p_admin_user_id UUID,
  p_action_type TEXT,
  p_target_table TEXT,
  p_target_id UUID,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_reason TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO admin_actions (
    admin_user_id, action_type, target_table, target_id,
    old_values, new_values, reason, metadata, ip_address, user_agent
  ) VALUES (
    p_admin_user_id, p_action_type, p_target_table, p_target_id,
    p_old_values, p_new_values, p_reason, p_metadata, p_ip_address, p_user_agent
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger function to automatically log proposal status changes
CREATE OR REPLACE FUNCTION audit_proposal_changes()
RETURNS TRIGGER AS $$
DECLARE
  admin_user_id UUID;
  old_json JSONB;
  new_json JSONB;
BEGIN
  -- Get the current user (admin making the change)
  admin_user_id := auth.uid();
  
  -- Skip if no authenticated user or if it's not a status change
  IF admin_user_id IS NULL OR (OLD.status = NEW.status) THEN
    RETURN NEW;
  END IF;
  
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = admin_user_id
    AND ur.role IN ('government_admin', 'moderator')
    AND ur.is_active = true
  ) THEN
    RETURN NEW;
  END IF;
  
  -- Prepare old and new values
  old_json := jsonb_build_object('status', OLD.status);
  new_json := jsonb_build_object('status', NEW.status);
  
  -- Log the action
  PERFORM log_admin_action(
    admin_user_id,
    CASE 
      WHEN NEW.status = 'approved' THEN 'proposal_approved'
      WHEN NEW.status = 'rejected' THEN 'proposal_rejected'
      ELSE 'proposal_status_changed'
    END,
    'proposals',
    NEW.id,
    old_json,
    new_json
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for proposal status changes
CREATE TRIGGER audit_proposal_status_changes
  AFTER UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION audit_proposal_changes();

-- Create trigger function for process changes
CREATE OR REPLACE FUNCTION audit_process_changes()
RETURNS TRIGGER AS $$
DECLARE
  admin_user_id UUID;
  old_json JSONB;
  new_json JSONB;
BEGIN
  admin_user_id := auth.uid();
  
  IF admin_user_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = admin_user_id
    AND ur.role IN ('government_admin', 'moderator')
    AND ur.is_active = true
  ) THEN
    RETURN NEW;
  END IF;
  
  -- Prepare old and new values
  old_json := to_jsonb(OLD);
  new_json := to_jsonb(NEW);
  
  -- Log the action
  PERFORM log_admin_action(
    admin_user_id,
    'process_updated',
    'processes',
    NEW.id,
    old_json,
    new_json
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for process changes
CREATE TRIGGER audit_process_changes
  AFTER UPDATE ON processes
  FOR EACH ROW
  EXECUTE FUNCTION audit_process_changes();

COMMENT ON TABLE admin_actions IS 'Audit trail for all admin actions in the system';