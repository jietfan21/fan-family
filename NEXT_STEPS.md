# Next Steps - Quiz Admin Feature

## ✅ Completed

All code has been written! Here's what's ready:

1. **Database Schema** - New fields, tables, functions, and views
2. **Dev Account Setup** - Password: 11111111
3. **Admin Panel** (`/admin`) - Full question management UI
4. **Updated Quiz Page** - Countdown timer, results display, position arrows
5. **API Routes** - Auto-grading and ranking snapshot endpoints
6. **TypeScript Types** - All updated in `lib/supabase.ts`

## 🚀 What You Need to Do

### Step 1: Run Database Migrations (REQUIRED)

Go to your Supabase project → SQL Editor and run these files **in order**:

1. **First:** [supabase-migration-quiz-admin.sql](supabase-migration-quiz-admin.sql)
   - Adds new columns to `quiz_questions`
   - Creates `daily_rankings` table
   - Creates `grade_question()` function
   - Creates `snapshot_daily_rankings()` function
   - Creates `member_rankings_with_change` view

2. **Second:** [supabase-migration-dev-account.sql](supabase-migration-dev-account.sql)
   - Updates your dev account (password `66666666`) to set `is_dev = true`

### Step 2: Test the Features

1. **Login as Dev:**
   ```
   Password: 66666666
   ```

2. **Access Admin Panel:**
   - Go to `/quiz` page
   - Click the Settings icon (⚙️) in top-right
   - Or visit `/admin` directly

3. **Create a Test Quiz:**
   - Select "Day 2"
   - Set Release Time: 09:00
   - Set End Time: 23:00
   - Add a multiple choice question
   - Add a number question
   - Try creating a prediction question

4. **Test User Experience:**
   - Logout and login as a regular user
   - Go to quiz page
   - See countdown timer (if before release)
   - Answer questions (if during active time)
   - View results (if after end time)

### Step 3: Set Up Auto-Grading (Optional but Recommended)

You have two options:

**Option A: Vercel Cron (Recommended if deployed on Vercel)**

Create `vercel.json` in project root:
```json
{
  "crons": [
    {
      "path": "/api/quiz/grade",
      "schedule": "* * * * *"
    }
  ]
}
```

**Option B: External Cron Service**

Use services like:
- Cron-job.org
- EasyCron
- Your own server

Set up to call every minute:
```bash
curl -X GET https://your-app.vercel.app/api/quiz/grade
```

### Step 4: Set Up Daily Ranking Snapshots (Optional)

At end of each day (e.g., midnight), snapshot rankings:

**Manual:**
```bash
curl -X POST https://your-app/api/quiz/snapshot \
  -H "Content-Type: application/json" \
  -d '{"dayId": "day2"}'
```

**Automated (Vercel Cron):**
```json
{
  "crons": [
    {
      "path": "/api/quiz/snapshot?dayId=day2",
      "schedule": "0 0 23 12 *"
    },
    {
      "path": "/api/quiz/snapshot?dayId=day3",
      "schedule": "0 0 24 12 *"
    }
  ]
}
```

## 📖 Full Documentation

See [QUIZ_ADMIN_SETUP.md](QUIZ_ADMIN_SETUP.md) for:
- Detailed feature explanation
- Step-by-step workflows
- API documentation
- Troubleshooting guide
- Example SQL commands

## 🎯 Quick Start Guide

### Daily Workflow (During Trip)

**Morning (Before 9 AM):**
1. Login as dev (66666666)
2. Go to `/admin`
3. Select today's day (e.g., Day 2)
4. Add 2-3 questions
5. Set release: 09:00, end: 23:00
6. Include at least one prediction question

**During Day:**
- Users answer questions
- You can monitor in real-time

**Evening (After event happens):**
1. Go to `/admin`
2. Find prediction questions (e.g., "How many beers?")
3. Click "Set Answer"
4. Enter the actual number
5. Auto-grading happens instantly
6. Leaderboard updates automatically

**Before Midnight:**
Run snapshot for next day's position tracking:
```bash
curl -X POST https://your-app/api/quiz/snapshot \
  -d '{"dayId": "day2"}'
```

## 🧪 Testing Checklist

- [ ] Database migrations run successfully
- [ ] Dev account login works (11111111)
- [ ] Admin page accessible by dev only
- [ ] Can create multiple choice question
- [ ] Can create number question (exact)
- [ ] Can create number question (range)
- [ ] Can create prediction question
- [ ] Quiz shows countdown before release
- [ ] Quiz allows answers during active time
- [ ] Quiz shows results after end time
- [ ] Leaderboard shows position arrows
- [ ] API `/api/quiz/grade` works
- [ ] API `/api/quiz/snapshot` works

## 🐛 Common Issues

**"Supabase not configured" error:**
- Check `.env.local` has correct Supabase credentials

**Admin page redirects to home:**
- Make sure dev account has `is_dev = true` (run the dev-account migration)
- Verify you're logged in as dev (password: 66666666)

**Grading not working:**
- Check `correct_answer` is set in database
- Verify `grade_question()` function exists
- Try manual grading via SQL

**Position arrows not showing:**
- Need at least one snapshot: `SELECT snapshot_daily_rankings('day2')`
- Check `daily_rankings` table has data

## 📝 Notes

- All times are Bali timezone (UTC+8)
- Each correct answer = 1 point
- Position arrows compare to yesterday's final ranking
- Dev can edit questions before release time
- After release, only prediction answers can be set

## 🎉 You're All Set!

Once you run the migrations, everything else is ready to use. The admin panel is fully functional and the quiz page has all the features you requested.

Enjoy your trip to Bali! 🌴🎊
