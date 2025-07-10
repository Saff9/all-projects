-- Security updates migration
-- Add proper environment configuration and security enhancements

-- Create a secure configuration table for environment variables
CREATE TABLE IF NOT EXISTS app_config (
    key TEXT PRIMARY KEY,
    value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on config table
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

-- Only service role can access config
CREATE POLICY "Service role can access app config" ON app_config
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Function to safely get config values
CREATE OR REPLACE FUNCTION get_app_config(config_key TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    config_value TEXT;
BEGIN
    SELECT value INTO config_value
    FROM app_config
    WHERE key = config_key;

    RETURN config_value;
END;
$$;

-- Function to validate API keys format
CREATE OR REPLACE FUNCTION validate_api_key_format(api_key TEXT, provider TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    -- Basic validation for common API key formats
    CASE provider
        WHEN 'openai' THEN
            RETURN api_key ~ '^sk-[a-zA-Z0-9]{48,}$';
        WHEN 'anthropic' THEN
            RETURN api_key ~ '^sk-ant-[a-zA-Z0-9_-]{95,}$';
        WHEN 'google' THEN
            RETURN LENGTH(api_key) >= 20;
        WHEN 'azure' THEN
            RETURN LENGTH(api_key) >= 32;
        ELSE
            RETURN LENGTH(api_key) >= 10;
    END CASE;
END;
$$;

-- Function to rate limit API calls (basic implementation)
CREATE TABLE IF NOT EXISTS api_rate_limits (
    user_id UUID NOT NULL,
    endpoint TEXT NOT NULL,
    request_count INTEGER DEFAULT 0,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, endpoint)
);

CREATE OR REPLACE FUNCTION check_rate_limit(
    p_user_id UUID,
    p_endpoint TEXT,
    p_max_requests INTEGER DEFAULT 100,
    p_window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    current_count INTEGER;
    window_start TIMESTAMP WITH TIME ZONE;
BEGIN
    window_start := NOW() - INTERVAL '1 minute' * p_window_minutes;

    -- Get current count for this window
    SELECT request_count INTO current_count
    FROM api_rate_limits
    WHERE user_id = p_user_id AND endpoint = p_endpoint AND window_start >= window_start;

    -- Reset if window has passed
    IF current_count IS NULL THEN
        INSERT INTO api_rate_limits (user_id, endpoint, request_count, window_start)
        VALUES (p_user_id, p_endpoint, 1, NOW());
        RETURN TRUE;
    END IF;

    -- Check if limit exceeded
    IF current_count >= p_max_requests THEN
        RETURN FALSE;
    END IF;

    -- Increment counter
    UPDATE api_rate_limits
    SET request_count = request_count + 1
    WHERE user_id = p_user_id AND endpoint = p_endpoint AND window_start >= window_start;

    RETURN TRUE;
END;
$$;

-- Enhanced delete function with proper security
CREATE OR REPLACE FUNCTION secure_delete_storage_object(
    bucket TEXT,
    object TEXT,
    request_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result_record RECORD;
    project_url TEXT;
    service_role_key TEXT;
BEGIN
    -- Validate inputs
    IF bucket IS NULL OR object IS NULL OR bucket = '' OR object = '' THEN
        RETURN json_build_object('status', 400, 'error', 'Invalid bucket or object name');
    END IF;

    IF request_user_id IS NULL THEN
        RETURN json_build_object('status', 401, 'error', 'Unauthorized');
    END IF;

    -- Get configuration from environment or database
    project_url := COALESCE(get_app_config('supabase_url'), current_setting('app.settings.supabase_url', TRUE));
    service_role_key := COALESCE(get_app_config('service_role_key'), current_setting('app.settings.service_role_key', TRUE));

    IF service_role_key = '' THEN
        RETURN json_build_object('status', 500, 'error', 'Service configuration missing');
    END IF;

    -- Verify user owns the object (you should implement proper ownership checks)
    -- This is a placeholder - implement based on your storage structure
    -- IF NOT check_object_ownership(request_user_id, bucket, object) THEN
    --     RETURN json_build_object('status', 403, 'error', 'Access denied');
    -- END IF;

    SELECT INTO result_record
        result.status::INT, result.content::TEXT
    FROM extensions.http((
        'DELETE',
        project_url || '/storage/v1/object/' || bucket || '/' || object,
        ARRAY[extensions.http_header('authorization','Bearer ' || service_role_key)],
        NULL,
        NULL)::extensions.http_request) AS result;

    RETURN json_build_object('status', result_record.status, 'content', result_record.content);
END;
$$;

-- Update trigger for config table
CREATE OR REPLACE FUNCTION update_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_config_updated_at_trigger
    BEFORE UPDATE ON app_config
    FOR EACH ROW EXECUTE FUNCTION update_config_updated_at();

-- Insert default config values (these should be set via environment variables)
-- INSERT INTO app_config (key, value) VALUES
-- ('supabase_url', 'your_supabase_url'),
-- ('service_role_key', 'your_service_role_key')
-- ON CONFLICT (key) DO NOTHING;