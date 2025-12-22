-- Fix Row Level Security for Quiz Admin
-- Run this in Supabase SQL Editor

-- Option 1: Disable RLS for quiz_questions (simplest for private family app)
ALTER TABLE quiz_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_rankings DISABLE ROW LEVEL SECURITY;

-- Option 2: If you want to keep RLS enabled, uncomment below instead:
/*
-- Enable RLS
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_rankings ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users
CREATE POLICY "Allow all for authenticated users" ON quiz_questions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON quiz_answers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON daily_rankings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
*/

-- Verify RLS is disabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('quiz_questions', 'quiz_answers', 'daily_rankings');
