import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = getSupabase();

    // Get all members with their quiz stats, ordered by total points (descending)
    const { data: rankings, error } = await supabase
      .from("member_rankings_with_change")
      .select("*")
      .order("total_points", { ascending: false });

    if (error) {
      console.error("Error fetching rankings:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!rankings || rankings.length === 0) {
      return NextResponse.json({ winners: [] });
    }

    // Get the top 3 unique point values
    const uniquePoints = [
      ...new Set(rankings.map((r) => r.total_points)),
    ].sort((a, b) => b - a);

    const top3Points = uniquePoints.slice(0, 3);

    // Get all members who have points in the top 3 positions
    const winners = rankings.filter((member) => {
      return top3Points.includes(member.total_points);
    });

    // Assign rank based on points (1st, 2nd, 3rd)
    const formattedWinners = winners.map((winner) => {
      const rankIndex = top3Points.indexOf(winner.total_points);
      const accuracy =
        winner.total_answers > 0
          ? Math.round((winner.correct_answers / winner.total_answers) * 100)
          : 0;

      return {
        id: winner.id,
        name: winner.name,
        emoji: winner.emoji,
        total_points: winner.total_points,
        correct_answers: winner.correct_answers,
        total_answers: winner.total_answers,
        accuracy_percentage: accuracy,
        rank: rankIndex + 1, // 1st, 2nd, or 3rd
      };
    });

    // Sort by points (desc), then by correct_answers (desc) for consistent ordering
    formattedWinners.sort((a, b) => {
      if (b.total_points !== a.total_points) {
        return b.total_points - a.total_points;
      }
      return b.correct_answers - a.correct_answers;
    });

    return NextResponse.json({ winners: formattedWinners });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Failed to fetch winners" },
      { status: 500 }
    );
  }
}
