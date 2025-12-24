-- Fix the grade_question function to bypass RLS
-- Run this in Supabase SQL Editor

-- Drop both possible versions
DROP FUNCTION IF EXISTS grade_question(UUID);
DROP FUNCTION IF EXISTS grade_question(TEXT);

CREATE OR REPLACE FUNCTION grade_question(p_question_id TEXT)
RETURNS void
SECURITY DEFINER  -- This allows the function to bypass RLS policies
SET search_path = public
AS $$
DECLARE
  q_record RECORD;
  answer_record RECORD;
  is_answer_correct BOOLEAN;
  points_to_award INTEGER;
BEGIN
  -- Get question details
  SELECT * INTO q_record FROM quiz_questions WHERE id = p_question_id;

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
    SELECT id, answer FROM quiz_answers WHERE question_id = p_question_id
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION grade_question(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION grade_question(TEXT) TO service_role;
