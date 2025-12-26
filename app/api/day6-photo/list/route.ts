import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = getSupabase();

    // Fetch all members who have uploaded photos
    const { data: members, error } = await supabase
      .from("members")
      .select("id, name, emoji, day6_photo_url, day6_photo_uploaded_at")
      .not("day6_photo_url", "is", null)
      .order("day6_photo_uploaded_at", { ascending: true });

    if (error) {
      console.error("Fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch photos" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      photos: members || [],
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
