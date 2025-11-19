# Database Setup Instructions

## ✅ Supabase Configuration Complete

Your environment files are already configured with:
- **Project**: lonelyCat
- **URL**: https://rcdzetszicqyfxtkflih.supabase.co
- **Anon Key**: ✅ Added

## 🗄️ Create Database Tables

You need to run the SQL schema to create all the tables. Choose one of the methods below:

### Method 1: Supabase Dashboard (Recommended - Easiest)

1. **Open SQL Editor**
   - Go to: https://supabase.com/dashboard/project/rcdzetszicqyfxtkflih/editor
   - Click **"SQL Editor"** in the left sidebar
   - Click **"New Query"**

2. **Copy the Schema**
   - Open the file: `shared/database/schema.sql`
   - Copy all the contents (Cmd/Ctrl + A, then Cmd/Ctrl + C)

3. **Run the Schema**
   - Paste into the SQL editor
   - Click **"Run"** (or press Cmd/Ctrl + Enter)
   - Wait for "Success" message

4. **Verify Tables Created**
   - Click **"Table Editor"** in the left sidebar
   - You should see 6 tables:
     - ✅ user_profiles
     - ✅ user_reports
     - ✅ blocked_users
     - ✅ matches
     - ✅ messages
     - ✅ game_events

### Method 2: Using Supabase CLI (Advanced)

If you have Supabase CLI installed:

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref rcdzetszicqyfxtkflih

# Run the schema
supabase db push --db-url "postgresql://postgres:x6Y%239qsUg%25cNVDB@db.rcdzetszicqyfxtkflih.supabase.co:5432/postgres"
```

## 🔒 What Gets Created

### Tables
1. **user_profiles** - User accounts, verification status, game position
2. **user_reports** - Safety reports and moderation
3. **blocked_users** - User blocking relationships
4. **matches** - Successful encounters between users
5. **messages** - In-game chat messages
6. **game_events** - Activity audit log

### Security Features
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Users can only access their own data
- ✅ Blocked users are filtered from results
- ✅ Banned users cannot be viewed

### Performance
- ✅ Indexes on frequently queried columns
- ✅ Foreign key constraints for data integrity
- ✅ Auto-updated timestamps

## ✅ After Setup

Once the schema is created:

1. **Test the Web App**
   ```bash
   cd web
   npm run dev
   # Open http://localhost:3000
   ```

2. **Test the Mobile App**
   ```bash
   cd mobile
   npm start
   # Scan QR code with Expo Go
   ```

## 🐛 Troubleshooting

### "relation already exists" error
This means tables are already created. You can either:
- Skip this step (tables already exist)
- Drop all tables and re-run (⚠️ will delete data!)

### Permission errors
Make sure you're logged into Supabase with the correct account.

### Tables not appearing
- Refresh the Table Editor page
- Check the SQL query ran without errors
- Look for red error messages in the output

## 📖 Next Steps

After database setup, you'll need to add Clerk authentication keys to complete the setup. See [CLERK_SETUP.md](./CLERK_SETUP.md) (coming soon).

---

**Database Password (for reference)**: `x6Y#9qsUg%cNVDB`

**Project Dashboard**: https://supabase.com/dashboard/project/rcdzetszicqyfxtkflih
