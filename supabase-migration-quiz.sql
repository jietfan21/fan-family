-- Migration: Quiz feature tables
-- Run this in the Supabase SQL Editor

-- Create quiz_questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day_id TEXT NOT NULL, -- 'day1', 'day2', etc.
  prompt TEXT NOT NULL, -- The question text
  type TEXT NOT NULL CHECK (type IN ('mc', 'number')), -- 'mc' for multiple choice, 'number' for numeric
  options TEXT[] DEFAULT NULL, -- Array of options for multiple choice
  correct_answer TEXT DEFAULT NULL, -- The correct answer (set after quiz closes)
  points INTEGER DEFAULT 10, -- Points for correct answer
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create quiz_answers table
CREATE TABLE IF NOT EXISTS quiz_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT NULL, -- NULL until answer is graded
  points_earned INTEGER DEFAULT 0,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, question_id) -- Each member can only answer once per question
);

-- Create member_rankings view (calculates totals from answers)
CREATE OR REPLACE VIEW member_rankings AS
SELECT
  m.id,
  m.name,
  m.emoji,
  COALESCE(SUM(qa.points_earned), 0) AS total_points,
  COALESCE(COUNT(qa.id) FILTER (WHERE qa.is_correct = true), 0) AS correct_answers,
  COALESCE(COUNT(qa.id), 0) AS total_answers
FROM members m
LEFT JOIN quiz_answers qa ON m.id = qa.member_id
WHERE m.is_joining = true
GROUP BY m.id, m.name, m.emoji;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_quiz_questions_day ON quiz_questions(day_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_member ON quiz_answers(member_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_question ON quiz_answers(question_id);

-- ============================================
-- ADMIN FUNCTIONS FOR DEV TO MANAGE QUIZ
-- ============================================

-- Example: Add a multiple choice question for Day 2
-- INSERT INTO quiz_questions (day_id, prompt, type, options, points)
-- VALUES (
--   'day2',
--   'Who will be the first to wake up on Day 2?',
--   'mc',
--   ARRAY['Thomas', 'Cikgu', 'Kelly', 'Kris'],
--   10
-- );

-- Example: Add a number question for Day 2
-- INSERT INTO quiz_questions (day_id, prompt, type, points)
-- VALUES (
--   'day2',
--   'How many photos will Cikgu take today? (2-digit answer)',
--   'number',
--   10
-- );

-- Example: Set correct answer and grade all submissions
-- UPDATE quiz_questions SET correct_answer = 'Thomas' WHERE id = '<question_id>';
--
-- UPDATE quiz_answers
-- SET
--   is_correct = (answer = (SELECT correct_answer FROM quiz_questions WHERE id = quiz_answers.question_id)),
--   points_earned = CASE
--     WHEN answer = (SELECT correct_answer FROM quiz_questions WHERE id = quiz_answers.question_id)
--     THEN (SELECT points FROM quiz_questions WHERE id = quiz_answers.question_id)
--     ELSE 0
--   END
-- WHERE question_id = '<question_id>';

-- ============================================
-- SAMPLE DATA FOR TESTING (Day 2)
-- ============================================

-- Uncomment to add sample questions:
-- INSERT INTO quiz_questions (day_id, prompt, type, options, points) VALUES
-- ('day2', 'Who will be the last person to board the van?', 'mc', ARRAY['Thomas', 'Kelly', 'Kris', 'Cikgu'], 10),
-- ('day2', 'How many minutes will we be late for pickup? (Enter 2 digits)', 'number', NULL, 10),
-- ('day2', 'Who will take the most photos during ATV ride?', 'mc', ARRAY['Cikgu', 'Kris', 'Thomas', 'Kelly'], 10);
