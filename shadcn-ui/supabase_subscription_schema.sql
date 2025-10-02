-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_id TEXT NOT NULL CHECK (plan_id IN ('free', 'monthly', 'yearly', 'trial')),
    status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'cancelled', 'pending', 'trial')) DEFAULT 'inactive',
    start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    payment_reference TEXT,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    stripe_session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON subscriptions(status);
CREATE INDEX IF NOT EXISTS subscriptions_stripe_subscription_id_idx ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS subscriptions_end_date_idx ON subscriptions(end_date);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON subscriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own subscriptions
CREATE POLICY "Users can insert own subscriptions" ON subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own subscriptions
CREATE POLICY "Users can update own subscriptions" ON subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Service role can manage all subscriptions (for webhooks)
CREATE POLICY "Service role can manage all subscriptions" ON subscriptions
    FOR ALL USING (auth.role() = 'service_role');

-- Create a function to get active subscription for a user
CREATE OR REPLACE FUNCTION get_active_subscription(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    plan_id TEXT,
    status TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.plan_id,
        s.status,
        s.start_date,
        s.end_date,
        (s.status = 'active' AND s.end_date > NOW()) as is_active
    FROM subscriptions s
    WHERE s.user_id = user_uuid
    ORDER BY s.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if user has premium access
CREATE OR REPLACE FUNCTION has_premium_access(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    sub_record RECORD;
BEGIN
    SELECT * INTO sub_record
    FROM get_active_subscription(user_uuid)
    LIMIT 1;
    
    IF sub_record IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN (
        sub_record.status IN ('active', 'trial') 
        AND sub_record.end_date > NOW()
        AND sub_record.plan_id IN ('monthly', 'yearly', 'trial')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create payment_logs table for tracking payment events
CREATE TABLE IF NOT EXISTS payment_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    stripe_event_id TEXT,
    amount INTEGER,
    currency TEXT DEFAULT 'usd',
    status TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for payment_logs
CREATE INDEX IF NOT EXISTS payment_logs_user_id_idx ON payment_logs(user_id);
CREATE INDEX IF NOT EXISTS payment_logs_subscription_id_idx ON payment_logs(subscription_id);
CREATE INDEX IF NOT EXISTS payment_logs_event_type_idx ON payment_logs(event_type);
CREATE INDEX IF NOT EXISTS payment_logs_created_at_idx ON payment_logs(created_at);

-- RLS for payment_logs
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payment logs" ON payment_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all payment logs" ON payment_logs
    FOR ALL USING (auth.role() = 'service_role');

-- Insert sample data (optional - remove in production)
-- This creates a trial subscription for testing
/*
INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date, payment_reference)
VALUES (
    'your-test-user-id', 
    'trial', 
    'trial', 
    NOW(), 
    NOW() + INTERVAL '7 days',
    'trial_reference'
);
*/