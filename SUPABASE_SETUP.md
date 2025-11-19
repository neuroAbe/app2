# Supabase Database Setup Guide

This guide will help you set up your Supabase database for PixelMatch.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up for a free account (if you don't have one)
3. Click "New Project"
4. Fill in the details:
   - **Project Name**: PixelMatch (or whatever you prefer)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose the closest to your users
5. Click "Create new project"
6. Wait a few minutes for the project to be provisioned

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, click on the **Settings** icon (gear) in the sidebar
2. Go to **API** section
3. You'll see two important values:
   - **Project URL** (starts with `https://`)
   - **anon/public key** (long string)
4. Copy these values

## Step 3: Update Environment Variables

1. Open your `.env.local` file in the project root
2. Update the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace `your-project-id` and `your-anon-key-here` with your actual values from Step 2.

## Step 4: Run the Database Schema

1. In your Supabase dashboard, click on the **SQL Editor** icon in the sidebar
2. Click "+ New query"
3. Copy the entire contents of `/database/schema.sql` from this project
4. Paste it into the SQL editor
5. Click "Run" (or press Cmd/Ctrl + Enter)
6. You should see a success message

## Step 5: Verify Tables Were Created

1. Click on the **Table Editor** icon in the sidebar
2. You should see the following tables:
   - `user_profiles`
   - `user_reports`
   - `blocked_users`
   - `matches`
   - `messages`
   - `game_events`

If you see all these tables, you're good to go!

## Step 6: (Optional) Enable Row Level Security

The schema already includes RLS policies, but they're not enabled by default for testing. To enable them:

1. Go to **Authentication** > **Policies** in the Supabase dashboard
2. For each table, enable RLS
3. The policies defined in the schema will automatically be applied

**Note:** For development/testing, you can leave RLS disabled. For production, **always enable RLS**.

## Step 7: Test the Connection

1. Restart your Next.js development server:
```bash
npm run dev
```

2. Go to http://localhost:3000
3. Sign up for an account
4. Complete the onboarding flow
5. Check your Supabase dashboard > Table Editor > `user_profiles`
6. You should see your new profile!

## Troubleshooting

### "Failed to create profile" error

**Possible causes:**
1. Environment variables not set correctly
   - Solution: Double-check `.env.local` values
   - Solution: Restart dev server after changing env vars

2. Database schema not run
   - Solution: Go to SQL Editor and run the schema again

3. Row Level Security enabled without proper setup
   - Solution: Disable RLS for testing (Authentication > Policies)

### Tables not showing up

- Make sure you ran the ENTIRE schema.sql file
- Check for error messages in the SQL Editor
- Try running it section by section if there are errors

### Connection errors

- Verify your project URL is correct (no typos)
- Verify your anon key is the "anon public" key, not the service role key
- Check that your Supabase project is not paused (free tier projects pause after inactivity)

## Next Steps

Once your database is set up:

1. ✅ Users can sign up and create profiles
2. ✅ Profiles are stored in the database
3. ✅ Report and block features work
4. 🚧 Next: Add real-time features (Phase 4)

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Security Note:** Never commit your `.env.local` file to Git! It's already in `.gitignore`, but always double-check.
