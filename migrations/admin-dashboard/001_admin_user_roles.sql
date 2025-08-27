-- Admin Dashboard Migration 1: User Roles
-- This migration creates the user_roles table if it doesn't exist and sets up admin roles

-- Create user_roles table (if not exists, since it might already exist from TypeScript models)
CREATE TABLE IF NOT EXISTS user_roles (
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON user_roles(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_roles_scope_resource ON user_roles(scope, resource_id);

-- Create unique constraint to prevent duplicate roles per user/scope
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_roles_unique 
ON user_roles(user_id, role, scope, COALESCE(resource_id, '00000000-0000-0000-0000-000000000000'::uuid))
WHERE is_active = true;

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles table
-- Users can view their own roles
CREATE POLICY "Users can view own roles" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all roles
CREATE POLICY "Admins can view all roles" ON user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('government_admin', 'moderator')
      AND ur.is_active = true
    )
  );

-- Admins can insert/update/delete roles
CREATE POLICY "Admins can manage roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'government_admin'
      AND ur.is_active = true
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin role (replace with actual admin user ID)
-- This is commented out - you'll need to manually add the first admin
-- INSERT INTO user_roles (user_id, role, scope, granted_by)
-- VALUES ('your-admin-user-id', 'government_admin', 'platform', NULL);

COMMENT ON TABLE user_roles IS 'Stores user role assignments for admin access control';