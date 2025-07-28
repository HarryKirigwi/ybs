-- Corrected SQL Schema Script (Run in Supabase SQL Editor)

-- Note: DO NOT try to enable RLS on auth.users - it's managed by Supabase

---
-- Profiles table (extends auth.users)
---
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  phone_number text UNIQUE NOT NULL,
  full_name text NOT NULL,
  username text UNIQUE NOT NULL,
  referral_code text UNIQUE NOT NULL,
  referred_by uuid REFERENCES public.profiles(id),
  is_active boolean DEFAULT false,
  activation_paid_at timestamp with time zone,
  total_earnings decimal(10,2) DEFAULT 0,
  available_balance decimal(10,2) DEFAULT 0,
  pending_balance decimal(10,2) DEFAULT 0,
  membership_level text DEFAULT 'inactive' CHECK (membership_level IN ('inactive', 'silver', 'bronze', 'gold')),
  active_direct_referrals integer DEFAULT 0,
  phone_verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

---
-- Activation payments table
---
CREATE TABLE public.activation_payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL DEFAULT 600.00,
  payment_method text NOT NULL,
  payment_reference text UNIQUE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at timestamp with time zone DEFAULT now(),
  paid_at timestamp with time zone
);

---
-- Referral hierarchy table
---
CREATE TABLE public.referral_hierarchy (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  referrer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  level integer NOT NULL CHECK (level >= 1 AND level <= 3),
  is_active boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

---
-- Referral rewards table
---
CREATE TABLE public.referral_rewards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  level integer NOT NULL CHECK (level >= 1 AND level <= 3),
  amount decimal(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  created_at timestamp with time zone DEFAULT now()
);

---
-- Phone verification table
---
CREATE TABLE public.phone_verification (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number text NOT NULL,
  code text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

---
-- Indexes for performance
---
CREATE INDEX idx_profiles_phone ON profiles(phone_number);
CREATE INDEX idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX idx_profiles_referred_by ON profiles(referred_by);
CREATE INDEX idx_referral_hierarchy_referrer ON referral_hierarchy(referrer_id);
CREATE INDEX idx_referral_hierarchy_user ON referral_hierarchy(user_id);
CREATE INDEX idx_referral_rewards_referrer ON referral_rewards(referrer_id);
CREATE INDEX idx_phone_verification_phone ON phone_verification(phone_number);
CREATE INDEX idx_activation_payments_user ON activation_payments(user_id);
CREATE INDEX idx_activation_payments_reference ON activation_payments(payment_reference);

---
-- Function to generate referral code
---
CREATE OR REPLACE FUNCTION generate_referral_code() RETURNS text AS $$
BEGIN
  RETURN upper(substring(md5(random()::text) from 1 for 8));
END;
$$ LANGUAGE plpgsql;

---
-- Function to handle new user registration
---
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, phone_number, full_name, username, referral_code)
  VALUES (
    new.id,
    COALESCE(new.phone, ''),
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'username', ''),
    generate_referral_code()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

---
-- Trigger for new user registration
---
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

---
-- Function to update referrer balances and membership levels
---
CREATE OR REPLACE FUNCTION update_referrer_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update referrer balance when reward is paid
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    UPDATE profiles
    SET
      total_earnings = total_earnings + NEW.amount,
      available_balance = available_balance + NEW.amount
    WHERE id = NEW.referrer_id;
  END IF;

  -- Update membership level for level 1 referrals
  IF NEW.level = 1 THEN
    UPDATE profiles
    SET
      active_direct_referrals = (
        SELECT COUNT(*)
        FROM referral_hierarchy
        WHERE referrer_id = NEW.referrer_id
        AND level = 1
        AND is_active = true
      ),
      membership_level = CASE
        WHEN (
          SELECT COUNT(*)
          FROM referral_hierarchy
          WHERE referrer_id = NEW.referrer_id
          AND level = 1
          AND is_active = true
        ) >= 30 THEN 'gold'
        WHEN (
          SELECT COUNT(*)
          FROM referral_hierarchy
          WHERE referrer_id = NEW.referrer_id
          AND level = 1
          AND is_active = true
        ) >= 20 THEN 'bronze'
        WHEN (
          SELECT COUNT(*)
          FROM referral_hierarchy
          WHERE referrer_id = NEW.referrer_id
          AND level = 1
          AND is_active = true
        ) >= 10 THEN 'silver'
        ELSE 'inactive'
      END
    WHERE id = NEW.referrer_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

---
-- Trigger to update referrer stats
---
CREATE TRIGGER update_referrer_stats_trigger
  AFTER UPDATE ON referral_rewards
  FOR EACH ROW
  EXECUTE FUNCTION update_referrer_stats();

---
-- Enable RLS on our tables (NOT on auth.users)
---
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activation_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_hierarchy ENABLE ROW LEVEL SECURITY;
ALTER TABLE phone_verification ENABLE ROW LEVEL SECURITY;

---
-- Row Level Security Policies
---
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own payments" ON activation_payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own referral rewards" ON referral_rewards FOR SELECT USING (auth.uid() = referrer_id);
CREATE POLICY "Users can view own referral hierarchy" ON referral_hierarchy FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = user_id);

---
-- Additional policies for phone verification
---
CREATE POLICY "Users can manage own phone verification" ON phone_verification
  FOR ALL USING (
    phone_number IN (
      SELECT phone_number FROM profiles WHERE id = auth.uid()
    )
  );

---
-- Create a function to get referral statistics (instead of a view with RLS issues)
---
CREATE OR REPLACE FUNCTION get_user_referral_stats(user_uuid uuid)
RETURNS TABLE(
  user_id uuid,
  full_name text,
  username text,
  referral_code text,
  membership_level text,
  active_direct_referrals integer,
  total_earnings decimal(10,2),
  available_balance decimal(10,2),
  level_1_referrals bigint,
  level_2_referrals bigint,
  level_3_referrals bigint,
  level_1_earnings decimal(10,2),
  level_2_earnings decimal(10,2),
  level_3_earnings decimal(10,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Security check: user can only access their own stats
  IF user_uuid != auth.uid() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT
    p.id as user_id,
    p.full_name,
    p.username,
    p.referral_code,
    p.membership_level,
    p.active_direct_referrals,
    p.total_earnings,
    p.available_balance,
    COUNT(CASE WHEN rh.level = 1 AND rh.is_active THEN 1 END) as level_1_referrals,
    COUNT(CASE WHEN rh.level = 2 AND rh.is_active THEN 1 END) as level_2_referrals,
    COUNT(CASE WHEN rh.level = 3 AND rh.is_active THEN 1 END) as level_3_referrals,
    COALESCE(SUM(CASE WHEN rr.level = 1 AND rr.status = 'paid' THEN rr.amount END), 0) as level_1_earnings,
    COALESCE(SUM(CASE WHEN rr.level = 2 AND rr.status = 'paid' THEN rr.amount END), 0) as level_2_earnings,
    COALESCE(SUM(CASE WHEN rr.level = 3 AND rr.status = 'paid' THEN rr.amount END), 0) as level_3_earnings
  FROM profiles p
  LEFT JOIN referral_hierarchy rh ON p.id = rh.referrer_id
  LEFT JOIN referral_rewards rr ON p.id = rr.referrer_id
  WHERE p.id = user_uuid
  GROUP BY p.id, p.full_name, p.username, p.referral_code, p.membership_level,
           p.active_direct_referrals, p.total_earnings, p.available_balance;
END;
$$;

---
-- Grant execute permission on the function
---
GRANT EXECUTE ON FUNCTION get_user_referral_stats(uuid) TO authenticated;



-- Enhanced profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'locked', 'pending'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_failed_login TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_phone_number ON profiles(phone_number);
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON profiles(account_status);
CREATE INDEX IF NOT EXISTS idx_profiles_phone_verified ON profiles(phone_verified);

-- Security logs table for audit trail
CREATE TABLE IF NOT EXISTS security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type VARCHAR(50) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for security logs
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_security_logs_ip_address ON security_logs(ip_address);

-- Session management table (optional, for additional session control)
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for sessions
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON user_sessions(is_active);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) policies
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Policy for security logs (only service role can access)
CREATE POLICY "Service role can access security logs" ON security_logs
    FOR ALL USING (auth.role() = 'service_role');

-- Policy for user sessions (users can only see their own sessions)
CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all sessions" ON user_sessions
    FOR ALL USING (auth.role() = 'service_role');

-- Clean up expired sessions (run this as a cron job or scheduled function)
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM user_sessions 
    WHERE expires_at < NOW() OR last_activity < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Clean up old security logs (optional, run monthly)
CREATE OR REPLACE FUNCTION cleanup_old_security_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM security_logs 
    WHERE created_at < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- Add password hash column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'locked', 'pending'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_failed_login TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- Enhanced user sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  csrf_token VARCHAR(255) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  device_fingerprint TEXT,
  login_method VARCHAR(50),
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  invalidated_at TIMESTAMPTZ
);

-- Enhanced security logs table
CREATE TABLE IF NOT EXISTS security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type VARCHAR(100) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_phone_number ON profiles(phone_number);
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON profiles(account_status);
CREATE INDEX IF NOT EXISTS idx_profiles_failed_attempts ON profiles(failed_login_attempts);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_last_activity ON user_sessions(last_activity);

CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_security_logs_ip_address ON security_logs(ip_address);

-- RLS (Row Level Security) policies
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- Policies for user sessions
CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all sessions" ON user_sessions
    FOR ALL USING (auth.role() = 'service_role');

-- Policies for security logs
CREATE POLICY "Service role can access security logs" ON security_logs
    FOR ALL USING (auth.role() = 'service_role');

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    -- Deactivate expired sessions
    UPDATE user_sessions 
    SET is_active = false, invalidated_at = NOW()
    WHERE expires_at < NOW() AND is_active = true;
    
    -- Delete very old sessions (older than 30 days)
    DELETE FROM user_sessions 
    WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old security logs
CREATE OR REPLACE FUNCTION cleanup_old_security_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM security_logs 
    WHERE created_at < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- Function to check for suspicious activity
CREATE OR REPLACE FUNCTION detect_suspicious_activity()
RETURNS TABLE(user_id UUID, event_count BIGINT, distinct_ips BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sl.user_id,
        COUNT(*) as event_count,
        COUNT(DISTINCT sl.ip_address) as distinct_ips
    FROM security_logs sl
    WHERE sl.created_at > NOW() - INTERVAL '1 hour'
        AND sl.event_type IN ('login_failed_invalid_password', 'login_attempt_invalid_phone')
        AND sl.user_id IS NOT NULL
    GROUP BY sl.user_id
    HAVING COUNT(*) > 10 OR COUNT(DISTINCT sl.ip_address) > 5;
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup functions (if using pg_cron extension)
-- SELECT cron.schedule('cleanup-sessions', '0 */6 * * *', 'SELECT cleanup_expired_sessions();');
-- SELECT cron.schedule('cleanup-logs', '0 2 * * 0', 'SELECT cleanup_old_security_logs();');