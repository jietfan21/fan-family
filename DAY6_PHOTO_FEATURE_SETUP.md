# Day 6 Photo Upload Feature - Setup Guide

This document contains all the SQL commands and setup instructions for the Day 6 photo upload feature.

## 1. Database Migration

Run this SQL in your Supabase SQL Editor:

```sql
-- Add columns to members table for Day 6 photo upload
ALTER TABLE members
  ADD COLUMN day6_photo_url TEXT,
  ADD COLUMN day6_photo_uploaded_at TIMESTAMPTZ;

-- Add comments for documentation
COMMENT ON COLUMN members.day6_photo_url IS 'URL to user uploaded photo from Day 6 Bali trip (Supabase Storage)';
COMMENT ON COLUMN members.day6_photo_uploaded_at IS 'Timestamp when Day 6 photo was uploaded';
```

## 2. Supabase Storage Bucket Setup

### Step A: Create the Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Configure the bucket:
   - **Name**: `day6-photos`
   - **Public bucket**: ✅ Enable (so images can be displayed in carousel)
5. Click **Create bucket**

### Step B: Set Up Storage Policies

Run this SQL in your Supabase SQL Editor to configure security policies:

```sql
-- Allow authenticated users to upload their own photos
CREATE POLICY "Users can upload their own photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'day6-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access for carousel display
CREATE POLICY "Anyone can view photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'day6-photos');

-- Allow users to update/delete their own photos
CREATE POLICY "Users can update their own photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'day6-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'day6-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

## 3. Feature Overview

### What Was Implemented

1. **Database Schema Updates**
   - Added `day6_photo_url` and `day6_photo_uploaded_at` columns to `members` table
   - Updated TypeScript types in `lib/supabase.ts`

2. **API Routes**
   - `POST /api/day6-photo/upload` - Handles photo uploads
   - `GET /api/day6-photo/list` - Fetches all uploaded photos for carousel

3. **UI Components**
   - `Day6PhotoUpload` - Photo upload interface with preview and re-upload confirmation
   - `Day6PhotoCarousel` - Auto-playing carousel showing everyone's photos with 3:4 portrait aspect ratio

4. **Integration**
   - Day 6 tab in quiz page now shows photo upload UI instead of quiz questions
   - Upload section at the top
   - Carousel displaying all photos below

### Key Features

✅ **One photo per user** - Enforced at database and UI level
✅ **Re-upload confirmation** - Dialog asks user to confirm before replacing existing photo
✅ **Portrait aspect ratio** - Photos displayed in 3:4 format with black letterboxing
✅ **Auto-playing carousel** - Cycles through photos every 3 seconds
✅ **Manual navigation** - Users can swipe/click arrows to browse photos
✅ **Uploader attribution** - Shows name and emoji above each photo
✅ **Real-time updates** - Refresh button to fetch newly uploaded photos
✅ **File validation** - Accepts JPEG, PNG, GIF, WebP up to 10MB
✅ **Supabase Storage** - Photos stored in cloud with public URLs

## 4. File Structure

```
/Users/fan/Documents/fan-family/
├── lib/supabase.ts (Updated - added day6_photo fields to Member type)
├── app/
│   ├── quiz/page.tsx (Updated - integrated Day 6 photo feature)
│   └── api/
│       └── day6-photo/
│           ├── upload/route.ts (New - handles uploads)
│           └── list/route.ts (New - fetches all photos)
└── components/
    ├── Day6PhotoUpload.tsx (New - upload UI)
    └── Day6PhotoCarousel.tsx (New - carousel display)
```

## 5. Testing Checklist

After running the SQL migrations and setting up the storage bucket:

- [ ] Navigate to quiz page and click Day 6 tab
- [ ] Verify upload UI appears instead of quiz questions
- [ ] Upload a test photo (should see preview)
- [ ] Try to upload again (should see confirmation dialog)
- [ ] Confirm replacement (should update photo)
- [ ] Check that carousel shows your photo
- [ ] Have another user upload a photo
- [ ] Click refresh button to see new photos in carousel
- [ ] Test carousel auto-play (3 second intervals)
- [ ] Test manual navigation with arrows and dots
- [ ] Verify uploader name and emoji display correctly

## 6. Troubleshooting

### Upload fails with "Failed to upload photo"
- Check that `day6-photos` bucket exists in Supabase Storage
- Verify storage policies are created correctly
- Check browser console for detailed error messages

### Photos don't appear in carousel
- Verify photos are being saved to `members.day6_photo_url`
- Check that bucket is set to **public**
- Try clicking the "Refresh to see new photos" button

### "Member not found" error
- Ensure user is logged in with valid member ID
- Check that `members` table has the new columns

### TypeScript errors
- Run `npm install` to ensure all dependencies are up to date
- Restart your development server

## 7. Future Enhancements (Optional)

If you want to add more features later:

- [ ] Image compression on upload to reduce file sizes
- [ ] Crop/rotate tool before upload
- [ ] Like/reaction system for photos
- [ ] Download button for each photo
- [ ] Admin ability to remove inappropriate photos
- [ ] Gallery view showing all photos at once
- [ ] Filter by uploader

## 8. Security Notes

- Storage policies ensure users can only upload/delete their own photos
- File type validation prevents non-image uploads
- File size limited to 10MB per upload
- Photos are stored in user-specific folders (`{member_id}/filename.ext`)
- Public read access allows carousel to display all photos
