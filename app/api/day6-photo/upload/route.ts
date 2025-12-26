import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const formData = await request.formData();
    const file = formData.get("photo") as File;
    const memberId = formData.get("memberId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!memberId) {
      return NextResponse.json({ error: "No member ID provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only images are allowed." },
        { status: 400 }
      );
    }

    // Check if user already has a photo
    const { data: existingMember, error: memberError } = await supabase
      .from("members")
      .select("day6_photo_url")
      .eq("id", memberId)
      .single();

    if (memberError) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // If user has existing photo, delete it from storage
    if (existingMember?.day6_photo_url) {
      const oldPath = existingMember.day6_photo_url.split("/").pop();
      if (oldPath) {
        await supabase.storage
          .from("day6-photos")
          .remove([`${memberId}/${oldPath}`]);
      }
    }

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${memberId}/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("day6-photos")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload photo" },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("day6-photos")
      .getPublicUrl(filePath);

    const photoUrl = urlData.publicUrl;

    // Update member record with photo URL and timestamp
    const { error: updateError } = await supabase
      .from("members")
      .update({
        day6_photo_url: photoUrl,
        day6_photo_uploaded_at: new Date().toISOString(),
      })
      .eq("id", memberId);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update member record" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      photoUrl,
      uploadedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
