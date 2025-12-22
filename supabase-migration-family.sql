-- Migration: Add family relationships to members table
-- Run this in the Supabase SQL Editor

-- Create families table
CREATE TABLE IF NOT EXISTS families (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert the 6 families
INSERT INTO families (id, name) VALUES
  (1, 'Family 1'),
  (2, 'Family 2'),
  (3, 'Family 3'),
  (4, 'Family 4'),
  (5, 'Family 5'),
  (6, 'Family 6');

-- Add columns to members table
ALTER TABLE members
ADD COLUMN IF NOT EXISTS family_id INTEGER REFERENCES families(id),
ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('dad', 'mom', 'kid')),
ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES members(id),
ADD COLUMN IF NOT EXISTS is_joining BOOLEAN DEFAULT true;

-- Add non-joining members first (they need accounts)
-- Note: You may need to adjust passwords as needed
INSERT INTO members (id, password, name, emoji, is_dev, is_joining)
VALUES
  (gen_random_uuid(), 'ern12345', 'Chong Ern', NULL, false, false),
  (gen_random_uuid(), 'yee12345', 'Chong Yee', NULL, false, false)
ON CONFLICT (name) DO UPDATE SET is_joining = false;

-- Update existing members with family relationships
-- Family 1: 国强 family
UPDATE members SET family_id = 1, role = 'dad' WHERE name = '国强';
UPDATE members SET family_id = 1, role = 'mom' WHERE name = '君毓';
UPDATE members SET family_id = 1, role = 'kid' WHERE name = '聪颖';
UPDATE members SET family_id = 1, role = 'kid' WHERE name = '昌捷';
UPDATE members SET family_id = 1, role = 'kid' WHERE name = '昌容';
UPDATE members SET family_id = 1, role = 'kid' WHERE name = '昌耀';
-- Partners (they belong to their spouse's family as role 'kid' with partner relationship)
UPDATE members SET family_id = 1, role = 'kid' WHERE name = '阿辉';
UPDATE members SET family_id = 1, role = 'kid' WHERE name = '炜婷';

-- Family 2: 国雄 family
UPDATE members SET family_id = 2, role = 'dad' WHERE name = '国雄';
UPDATE members SET family_id = 2, role = 'mom' WHERE name = 'Kris';
UPDATE members SET family_id = 2, role = 'kid' WHERE name = '聪琳';
UPDATE members SET family_id = 2, role = 'kid' WHERE name = '昌鸿';
UPDATE members SET family_id = 2, role = 'kid' WHERE name = '昌荣';

-- Family 3: Cikgu family
UPDATE members SET family_id = 3, role = 'dad' WHERE name = 'Cikgu';
UPDATE members SET family_id = 3, role = 'mom' WHERE name = '凤春';
UPDATE members SET family_id = 3, role = 'kid' WHERE name = '聪婷';
UPDATE members SET family_id = 3, role = 'kid' WHERE name = '聪云';
UPDATE members SET family_id = 3, role = 'kid', is_joining = false WHERE name = 'Chong Ern';

-- Family 4: 国光 family
UPDATE members SET family_id = 4, role = 'dad' WHERE name = '国光';
UPDATE members SET family_id = 4, role = 'mom' WHERE name = 'Kelly';
UPDATE members SET family_id = 4, role = 'kid' WHERE name = '昌贤';
UPDATE members SET family_id = 4, role = 'kid', is_joining = false WHERE name = 'Chong Yee';

-- Family 5: Thomas family
UPDATE members SET family_id = 5, role = 'dad' WHERE name = 'Thomas';
UPDATE members SET family_id = 5, role = 'mom' WHERE name = '美凤';
UPDATE members SET family_id = 5, role = 'kid' WHERE name = '思瑩';
UPDATE members SET family_id = 5, role = 'kid' WHERE name = '敬铭';
UPDATE members SET family_id = 5, role = 'kid' WHERE name = '敬扬';

-- Family 6: WENDY family (just the couple)
UPDATE members SET family_id = 6, role = 'kid' WHERE name = 'WENDY';
UPDATE members SET family_id = 6, role = 'kid' WHERE name = '老王';

-- Set partner relationships (need to do this after all members exist)
-- 聪颖 + 阿辉
UPDATE members SET partner_id = (SELECT id FROM members WHERE name = '阿辉') WHERE name = '聪颖';
UPDATE members SET partner_id = (SELECT id FROM members WHERE name = '聪颖') WHERE name = '阿辉';

-- 昌捷 + 炜婷
UPDATE members SET partner_id = (SELECT id FROM members WHERE name = '炜婷') WHERE name = '昌捷';
UPDATE members SET partner_id = (SELECT id FROM members WHERE name = '昌捷') WHERE name = '炜婷';

-- WENDY + 老王
UPDATE members SET partner_id = (SELECT id FROM members WHERE name = '老王') WHERE name = 'WENDY';
UPDATE members SET partner_id = (SELECT id FROM members WHERE name = 'WENDY') WHERE name = '老王';

-- Create index for faster family queries
CREATE INDEX IF NOT EXISTS idx_members_family_id ON members(family_id);
