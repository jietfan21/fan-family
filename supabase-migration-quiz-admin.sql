-- Migration: Quiz Admin Features
-- Run this in the Supabase SQL Editor after the initial quiz migration

-- ============================================
-- 1. ADD NEW FIELDS TO quiz_questions
-- ============================================

-- Add timing fields (Bali timezone UTC+8)
ALTER TABLE quiz_questions
ADD COLUMN IF NOT EXISTS release_time TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ DEFAULT NULL;

-- Add prediction question flag
ALTER TABLE quiz_questions
ADD COLUMN IF NOT EXISTS is_prediction BOOLEAN DEFAULT false;

-- Add number answer type (exact or range)
ALTER TABLE quiz_questions
ADD COLUMN IF NOT EXISTS answer_type TEXT DEFAULT 'exact' CHECK (answer_type IN ('exact', 'range'));

-- Add range fields for number questions
ALTER TABLE quiz_questions
ADD COLUMN IF NOT EXISTS answer_min INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS answer_max INTEGER DEFAULT NULL;

-- Change points to default 1 instead of 10
ALTER TABLE quiz_questions
ALTER COLUMN points SET DEFAULT 1;

-- ============================================
-- 2. CREATE DAILY RANKINGS SNAPSHOT TABLE
-- ============================================
-- Stores end-of-day rankings for position change tracking

CREATE TABLE IF NOT EXISTS daily_rankings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  day_id TEXT NOT NULL, -- 'day1', 'day2', etc.
  rank_position INTEGER NOT NULL,
  total_points INTEGER NOT NULL,
  snapshot_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, day_id)
);

CREATE INDEX IF NOT EXISTS idx_daily_rankings_day ON daily_rankings(day_id);
CREATE INDEX IF NOT EXISTS idx_daily_rankings_member ON daily_rankings(member_id);

-- ============================================
-- 3. FUNCTION TO AUTO-GRADE ANSWERS
-- ============================================
-- Called when: 1) Quiz end time passes, 2) Dev sets prediction answer

CREATE OR REPLACE FUNCTION grade_question(question_uuid UUID)
RETURNS void AS $$
DECLARE
  q_record RECORD;
  answer_record RECORD;
  is_answer_correct BOOLEAN;
  points_to_award INTEGER;
BEGIN
  -- Get question details
  SELECT * INTO q_record FROM quiz_questions WHERE id = question_uuid;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Question not found';
  END IF;

  -- Don't grade if no correct answer set
  IF q_record.correct_answer IS NULL THEN
    RETURN;
  END IF;

  -- Get points (default 1)
  points_to_award := COALESCE(q_record.points, 1);

  -- Grade each answer for this question
  FOR answer_record IN
    SELECT id, answer FROM quiz_answers WHERE question_id = question_uuid
  LOOP
    is_answer_correct := false;

    -- Check correctness based on question type
    IF q_record.type = 'mc' THEN
      -- Multiple choice: exact match
      is_answer_correct := (answer_record.answer = q_record.correct_answer);

    ELSIF q_record.type = 'number' THEN
      -- Number type
      IF q_record.answer_type = 'exact' THEN
        -- Exact match
        is_answer_correct := (answer_record.answer = q_record.correct_answer);
      ELSIF q_record.answer_type = 'range' THEN
        -- Range check
        is_answer_correct := (
          answer_record.answer::INTEGER >= q_record.answer_min AND
          answer_record.answer::INTEGER <= q_record.answer_max
        );
      END IF;
    END IF;

    -- Update answer with result
    UPDATE quiz_answers
    SET
      is_correct = is_answer_correct,
      points_earned = CASE WHEN is_answer_correct THEN points_to_award ELSE 0 END
    WHERE id = answer_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. FUNCTION TO SNAPSHOT RANKINGS
-- ============================================
-- Call this at the end of each day to store rankings for next day's comparison

CREATE OR REPLACE FUNCTION snapshot_daily_rankings(target_day_id TEXT)
RETURNS void AS $$
BEGIN
  -- Delete existing snapshot for this day (in case of re-run)
  DELETE FROM daily_rankings WHERE day_id = target_day_id;

  -- Insert current rankings
  INSERT INTO daily_rankings (member_id, day_id, rank_position, total_points)
  SELECT
    id,
    target_day_id,
    ROW_NUMBER() OVER (ORDER BY total_points DESC, name ASC) as rank_position,
    total_points
  FROM member_rankings;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. ENHANCED MEMBER RANKINGS VIEW WITH POSITION CHANGE
-- ============================================
-- Replaces the original view to include position change arrows

CREATE OR REPLACE VIEW member_rankings_with_change AS
SELECT
  mr.id,
  mr.name,
  mr.emoji,
  mr.total_points,
  mr.correct_answers,
  mr.total_answers,
  ROW_NUMBER() OVER (ORDER BY mr.total_points DESC, mr.name ASC) as current_rank,
  dr.rank_position as previous_rank,
  CASE
    WHEN dr.rank_position IS NULL THEN 0 -- Day 1 or no previous data
    ELSE dr.rank_position - ROW_NUMBER() OVER (ORDER BY mr.total_points DESC, mr.name ASC)
  END as rank_change
FROM member_rankings mr
LEFT JOIN daily_rankings dr ON mr.id = dr.member_id
  AND dr.day_id = (
    -- Get the most recent day snapshot (yesterday's ranking)
    SELECT day_id FROM daily_rankings
    ORDER BY snapshot_at DESC
    LIMIT 1
  );

-- ============================================
-- USAGE EXAMPLES FOR DEV
-- ============================================

-- Example 1: Add a multiple choice question for Day 2
-- Release at 9:00 AM, End at 11:00 PM Bali time (Dec 23, 2025)
/*
INSERT INTO quiz_questions (day_id, prompt, type, options, release_time, end_time, is_prediction, points)
VALUES (
  'day2',
  'Who will wake up first tomorrow?',
  'mc',
  ARRAY['Thomas', 'Cikgu', 'Kelly', 'Kris'],
  '2025-12-23 09:00:00+08',  -- 9 AM Bali time
  '2025-12-23 23:00:00+08',  -- 11 PM Bali time
  false,  -- Not a prediction question
  1
);
*/

-- Example 2: Add a prediction number question (exact answer)
/*
INSERT INTO quiz_questions (day_id, prompt, type, answer_type, release_time, end_time, is_prediction, points)
VALUES (
  'day2',
  'How many beers will we drink tonight?',
  'number',
  'exact',
  '2025-12-23 09:00:00+08',
  '2025-12-23 23:00:00+08',
  true,  -- Prediction: you'll set answer later
  1
);
*/

-- Example 3: Add a number question with range
/*
INSERT INTO quiz_questions (day_id, prompt, type, answer_type, answer_min, answer_max, release_time, end_time, is_prediction, points)
VALUES (
  'day2',
  'What temperature will it be at noon? (Celsius)',
  'number',
  'range',
  28,  -- Min: 28°C
  32,  -- Max: 32°C
  '2025-12-23 09:00:00+08',
  '2025-12-23 23:00:00+08',
  false,
  1
);
*/

-- Example 4: Set correct answer for prediction question (triggers auto-grading)
/*
UPDATE quiz_questions
SET correct_answer = '12'  -- 12 beers
WHERE id = '<question_id>';

-- Then call grading function
SELECT grade_question('<question_id>');
*/

-- Example 5: Manually grade all questions for a day (after end time)
/*
DO $$
DECLARE
  q_id UUID;
BEGIN
  FOR q_id IN
    SELECT id FROM quiz_questions WHERE day_id = 'day2' AND end_time < NOW()
  LOOP
    PERFORM grade_question(q_id);
  END LOOP;
END $$;
*/

-- Example 6: Snapshot rankings at end of day
/*
SELECT snapshot_daily_rankings('day2');
*/

-- Example 7: Query rankings with position changes
/*
SELECT * FROM member_rankings_with_change
ORDER BY current_rank ASC;
*/
