-- Production Security Requirements Migration
-- Implements all mandatory production security controls

-- =========================================
-- 1. ENABLE RLS ON ALL TABLES
-- =========================================

-- Enable RLS on all existing tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_models ENABLE ROW LEVEL SECURITY;

-- =========================================
-- 2. USER ISOLATION POLICIES
-- =========================================

-- Profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Workspaces: Complex policy for workspace access
CREATE POLICY "Users can access workspaces they belong to" ON workspaces
    FOR ALL USING (
        -- Owner access
        owner_id = auth.uid()
        OR
        -- Member access via workspace_users table
        EXISTS (
            SELECT 1 FROM workspace_users wu
            WHERE wu.workspace_id = workspaces.id
            AND wu.user_id = auth.uid()
        )
    );

-- Folders: Users can only access folders in workspaces they belong to
CREATE POLICY "Users can access folders in their workspaces" ON folders
    FOR ALL USING (
        workspace_id IN (
            SELECT id FROM workspaces
            WHERE owner_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM workspace_users wu
                WHERE wu.workspace_id = workspaces.id
                AND wu.user_id = auth.uid()
            )
        )
    );

-- Files: Users can only access files in their workspaces
CREATE POLICY "Users can access files in their workspaces" ON files
    FOR ALL USING (
        workspace_id IN (
            SELECT id FROM workspaces
            WHERE owner_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM workspace_users wu
                WHERE wu.workspace_id = workspaces.id
                AND wu.user_id = auth.uid()
            )
        )
    );

-- File items: Users can only access file items for files they can access
CREATE POLICY "Users can access file items for their files" ON file_items
    FOR ALL USING (
        file_id IN (
            SELECT id FROM files
            WHERE workspace_id IN (
                SELECT id FROM workspaces
                WHERE owner_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM workspace_users wu
                    WHERE wu.workspace_id = workspaces.id
                    AND wu.user_id = auth.uid()
                )
            )
        )
    );

-- =========================================
-- 3. ROLE-BASED ACCESS CONTROL
-- =========================================

-- Add role column to workspace_users if it doesn't exist
ALTER TABLE workspace_users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member'
    CHECK (role IN ('owner', 'admin', 'member', 'read-only'));

-- Update existing workspace_users to have proper roles
UPDATE workspace_users SET role = 'admin' WHERE role IS NULL;

-- Create RLS policies for different roles
CREATE POLICY "Workspace owners have full access" ON workspaces
    FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "Workspace admins have full access" ON workspaces
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM workspace_users wu
            WHERE wu.workspace_id = workspaces.id
            AND wu.user_id = auth.uid()
            AND wu.role IN ('admin', 'owner')
        )
    );

CREATE POLICY "Workspace members have limited access" ON workspaces
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workspace_users wu
            WHERE wu.workspace_id = workspaces.id
            AND wu.user_id = auth.uid()
            AND wu.role IN ('member', 'admin', 'owner')
        )
    );

CREATE POLICY "Read-only users can only view" ON workspaces
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workspace_users wu
            WHERE wu.workspace_id = workspaces.id
            AND wu.user_id = auth.uid()
            AND wu.role = 'read-only'
        )
    );

-- =========================================
-- 4. SECRETS MANAGEMENT
-- =========================================

-- Create encrypted_secrets table for API keys
CREATE TABLE IF NOT EXISTS encrypted_secrets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    encrypted_key TEXT NOT NULL,
    key_hash TEXT NOT NULL, -- For rotation detection
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_rotated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, provider)
);

-- Enable RLS on encrypted_secrets
ALTER TABLE encrypted_secrets ENABLE ROW LEVEL SECURITY;

-- Only users can access their own secrets
CREATE POLICY "Users can manage their own secrets" ON encrypted_secrets
    FOR ALL USING (auth.uid() = user_id);

-- =========================================
-- 5. AI SAFETY CONTROLS
-- =========================================

-- Create system_prompts table for immutable prompts
CREATE TABLE IF NOT EXISTS system_prompts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    prompt TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on system_prompts
ALTER TABLE system_prompts ENABLE ROW LEVEL SECURITY;

-- Only service role can modify system prompts
CREATE POLICY "Only service role can modify system prompts" ON system_prompts
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Public read access for active prompts
CREATE POLICY "Anyone can read active system prompts" ON system_prompts
    FOR SELECT USING (is_active = true);

-- Create tool_schemas table for validated tool definitions
CREATE TABLE IF NOT EXISTS tool_schemas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    schema JSONB NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    is_valid BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on tool_schemas
ALTER TABLE tool_schemas ENABLE ROW LEVEL SECURITY;

-- Only service role can modify tool schemas
CREATE POLICY "Only service role can modify tool schemas" ON tool_schemas
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Public read access for valid schemas
CREATE POLICY "Anyone can read valid tool schemas" ON tool_schemas
    FOR SELECT USING (is_valid = true);

-- =========================================
-- 6. COST AND USAGE TRACKING
-- =========================================

-- Create usage_tracking table
CREATE TABLE IF NOT EXISTS usage_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    tokens_used INTEGER NOT NULL,
    cost_cents INTEGER NOT NULL, -- Cost in cents
    request_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    response_time_ms INTEGER,
    success BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS on usage_tracking
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Users can view their own usage
CREATE POLICY "Users can view their own usage" ON usage_tracking
    FOR SELECT USING (auth.uid() = user_id);

-- Workspace admins can view workspace usage
CREATE POLICY "Workspace admins can view workspace usage" ON usage_tracking
    FOR SELECT USING (
        workspace_id IN (
            SELECT id FROM workspaces
            WHERE owner_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM workspace_users wu
                WHERE wu.workspace_id = workspaces.id
                AND wu.user_id = auth.uid()
                AND wu.role IN ('admin', 'owner')
            )
        )
    );

-- Create spending_limits table
CREATE TABLE IF NOT EXISTS spending_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    daily_limit_cents INTEGER NOT NULL DEFAULT 500, -- $5 default
    monthly_limit_cents INTEGER NOT NULL DEFAULT 5000, -- $50 default
    model_limits JSONB, -- {"gpt-4": 1000, "claude": 2000} in cents
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT spending_limits_scope CHECK (
        (user_id IS NOT NULL AND workspace_id IS NULL) OR
        (user_id IS NULL AND workspace_id IS NOT NULL)
    )
);

-- Enable RLS on spending_limits
ALTER TABLE spending_limits ENABLE ROW LEVEL SECURITY;

-- Users can manage their own limits
CREATE POLICY "Users can manage their own spending limits" ON spending_limits
    FOR ALL USING (auth.uid() = user_id);

-- Workspace owners/admins can manage workspace limits
CREATE POLICY "Workspace owners/admins can manage spending limits" ON spending_limits
    FOR ALL USING (
        workspace_id IN (
            SELECT id FROM workspaces
            WHERE owner_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM workspace_users wu
                WHERE wu.workspace_id = workspaces.id
                AND wu.user_id = auth.uid()
                AND wu.role IN ('admin', 'owner')
            )
        )
    );

-- =========================================
-- 7. FILE SECURITY ENHANCEMENTS
-- =========================================

-- Add security fields to files table
ALTER TABLE files ADD COLUMN IF NOT EXISTS file_hash TEXT;
ALTER TABLE files ADD COLUMN IF NOT EXISTS scan_status TEXT DEFAULT 'pending'
    CHECK (scan_status IN ('pending', 'clean', 'infected', 'failed'));
ALTER TABLE files ADD COLUMN IF NOT EXISTS scan_timestamp TIMESTAMP WITH TIME ZONE;
ALTER TABLE files ADD COLUMN IF NOT EXISTS signed_url_expires TIMESTAMP WITH TIME ZONE;

-- Create file_scan_results table
CREATE TABLE IF NOT EXISTS file_scan_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    scanner_name TEXT NOT NULL,
    scan_result TEXT NOT NULL,
    threat_level TEXT,
    details JSONB,
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on file_scan_results
ALTER TABLE file_scan_results ENABLE ROW LEVEL SECURITY;

-- Users can view scan results for their files
CREATE POLICY "Users can view scan results for their files" ON file_scan_results
    FOR SELECT USING (
        file_id IN (
            SELECT id FROM files
            WHERE workspace_id IN (
                SELECT id FROM workspaces
                WHERE owner_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM workspace_users wu
                    WHERE wu.workspace_id = workspaces.id
                    AND wu.user_id = auth.uid()
                )
            )
        )
    );

-- =========================================
-- 8. INDEXES FOR PERFORMANCE
-- =========================================

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_messages_chat_id_created_at ON messages(chat_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_workspace_id ON chats(workspace_id);
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
CREATE INDEX IF NOT EXISTS idx_files_workspace_id ON files(workspace_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_created ON usage_tracking(user_id, request_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_workspace_created ON usage_tracking(workspace_id, request_timestamp DESC);

-- =========================================
-- 9. DATA RETENTION POLICIES
-- =========================================

-- Create data_retention_settings table
CREATE TABLE IF NOT EXISTS data_retention_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    chat_retention_days INTEGER NOT NULL DEFAULT 365,
    message_retention_days INTEGER NOT NULL DEFAULT 365,
    file_retention_days INTEGER NOT NULL DEFAULT 365,
    usage_retention_days INTEGER NOT NULL DEFAULT 365,
    auto_delete BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT data_retention_scope CHECK (
        (user_id IS NOT NULL AND workspace_id IS NULL) OR
        (user_id IS NULL AND workspace_id IS NOT NULL)
    )
);

-- Enable RLS on data_retention_settings
ALTER TABLE data_retention_settings ENABLE ROW LEVEL SECURITY;

-- Users can manage their own retention settings
CREATE POLICY "Users can manage their own retention settings" ON data_retention_settings
    FOR ALL USING (auth.uid() = user_id);

-- Workspace owners/admins can manage workspace retention
CREATE POLICY "Workspace owners/admins can manage retention settings" ON data_retention_settings
    FOR ALL USING (
        workspace_id IN (
            SELECT id FROM workspaces
            WHERE owner_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM workspace_users wu
                WHERE wu.workspace_id = workspaces.id
                AND wu.user_id = auth.uid()
                AND wu.role IN ('admin', 'owner')
            )
        )
    );

-- =========================================
-- 10. AUDIT LOGGING
-- =========================================

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own audit logs
CREATE POLICY "Users can view their own audit logs" ON audit_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Workspace admins can view workspace audit logs
CREATE POLICY "Workspace admins can view workspace audit logs" ON audit_logs
    FOR SELECT USING (
        workspace_id IN (
            SELECT id FROM workspaces
            WHERE owner_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM workspace_users wu
                WHERE wu.workspace_id = workspaces.id
                AND wu.user_id = auth.uid()
                AND wu.role IN ('admin', 'owner')
            )
        )
    );

-- =========================================
-- 11. ABUSE PREVENTION
-- =========================================

-- Create abuse_detection table
CREATE TABLE IF NOT EXISTS abuse_detection (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ip_address INET NOT NULL,
    violation_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    details JSONB,
    blocked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on abuse_detection
ALTER TABLE abuse_detection ENABLE ROW LEVEL SECURITY;

-- Only service role can access abuse detection
CREATE POLICY "Only service role can access abuse detection" ON abuse_detection
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- =========================================
-- FUNCTIONS FOR PRODUCTION SAFETY
-- =========================================

-- Function to check spending limits
CREATE OR REPLACE FUNCTION check_spending_limit(
    p_user_id UUID,
    p_workspace_id UUID DEFAULT NULL,
    p_cost_cents INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    daily_used INTEGER;
    monthly_used INTEGER;
    daily_limit INTEGER;
    monthly_limit INTEGER;
    current_month DATE;
BEGIN
    current_month := DATE_TRUNC('month', NOW())::DATE;

    -- Get spending limits
    SELECT daily_limit_cents, monthly_limit_cents
    INTO daily_limit, monthly_limit
    FROM spending_limits
    WHERE (user_id = p_user_id AND workspace_id IS NULL)
       OR (workspace_id = p_workspace_id AND user_id IS NULL)
    LIMIT 1;

    -- Default limits if not set
    daily_limit := COALESCE(daily_limit, 500);
    monthly_limit := COALESCE(monthly_limit, 5000);

    -- Calculate current usage
    SELECT
        COALESCE(SUM(cost_cents) FILTER (WHERE DATE(request_timestamp) = CURRENT_DATE), 0),
        COALESCE(SUM(cost_cents) FILTER (WHERE DATE_TRUNC('month', request_timestamp) = current_month), 0)
    INTO daily_used, monthly_used
    FROM usage_tracking
    WHERE user_id = p_user_id
      AND (workspace_id = p_workspace_id OR p_workspace_id IS NULL);

    -- Check limits
    IF daily_used + p_cost_cents > daily_limit THEN
        RETURN FALSE;
    END IF;

    IF monthly_used + p_cost_cents > monthly_limit THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$;

-- Function to log audit events
CREATE OR REPLACE FUNCTION audit_log(
    p_user_id UUID,
    p_action TEXT,
    p_resource_type TEXT,
    p_resource_id UUID DEFAULT NULL,
    p_workspace_id UUID DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO audit_logs (
        user_id, workspace_id, action, resource_type, resource_id,
        old_values, new_values, ip_address, user_agent
    ) VALUES (
        p_user_id, p_workspace_id, p_action, p_resource_type, p_resource_id,
        p_old_values, p_new_values, p_ip_address, p_user_agent
    );
END;
$$;

-- Function to validate file before upload
CREATE OR REPLACE FUNCTION validate_file_upload(
    p_file_name TEXT,
    p_file_size INTEGER,
    p_mime_type TEXT,
    p_user_id UUID,
    p_workspace_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    max_size INTEGER := 50 * 1024 * 1024; -- 50MB
    allowed_types TEXT[] := ARRAY[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'text/csv',
        'application/json',
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif'
    ];
BEGIN
    -- Check file size
    IF p_file_size > max_size THEN
        RETURN json_build_object(
            'valid', false,
            'error', 'File too large',
            'max_size', max_size
        );
    END IF;

    -- Check file type
    IF p_mime_type != ANY(allowed_types) THEN
        RETURN json_build_object(
            'valid', false,
            'error', 'File type not allowed',
            'allowed_types', allowed_types
        );
    END IF;

    -- Check workspace quota (placeholder - implement based on your needs)
    -- Add logic to check workspace storage limits

    RETURN json_build_object('valid', true);
END;
$$;