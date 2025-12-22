# Quiz Admin Feature - Setup Guide

## Overview

This guide explains how to set up and use the quiz admin feature for the family trip app. The feature allows a dev account to create daily quizzes with automatic grading and leaderboard tracking.

## Database Setup

### Step 1: Run Migrations in Order

Run these SQL files in your Supabase SQL Editor in this exact order:

1. **supabase-migration-quiz-admin.sql** - Adds new fields and functions
   - New fields: `release_time`, `end_time`, `is_prediction`, `answer_type`, `answer_min`, `answer_max`
   - New table: `daily_rankings` for position tracking
   - Functions: `grade_question()`, `snapshot_daily_rankings()`
   - View: `member_rankings_with_change` with position arrows

2. **supabase-migration-dev-account.sql** - Creates dev account
   - Password: `11111111`
   - Name: "Dev Admin"
   - `is_dev: true`

### Step 2: Verify Setup

```sql
-- Check if dev account exists
SELECT * FROM members WHERE password = '11111111';

-- Check if new fields exist
SELECT column_name FROM information_schema.columns
WHERE table_name = 'quiz_questions';

-- Test grading function exists
SELECT proname FROM pg_proc WHERE proname = 'grade_question';
```

## Using the Admin Panel

### Access Admin Panel

1. **Login as Dev**
   - Go to `/login`
   - Enter password: `66666666`
   - You'll see a Settings icon in the quiz page header

2. **Navigate to Admin**
   - Click the Settings icon (⚙️) in quiz page header
   - Or directly visit `/admin`

### Creating a Quiz

#### Step 1: Select Day
Choose which day to create quiz for (Day 1-6)

#### Step 2: Set Quiz Timing
- **Release Time**: When quiz becomes available (e.g., 09:00)
- **End Time**: When quiz closes and auto-grades (e.g., 23:00)
- All times are in **Bali timezone (UTC+8)**

#### Step 3: Add Questions

Click "Add Question" button and fill in:

**Multiple Choice Question:**
```
Question: Who will wake up first tomorrow?
Type: Multiple Choice
Options:
  - Thomas
  - Cikgu
  - Kelly
  - Kris
Prediction: No (if you know the answer now)
Correct Answer: Thomas
```

**Number Question (Exact):**
```
Question: How many photos will Cikgu take? (2 digits)
Type: 2-Digit Number
Answer Type: Exact Number
Prediction: Yes (you'll set answer later)
```

**Number Question (Range):**
```
Question: What will the temperature be at noon? (Celsius)
Type: 2-Digit Number
Answer Type: Range
Min: 28
Max: 32
Prediction: No
Correct Answer: 30 (any value in range works)
```

#### Step 4: Manage Questions

- **Edit**: Click edit icon - only works before release time
- **Delete**: Click trash icon - only works before release time
- **Set Prediction Answer**: After quiz ends, click "Set Answer" for prediction questions

### Prediction Questions Workflow

1. **Create prediction question** (e.g., "How many beers will we drink?")
   - Toggle "Prediction Question" ON
   - Don't set correct answer yet

2. **Users answer during quiz time**
   - Quiz releases at set time
   - Users submit their predictions
   - Quiz ends at set time

3. **After quiz ends, count the actual result**
   - Count the beers (let's say it's 15)

4. **Set the correct answer in admin panel**
   - Click "Set Answer" button on the question
   - Enter "15"
   - Click "Update Question"

5. **Auto-grading happens immediately**
   - System grades all answers against "15"
   - Points awarded automatically
   - Leaderboard updates with position changes

## User Experience

### Before Release Time
- Quiz tab shows countdown: "Releases in: 2h 30m 15s"
- Questions are locked

### During Quiz Time (Active)
- Users can submit answers
- Each answer can only be submitted once
- Immediate confirmation after submission

### After End Time
- Quiz automatically closes
- Shows user's answers
- Shows correct answers
- Shows points earned per question
- Leaderboard updates with position arrows

## Leaderboard Position Changes

### How It Works
1. At end of Day 2 quiz, snapshot rankings: `POST /api/quiz/snapshot { dayId: "day2" }`
2. Day 3 quiz happens
3. When viewing rankings, arrows show change from Day 2 snapshot
4. Green ↑3 = moved up 3 positions
5. Red ↓2 = moved down 2 positions

### First Day (Day 2)
- No arrows shown (no previous data)
- Everyone starts at position 0

## Auto-Grading System

### Automatic Grading Triggers

**Method 1: End Time (Recommended for production)**
Set up a cron job to call every minute:
```bash
curl -X GET https://your-app.vercel.app/api/quiz/grade
```

This checks for all questions where:
- `end_time < now()`
- `correct_answer IS NOT NULL`
- Auto-grades all matching questions

**Method 2: Manual Grading (For prediction questions)**
After setting the correct answer in admin panel, the grading happens automatically via:
```typescript
await supabase.rpc("grade_question", { question_uuid: questionId });
```

### Grading Logic

**Multiple Choice:**
- Exact match with `correct_answer`
- 1 point if correct, 0 if wrong

**Number (Exact):**
- Exact match with `correct_answer`
- 1 point if correct, 0 if wrong

**Number (Range):**
- Answer must be >= `answer_min` AND <= `answer_max`
- 1 point if in range, 0 if outside

## API Routes

### Grade Questions
```bash
# Grade all ended questions
GET /api/quiz/grade

# Grade specific question
POST /api/quiz/grade
{
  "questionId": "uuid-here"
}
```

### Snapshot Rankings
```bash
# Save current rankings for position tracking
POST /api/quiz/snapshot
{
  "dayId": "day2"
}
```

## Daily Workflow

### Morning (9:00 AM)
1. Quiz auto-releases at set time
2. Users receive notification (optional: add push notifications)
3. Users start answering

### Evening (11:00 PM)
1. Quiz auto-closes at end time
2. Cron job grades all non-prediction questions
3. Leaderboard updates

### After Event (For prediction questions)
1. Count actual result (e.g., beers, photos, etc.)
2. Login to admin panel
3. Set correct answer for prediction question
4. Auto-grading happens immediately
5. Leaderboard updates with position changes

### End of Day (Midnight)
```bash
# Snapshot today's rankings for tomorrow's position changes
curl -X POST https://your-app.vercel.app/api/quiz/snapshot \
  -H "Content-Type: application/json" \
  -d '{"dayId": "day2"}'
```

## Troubleshooting

### Questions not showing for users
- Check release_time hasn't passed
- Verify questions exist: `SELECT * FROM quiz_questions WHERE day_id = 'day2'`

### Grading not working
- Check correct_answer is set: `SELECT id, correct_answer FROM quiz_questions`
- Manually trigger: `SELECT grade_question('<question_id>')`

### Position arrows not showing
- Check daily_rankings has data: `SELECT * FROM daily_rankings`
- Run snapshot: `SELECT snapshot_daily_rankings('day2')`

### Dev account can't access admin
- Verify is_dev: `SELECT is_dev FROM members WHERE password = '66666666'`
- Should return `true`

## Example: Complete Day 2 Setup

```sql
-- 1. Add 3 questions for Day 2
INSERT INTO quiz_questions (day_id, prompt, type, options, answer_type, release_time, end_time, is_prediction, correct_answer, points)
VALUES
  ('day2', 'Who will be the last person to board the van?', 'mc', ARRAY['Thomas', 'Kelly', 'Kris', 'Cikgu'], 'exact', '2025-12-23 09:00:00+08', '2025-12-23 23:00:00+08', false, 'Kelly', 1),
  ('day2', 'How many minutes will we be late for pickup?', 'number', NULL, 'exact', '2025-12-23 09:00:00+08', '2025-12-23 23:00:00+08', true, NULL, 1),
  ('day2', 'How hot will it be at noon? (Celsius)', 'number', NULL, 'range', '2025-12-23 09:00:00+08', '2025-12-23 23:00:00+08', false, NULL, 1);

-- 2. Set range for temperature question
UPDATE quiz_questions
SET answer_min = 28, answer_max = 32, correct_answer = '30'
WHERE prompt LIKE '%hot%';

-- 3. After quiz ends and you count the actual late minutes (let's say 15)
UPDATE quiz_questions
SET correct_answer = '15'
WHERE prompt LIKE '%late%';

-- 4. Grade the prediction question
SELECT grade_question((SELECT id FROM quiz_questions WHERE prompt LIKE '%late%'));

-- 5. At end of day, snapshot rankings
SELECT snapshot_daily_rankings('day2');
```

## Security Notes

- Dev account password is simple (11111111) - fine for family app
- Admin page is protected by `is_dev` check
- No additional authentication needed
- For production: add API route authentication

## Future Enhancements

- [ ] Push notifications when quiz releases
- [ ] Email summary of results
- [ ] Quiz statistics dashboard
- [ ] Export results to CSV
- [ ] Bulk question import
- [ ] Question templates
- [ ] Auto-snapshot at midnight (scheduled function)
- [ ] Auto-grade cron job (Vercel Cron)
