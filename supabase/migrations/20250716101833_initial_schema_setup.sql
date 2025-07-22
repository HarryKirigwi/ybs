-- supabase/migrations/20250716131902_initial_schema_setup.sql
-- (Note: The timestamp in your filename will be different)

-- This migration sets up the initial schema for your application.
-- It was extracted from the initializeDatabase function in lib/db.ts.

-- Users table with comprehensive security
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL, -- Stored as bcrypt hash, length is typically fixed.
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  account_status VARCHAR(20) DEFAULT 'active',
  failed_login_attempts INTEGER DEFAULT 0,
  last_failed_login TIMESTAMP WITH TIME ZONE, -- Use TIME ZONE for timestamps
  account_locked_until TIMESTAMP WITH TIME ZONE, -- Use TIME ZONE for timestamps
  referral_code VARCHAR(10) UNIQUE,
  referred_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Consider ON DELETE SET NULL for referential integrity
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Use TIME ZONE for timestamps
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Use TIME ZONE for timestamps
  last_login TIMESTAMP WITH TIME ZONE, -- Use TIME ZONE for timestamps
  login_ip INET,

  -- Security fields
  salt VARCHAR(255) NOT NULL, -- Stored with the hash, but good to have explicit
  password_reset_token UUID UNIQUE, -- Use UUID for tokens for better uniqueness and security
  password_reset_expires TIMESTAMP WITH TIME ZONE, -- Use TIME ZONE for timestamps
  email_verification_token UUID UNIQUE, -- Use UUID for tokens for better uniqueness and security
  email_verification_expires TIMESTAMP WITH TIME ZONE, -- Use TIME ZONE for timestamps

  -- Financial fields
  total_earnings DECIMAL(10,2) DEFAULT 0.00 CHECK (total_earnings >= 0), -- Add non-negative constraint
  available_balance DECIMAL(10,2) DEFAULT 0.00 CHECK (available_balance >= 0), -- Add non-negative constraint
  referral_earnings DECIMAL(10,2) DEFAULT 0.00 CHECK (referral_earnings >= 0), -- Add non-negative constraint

  -- Validation constraints
  -- Email: The regex is generally good for basic format, but comprehensive validation is better done at the application layer with email verification (which you have).
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
  -- Phone: Your current regex is specific to Kenyan mobile numbers. Consider broadening or documenting clearly.
  -- For global numbers, a more flexible approach or external library is often preferred.
  -- If you only target Kenya, this is fine, but add a comment for clarity.
  CONSTRAINT valid_phone CHECK (phone ~* '^\\+254[17]\\d{8}$'),
  -- Account Status: Good as is.
  CONSTRAINT valid_status CHECK (account_status IN ('active', 'suspended', 'banned', 'pending')),
  -- Password Hash Length: While bcrypt hash length varies slightly based on algorithm, a VARCHAR(255) is generally sufficient.
  -- However, the strength of the hash is handled by bcrypt, not directly by this length.
  -- Salt Length: Same as password_hash, ensure VARCHAR(255) is enough for your chosen salt length/format.
  -- Referral Code: Ensure this length (10) is appropriate for your generation logic.
  CONSTRAINT check_referral_code_format CHECK (referral_code ~ '^[A-Z0-9]{6,10}$') -- Example: Uppercase alphanumeric, 6-10 chars
);

-- Sessions table for secure session management
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token UUID UNIQUE NOT NULL, -- Use UUID for session tokens
  refresh_token UUID UNIQUE NOT NULL, -- Use UUID for refresh tokens
  ip_address INET NOT NULL,
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- Use TIME ZONE
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Use TIME ZONE
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Use TIME ZONE
  is_active BOOLEAN DEFAULT TRUE
);

-- Activity logs for security monitoring
CREATE TABLE IF NOT EXISTS security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Consider SET NULL if user might be deleted
  action VARCHAR(100) NOT NULL,
  ip_address INET NOT NULL,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- Use TIME ZONE
);

-- Rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier VARCHAR(255) NOT NULL, -- Could be IP, user_id, email, etc.
  action VARCHAR(100) NOT NULL,
  attempts INTEGER DEFAULT 1 CHECK (attempts >= 0),
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Use TIME ZONE
  blocked_until TIMESTAMP WITH TIME ZONE, -- Use TIME ZONE

  UNIQUE(identifier, action)
);

-- Referral system tables
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level > 0), -- Referral levels typically start from 1
  commission_rate DECIMAL(5,2) NOT NULL CHECK (commission_rate BETWEEN 0.00 AND 100.00), -- Rate between 0% and 100%
  total_earned DECIMAL(10,2) DEFAULT 0.00 CHECK (total_earned >= 0.00),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')), -- Example statuses
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(referrer_id, referee_id)
);

-- Earnings transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'referral_bonus', 'commission')), -- Define transaction types
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0.00), -- Amount should typically be positive
  description TEXT,
  reference_id UUID, -- For linking to other entities like specific referral activities or withdrawals
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')), -- Define transaction statuses
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referral clicks tracking
CREATE TABLE IF NOT EXISTS referral_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code VARCHAR(10) NOT NULL,
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ip_address INET NOT NULL,
  user_agent TEXT,
  referer TEXT, -- Typo: 'referrer' is correct spelling. Consider renaming if not deployed.
  is_unique BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referral conversions tracking
CREATE TABLE IF NOT EXISTS referral_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code VARCHAR(10) NOT NULL,
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ip_address INET NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(referrer_id, referee_id) -- A referrer can only convert a specific referee once
);

-- Referral statistics summary
CREATE TABLE IF NOT EXISTS referral_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referral_code VARCHAR(10) NOT NULL,
  total_clicks INTEGER DEFAULT 0 CHECK (total_clicks >= 0),
  unique_clicks INTEGER DEFAULT 0 CHECK (unique_clicks >= 0),
  total_conversions INTEGER DEFAULT 0 CHECK (total_conversions >= 0),
  last_click TIMESTAMP WITH TIME ZONE,
  last_conversion TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, referral_code)
);

-- Indexes for performance (all existing indexes are good)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier, action);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_clicks_code ON referral_clicks(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_clicks_referrer ON referral_clicks(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_clicks_ip ON referral_clicks(ip_address);
CREATE INDEX IF NOT EXISTS idx_referral_conversions_referrer ON referral_conversions(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_stats_user ON referral_stats(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies (These apply when using the client-side Supabase client or auth.uid())
-- Best practice for RLS: Only allow what is explicitly needed.
-- It's often better to have more granular policies for INSERT, UPDATE, DELETE too.

-- Users Table Policies
-- Users can read their own data
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid() = id);
-- Users can update their own data (e.g., full_name, email_verified, phone_verified, account_status if allowed by business logic)
-- Be very careful what columns are updatable via RLS. Sensitive fields like password_hash, salt, financial fields should NOT be directly updatable by users via RLS.
-- This policy allows users to update any column. Consider a more restrictive 'WITH CHECK' or separate update policies for specific columns.
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);
-- Optionally, if users can register themselves:
-- CREATE POLICY "Anyone can register" ON users FOR INSERT WITH CHECK (true); -- Or add specific conditions if needed

-- User Sessions Table Policies
-- Users can read their own sessions
CREATE POLICY "Users can read own sessions" ON user_sessions FOR SELECT USING (auth.uid() = user_id);
-- Users can delete their own sessions (e.g., for logout from other devices)
CREATE POLICY "Users can delete own sessions" ON user_sessions FOR DELETE USING (auth.uid() = user_id);
-- Sessions are typically inserted by the auth service or a secure backend function, not directly by users via RLS.

-- Security Logs Table Policies
-- Only authenticated users (or admins) should read security logs, or logs related to themselves.
-- General users should NOT be able to read all security logs. This policy allows users to read *any* security log that *might* be associated with their user_id, but it's often more restrictive.
-- Consider having a separate admin role for full security log access.
CREATE POLICY "Users can read own security logs" ON security_logs FOR SELECT USING (auth.uid() = user_id);
-- Security logs should be inserted by a secure backend service, not directly by RLS.

-- Referrals Table Policies
-- Users can read referrals where they are the referrer or referee
CREATE POLICY "Users can read own referrals" ON referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referee_id);
-- Referrals should typically be inserted/updated by a secure backend service.

-- Transactions Table Policies
-- Users can read their own transactions
CREATE POLICY "Users can read own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
-- Transactions should typically be inserted/updated by a secure backend service.

-- Referral Clicks Table Policies
-- Users can read clicks they generated (or their referrals generated)
CREATE POLICY "Users can read own referral clicks" ON referral_clicks FOR SELECT USING (auth.uid() = referrer_id);
-- Clicks are typically inserted by a public endpoint or backend function, not directly by RLS.

-- Referral Conversions Table Policies
-- Users can read conversions they generated (or their referrals generated)
CREATE POLICY "Users can read own referral conversions" ON referral_conversions FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referee_id);
-- Conversions are typically inserted by a secure backend function.

-- Referral Stats Table Policies
-- Users can read their own referral statistics
CREATE POLICY "Users can read own referral stats" ON referral_stats FOR SELECT USING (auth.uid() = user_id);
-- Referral stats are usually aggregated and updated by a backend service.