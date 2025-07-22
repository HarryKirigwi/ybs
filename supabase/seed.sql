-- Initial seed data for your Supabase project

-- Ensure the public schema is explicitly used where needed
SET search_path = public;

-- =========================================================
-- USERS TABLE
-- IMPORTANT: Replace 'YOUR_ADMIN_PASSWORD_HASH' and 'YOUR_ADMIN_SALT'
-- with values generated using bcryptjs.
-- See instructions above on how to generate them.
-- =========================================================
INSERT INTO users (
    email,
    phone,
    full_name,
    password_hash,
    salt,
    email_verified,
    phone_verified,
    account_status,
    referral_code
) VALUES (
    'kirigwingash@gmail.com',
    '+254705483375',
    'Admin User',
    '$2a$12$81s9zajwNjhQMEKNW15qmua9ruLiq2eVGlgigw2EhugFy8dQimug2', -- REPLACE THIS
    '$2a$12$81s9zajwNjhQMEKNW15qmu',         -- REPLACE THIS
    TRUE,
    TRUE,
    'active',
    'ADMIN001'
) ON CONFLICT (email) DO NOTHING;

-- Insert a regular user, possibly referred by the admin
INSERT INTO users (
    email,
    phone,
    full_name,
    password_hash,
    salt,
    email_verified,
    phone_verified,
    account_status,
    referral_code,
    referred_by
) VALUES (
    'johndoe@example.com',
    '+254711111111',
    'John Doe',
    '$2a$12$KzP6/If8qDXK5T7rne057OsxJrd4Xjkv/1gQfhYsjtrHpLNZYOtqW', -- REPLACE THIS
    '$2a$12$KzP6/If8qDXK5T7rne057O',         -- REPLACE THIS
    TRUE,
    TRUE,
    'active',
    'JOHNDOE1',
    (SELECT id FROM users WHERE email = 'kirigwingash@gmail.com') -- Referred by Admin
) ON CONFLICT (email) DO NOTHING;

-- Insert another regular user
INSERT INTO users (
    email,
    phone,
    full_name,
    password_hash,
    salt,
    email_verified,
    phone_verified,
    account_status,
    referral_code
) VALUES (
    'janesmith@example.com',
    '+254722222222',
    'Jane Smith',
    '$2a$12$JuziN7THvjzi4l/68dj7K.cl67Qj2i.49fNfa4KVqAkPiLM3pHgRy', -- REPLACE THIS
    '$2a$12$JuziN7THvjzi4l/68dj7K.',         -- REPLACE THIS
    FALSE, -- Example: not yet email verified
    FALSE, -- Example: not yet phone verified
    'pending', -- Example: account pending activation
    'JANESMITH'
) ON CONFLICT (email) DO NOTHING;

-- =========================================================
-- REFERRALS TABLE
-- Establish referral relationships
-- =========================================================
INSERT INTO referrals (referrer_id, referee_id, level, commission_rate, total_earned, status)
SELECT
    u_admin.id AS referrer_id,
    u_john.id AS referee_id,
    1, -- Level 1 referral
    300.00,
    0.00,
    'active'
FROM
    users AS u_admin,
    users AS u_john
WHERE
    u_admin.email = 'kirigwingash@gmail.com' AND -- <-- CORRECTED THIS EMAIL!
    u_john.email = 'johndoe@example.com'
ON CONFLICT (referrer_id, referee_id) DO NOTHING;

-- Example: If John Doe referred Jane Smith (after Jane is registered and her ID is known)
INSERT INTO referrals (referrer_id, referee_id, level, commission_rate, total_earned, status)
SELECT
    u_john.id AS referrer_id,
    u_jane.id AS referee_id,
    1, -- Level 1 referral
    300.00,
    0.00,
    'active'
FROM
    users AS u_john,
    users AS u_jane
WHERE
    u_john.email = 'johndoe@example.com' AND
    u_jane.email = 'janesmith@example.com'
ON CONFLICT (referrer_id, referee_id) DO NOTHING;


-- =========================================================
-- OTHER TABLES (Optional to seed, often populated at runtime)
-- You can add initial data for other tables if necessary.
-- Examples below are commented out as they are often populated via app logic.
-- =========================================================

-- INSERT INTO transactions (user_id, type, amount, description, status)
-- SELECT id, 'signup_bonus', 500.00, 'Welcome bonus for new user', 'completed'
-- FROM users WHERE email = 'johndoe@example.com'
-- ON CONFLICT DO NOTHING; -- Adjust ON CONFLICT based on your transaction table's unique constraints

-- INSERT INTO security_logs (user_id, action, ip_address, success, details)
-- SELECT id, 'user_signup', '192.168.1.100', TRUE, '{"userAgent": "Mozilla/5.0"}'::jsonb
-- FROM users WHERE email = 'johndoe@example.com';