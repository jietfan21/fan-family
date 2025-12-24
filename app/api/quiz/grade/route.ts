import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

/**
 * API Route: Auto-grade quiz questions that have ended
 *
 * This should be called:
 * 1. By a cron job every minute to check for ended quizzes
 * 2. Manually by dev after setting a prediction answer
 *
 * Usage:
 * - GET /api/quiz/grade - Grade all ended questions
 * - POST /api/quiz/grade { questionId: "uuid" } - Grade specific question
 */

export async function GET() {
  try {
    const supabase = getSupabase();

    // Find all questions that have a correct answer set (regardless of timing)
    const { data: questions, error: fetchError } = await supabase
      .from("quiz_questions")
      .select("id, end_time, correct_answer, is_prediction")
      .not("correct_answer", "is", null);

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!questions || questions.length === 0) {
      return NextResponse.json({ message: "No questions to grade", graded: 0, total: 0 });
    }

    // Grade each question
    let gradedCount = 0;
    const errors: string[] = [];
    const details: string[] = [];

    for (const question of questions) {
      const { data, error } = await supabase.rpc("grade_question", {
        p_question_id: question.id,
      });

      if (error) {
        errors.push(`Failed to grade ${question.id}: ${error.message}`);
        details.push(`Question ${question.id}: ERROR - ${error.message}`);
      } else {
        gradedCount++;
        details.push(`Question ${question.id}: RPC called successfully (data: ${JSON.stringify(data)})`);
      }
    }

    // Log details for debugging
    console.log("Grading details:", details);

    return NextResponse.json({
      message: `Graded ${gradedCount} questions`,
      graded: gradedCount,
      total: questions.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questionId } = body;

    if (!questionId) {
      return NextResponse.json({ error: "questionId is required" }, { status: 400 });
    }

    const supabase = getSupabase();

    // Grade the specific question
    const { error } = await supabase.rpc("grade_question", {
      p_question_id: questionId,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Question graded successfully",
      questionId,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
