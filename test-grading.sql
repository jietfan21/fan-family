-- Test grading and ranking queries
-- Copy these one by one into Supabase SQL Editor

-- 1. Check what questions exist and have correct answers
SELECT
    id,
    day_id,
    prompt,
    correct_answer,
    type
FROM quiz_questions
ORDER BY day_id, created_at;

-- 2. Check user answers before grading
SELECT
    qa.id,
    m.name as member_name,
    qq.prompt as question,
    qa.answer as user_answer,
    qq.correct_answer,
    qa.is_correct,
    qa.points_earned
FROM quiz_answers qa
JOIN quiz_questions qq ON qa.question_id = qq.id
JOIN members m ON qa.member_id = m.id
ORDER BY m.name, qq.day_id;

-- 3. Test grade_question on ONE question
-- Replace 'YOUR_QUESTION_ID' with an actual question ID from step 1
-- SELECT grade_question('YOUR_QUESTION_ID');

-- 4. Check if member_rankings view works
SELECT * FROM member_rankings
ORDER BY total_points DESC;

-- 5. Check if member_rankings_with_change view works
SELECT * FROM member_rankings_with_change
ORDER BY current_rank;
