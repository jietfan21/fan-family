-- Migration for Car and Room Arrangements
-- Run this in Supabase SQL Editor

-- Table for car assignments
CREATE TABLE IF NOT EXISTS car_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id TEXT NOT NULL,
  car_name TEXT NOT NULL,
  leader TEXT,
  members TEXT[] DEFAULT '{}',
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for room assignments
CREATE TABLE IF NOT EXISTS room_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_key TEXT NOT NULL, -- 'hotel1' or 'hotel2'
  hotel_name TEXT NOT NULL,
  room_type TEXT NOT NULL, -- 'twin', 'double', 'triple', 'family', 'standard', '2br-villa', '3br-villa'
  room_label TEXT, -- Optional label like 'Villa 1', 'Villa 2'
  members TEXT[] DEFAULT '{}',
  note TEXT, -- Optional note like 'Extra bed'
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for these tables (private family app)
ALTER TABLE car_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE room_assignments DISABLE ROW LEVEL SECURITY;

-- Insert initial car data (from existing arrangement page)
INSERT INTO car_assignments (car_id, car_name, leader, members, display_order) VALUES
  ('van_a', 'Van A', '聪婷', ARRAY['国雄', 'Kris', '昌鸿', '昌荣', 'Cikgu', '凤春', '聪琳', '聪婷', '聪云'], 1),
  ('van_b', 'Van B', '敬铭', ARRAY['国强', '君毓', '敬铭', '国光', 'Kelly', '昌贤', '昌容', '昌捷', '炜婷'], 2),
  ('van_c', 'Van C', '昌耀', ARRAY['思瑩', '聪颖', '阿辉', '老王', 'WENDY', '昌耀', '美凤', 'Thomas', '敬扬'], 3)
ON CONFLICT DO NOTHING;

-- Insert initial room data for Hotel 1 (Santa Monica Ubud + Villa Kala Ubud)
INSERT INTO room_assignments (hotel_key, hotel_name, room_type, members, display_order) VALUES
  -- Santa Monica Ubud
  ('hotel1', 'Santa Monica Ubud', 'twin', ARRAY['昌鸿', '昌荣'], 1),
  ('hotel1', 'Santa Monica Ubud', 'twin', ARRAY['敬铭', '昌贤'], 2),
  ('hotel1', 'Santa Monica Ubud', 'double', ARRAY['国雄', 'Kris'], 3),
  ('hotel1', 'Santa Monica Ubud', 'double', ARRAY['国强', '君毓'], 4),
  ('hotel1', 'Santa Monica Ubud', 'double', ARRAY['Cikgu', '凤春'], 5),
  ('hotel1', 'Santa Monica Ubud', 'double', ARRAY['国光', 'Kelly'], 6),
  -- Villa Kala Ubud
  ('hotel1', 'Villa Kala Ubud', 'twin', ARRAY['聪婷', '聪云'], 7),
  ('hotel1', 'Villa Kala Ubud', 'twin', ARRAY['思瑩', '聪琳'], 8),
  ('hotel1', 'Villa Kala Ubud', 'triple', ARRAY['美凤', 'Thomas', '敬扬'], 9),
  ('hotel1', 'Villa Kala Ubud', 'family', ARRAY['聪颖', '阿辉', '昌捷', '炜婷'], 10),
  ('hotel1', 'Villa Kala Ubud', 'double', ARRAY['WENDY', '老王'], 11),
  ('hotel1', 'Villa Kala Ubud', 'double', ARRAY['昌容', '昌耀'], 12)
ON CONFLICT DO NOTHING;

-- Insert initial room data for Hotel 2 (Lotus Tirta Seminyak)
INSERT INTO room_assignments (hotel_key, hotel_name, room_type, members, display_order) VALUES
  -- Standard rooms
  ('hotel2', 'Lotus Tirta Seminyak', 'standard', ARRAY['聪颖', '阿辉'], 1),
  ('hotel2', 'Lotus Tirta Seminyak', 'standard', ARRAY['WENDY', '老王'], 2),
  ('hotel2', 'Lotus Tirta Seminyak', 'standard', ARRAY['昌捷', '炜婷'], 3),
  ('hotel2', 'Lotus Tirta Seminyak', 'standard', ARRAY['思瑩', '聪琳'], 4),
  ('hotel2', 'Lotus Tirta Seminyak', 'standard', ARRAY['昌容'], 5),
  ('hotel2', 'Lotus Tirta Seminyak', 'standard', ARRAY['昌耀', '昌贤'], 6),
  -- 2-bedroom villa
  ('hotel2', 'Lotus Tirta Seminyak', '2br-villa', ARRAY['国雄', 'Kris', '昌荣', '昌鸿'], 7),
  -- 3-bedroom villas
  ('hotel2', 'Lotus Tirta Seminyak', '3br-villa', ARRAY['国强', '君毓', 'Cikgu', '凤春', '国光', 'Kelly'], 8),
  ('hotel2', 'Lotus Tirta Seminyak', '3br-villa', ARRAY['美凤', 'Thomas', '聪婷', '聪云', '敬铭', '敬扬'], 9)
ON CONFLICT DO NOTHING;

-- Add labels for 3br villas
UPDATE room_assignments
SET room_label = 'Villa 1'
WHERE hotel_key = 'hotel2' AND room_type = '3br-villa' AND display_order = 8;

UPDATE room_assignments
SET room_label = 'Villa 2'
WHERE hotel_key = 'hotel2' AND room_type = '3br-villa' AND display_order = 9;

-- Add note for family room
UPDATE room_assignments
SET note = 'Extra bed'
WHERE hotel_key = 'hotel1' AND room_type = 'family';

-- Verify tables created
SELECT 'car_assignments' as table_name, COUNT(*) as count FROM car_assignments
UNION ALL
SELECT 'room_assignments' as table_name, COUNT(*) as count FROM room_assignments;
