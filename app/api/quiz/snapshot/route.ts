import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

/**
 * API Route: Snapshot daily rankings
 *
 * This should be called at the end of each day (e.g., midnight) to save
 * the current rankings for the next day's position change calculation.
 *
 * Usage:
 * - POST /api/quiz/snapshot { dayId: "day2" }
 *
 * This will store the current leaderboard positions for comparison
 * when the next quiz is completed.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dayId } = body;

    if (!dayId) {
      return NextResponse.json({ error: "dayId is required" }, { status: 400 });
    }

    const supabase = getSupabase();

    // Call the snapshot function
    const { error } = await supabase.rpc("snapshot_daily_rankings", {
      target_day_id: dayId,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: `Rankings snapshot for ${dayId} saved successfully`,
      dayId,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
