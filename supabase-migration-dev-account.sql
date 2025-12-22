-- Migration: Create/Update Dev Account
-- Run this in the Supabase SQL Editor

-- Update existing dev account (password 66666666) to ensure is_dev is true
UPDATE members
SET is_dev = true
WHERE password = '66666666';

-- If no existing dev account, create one
INSERT INTO members (id, password, name, emoji, is_dev, family_id, role, is_joining, created_at)
VALUES (
  gen_random_uuid(),
  '66666666',
  'Dev Admin',
  '👨‍💻',
  true,
  NULL,  -- Not part of any family
  NULL,
  false,  -- Not joining the trip
  NOW()
)
ON CONFLICT (password) DO NOTHING;  -- Prevent duplicate if already exists

-- Verify dev account was created/updated
-- SELECT * FROM members WHERE password = '66666666';
