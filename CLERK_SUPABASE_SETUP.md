# Clerk + Supabase Integration Setup

## 🔒 Critical Security Update

**This guide describes how to properly configure Clerk authentication with Supabase RLS policies.**

As of the security update, your app now uses **authenticated Supabase clients** that pass Clerk JWT tokens to Supabase, enabling proper Row Level Security (RLS) enforcement.

---

## 📋 Prerequisites

1. ✅ Clerk account with your project configured
2. ✅ Supabase project created (lonelyCat - `rcdzetszicqyfxtkflih`)
3. ✅ Database schema applied (`shared/database/schema.sql`)

---

## 🔧 Step 1: Create Clerk JWT Template for Supabase

Clerk needs to issue JWT tokens that Supabase can validate. This requires creating a custom JWT template in Clerk.

### 1.1 Navigate to Clerk Dashboard

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your project (`CatchFeelings`)
3. Go to **"JWT Templates"** in the sidebar

### 1.2 Create Supabase JWT Template

1. Click **"New Template"**
2. Select **"Supabase"** from the template list
3. Name it: `supabase`
4. **IMPORTANT:** The template name MUST be exactly `supabase` (lowercase)

### 1.3 Configure the Template

Clerk will pre-fill the template with the correct claims. Verify it includes:

```json
{
  "aud": "authenticated",
  "exp": {{exp}},
  "sub": "{{user.id}}",
  "email": "{{user.primary_email_address}}",
  "role": "authenticated"
}
```

**Key fields:**
- `sub`: Clerk user ID (this is what RLS policies will use)
- `aud`: Must be "authenticated" for Supabase
- `role`: Must be "authenticated" to pass RLS checks

### 1.4 Get Supabase JWT Secret

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/rcdzetszicqyfxtkflih)
2. Navigate to **Settings** → **API**
3. Scroll to **JWT Settings**
4. Copy the **JWT Secret** (starts with a long random string)

### 1.5 Configure Clerk Template

1. In Clerk JWT template settings, paste the **Supabase JWT Secret**
2. Set **Lifetime:** 3600 seconds (1 hour) - matches default Supabase session
3. Click **"Save"**

---

## 🗄️ Step 2: Update Supabase RLS Policies

The security update includes fixed RLS policies that use `auth.jwt()` to extract the Clerk user ID from the JWT token.

### 2.1 Apply Fixed RLS Policies

Run this SQL in Supabase SQL Editor:

```bash
# Option 1: Via Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/rcdzetszicqyfxtkflih/sql
2. Click "New Query"
3. Copy contents of: shared/database/schema-fixed-rls.sql
4. Click "Run"
```

This will:
- ✅ Drop old broken RLS policies (that used `current_setting()`)
- ✅ Create new policies using `auth.jwt() -> 'sub'` to identify users
- ✅ Add missing policies for matches, messages, and game_events tables
- ✅ Prevent users from modifying safety fields (is_banned, report_count)

---

## 🧪 Step 3: Verify the Integration

### 3.1 Test Authentication Flow

```bash
cd web
npm run dev
```

1. **Sign up** for a new account
2. **Complete onboarding** - create profile
3. **View profile** - should load your data only
4. **Try to report** another user - should work

### 3.2 Verify RLS is Working

In Supabase SQL Editor, run:

```sql
-- This should show your RLS policies are enabled
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

You should see policies like:
- `Users can view own profile`
- `Users can update own profile`
- `Users can create reports`
- `Users can block others`

### 3.3 Test Security

Try these scenarios to verify security:

1. **Profile Isolation:**
   - Log in as User A
   - Try to view User B's profile by ID
   - ✅ Should work (public profiles are viewable)
   - Try to UPDATE User B's profile
   - ❌ Should fail (RLS blocks it)

2. **Report System:**
   - Log in as User A
   - Report User B
   - Check `user_reports` table
   - ✅ reporter_id should be User A's UUID
   - ✅ Cannot spoof reporter_id

3. **Block System:**
   - Block a user
   - Try to view blocked user's profile
   - ✅ Should be filtered out by RLS policy

---

## 🔐 How It Works

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User signs in via Clerk                                  │
│    ↓                                                         │
│ 2. Clerk issues JWT with { sub: "clerk_user_id" }          │
│    ↓                                                         │
│ 3. API route calls createServerSupabaseClient()             │
│    ↓                                                         │
│ 4. Supabase client passes JWT in Authorization header        │
│    ↓                                                         │
│ 5. Supabase validates JWT using Clerk's JWT secret          │
│    ↓                                                         │
│ 6. RLS policies extract user ID: auth.jwt() -> 'sub'        │
│    ↓                                                         │
│ 7. Database automatically filters queries by authenticated user│
└─────────────────────────────────────────────────────────────┘
```

### Code Flow

**Before (Broken):**
```typescript
// web/lib/supabase.ts
export const supabase = createClient(url, anonKey);
// ❌ No auth context, RLS policies don't work

// schema.sql
USING (clerk_user_id = current_setting('app.current_user_id'))
// ❌ current_setting() is never set, always returns NULL
```

**After (Fixed):**
```typescript
// web/lib/supabase-server.ts
export async function createServerSupabaseClient() {
  const token = await getToken({ template: 'supabase' });
  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });
}
// ✅ Passes Clerk JWT to Supabase

// schema-fixed-rls.sql
USING (clerk_user_id = (auth.jwt() -> 'sub')::text)
// ✅ Extracts user ID from JWT, RLS works correctly
```

---

## 🛡️ Security Improvements

### What Was Fixed

1. **RLS Policies Now Enforce Access Control**
   - Before: Relied on application code to filter queries
   - After: Database automatically enforces access control
   - Impact: Defense in depth - even if developer forgets to filter, RLS blocks unauthorized access

2. **Input Validation Added**
   - UUID format validation prevents injection attacks
   - Length limits on text fields prevent abuse
   - Type checking on all user inputs

3. **Critical Vulnerabilities Patched**
   - Fixed: Arbitrary user report_count modification
   - Fixed: Missing self-report prevention
   - Fixed: No validation on blockedUserId

### Example: Before vs After

**Before (Vulnerable):**
```typescript
// ❌ Attacker could send ANY UUID
POST /api/safety/report
{
  "reportedUserId": "00000000-0000-0000-0000-000000000000",
  "reason": "spam"
}
// Would increment report_count for ANY user
```

**After (Secure):**
```typescript
// ✅ Validates UUID format
// ✅ Verifies reported user exists and is accessible
// ✅ RLS ensures reporter_id matches authenticated user
// ✅ Prevents self-reporting
POST /api/safety/report
{
  "reportedUserId": "valid-uuid-only",
  "reason": "spam"
}
```

---

## 📝 Environment Variables

### Web App (.env.local)

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://rcdzetszicqyfxtkflih.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

**Note:** You do NOT need the Supabase service role key for normal operations. The anon key + Clerk JWT is sufficient.

---

## 🧪 Testing the Fix

### Manual Test: Verify RLS Blocking

1. Get two Clerk user IDs:
   - User A: `user_abc123`
   - User B: `user_xyz789`

2. Log in as User A

3. Try to update User B's profile via API:
   ```bash
   curl -X PATCH https://your-app.com/api/profile \
     -H "Authorization: Bearer USER_A_TOKEN" \
     -d '{"clerk_user_id": "user_xyz789", "bio": "hacked"}'
   ```

4. Expected result: ❌ **Fails** - RLS blocks update

### Automated Test: Run in Supabase SQL Editor

```sql
-- Test as User A (simulate JWT with sub="user_123")
SET request.jwt.claims = '{"sub": "user_123"}';

-- Try to update User B's profile
UPDATE user_profiles
SET bio = 'hacked'
WHERE clerk_user_id = 'user_456';

-- Expected: 0 rows updated (RLS blocked it)
```

---

## 🔍 Troubleshooting

### Issue: "Failed to get session token"

**Cause:** Clerk JWT template not configured or named incorrectly

**Fix:**
1. Go to Clerk Dashboard → JWT Templates
2. Ensure template is named exactly `supabase` (lowercase)
3. Verify Supabase JWT secret is correct

### Issue: "RLS policies not working"

**Cause:** Fixed RLS migration not applied

**Fix:**
1. Run `shared/database/schema-fixed-rls.sql` in Supabase SQL Editor
2. Verify policies exist:
   ```sql
   SELECT * FROM pg_policies WHERE schemaname = 'public';
   ```

### Issue: "Permission denied for table user_profiles"

**Cause:** RLS is enabled but user is not authenticated

**Fix:**
1. Verify `createServerSupabaseClient()` is being used (not old `supabase` singleton)
2. Check that JWT token is being passed:
   ```typescript
   const token = await getToken({ template: 'supabase' });
   console.log('Token:', token ? 'present' : 'missing');
   ```

### Issue: "User can see other users' private data"

**Cause:** Application code using old unauthenticated client

**Fix:**
1. Search codebase for `from '@/lib/supabase'`
2. Replace with `from '@/lib/supabase-server'`
3. Update import to use `createServerSupabaseClient()`

---

## 📚 Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Clerk + Supabase Integration Guide](https://clerk.com/docs/integrations/databases/supabase)
- [JWT.io](https://jwt.io/) - Decode JWTs to inspect claims

---

## ✅ Verification Checklist

Before deploying to production, verify:

- [ ] Clerk JWT template created with name `supabase`
- [ ] Supabase JWT secret configured in Clerk template
- [ ] Fixed RLS policies applied (`schema-fixed-rls.sql`)
- [ ] All API routes use `createServerSupabaseClient()`
- [ ] Environment variables set in production
- [ ] Tested profile isolation (User A cannot modify User B's data)
- [ ] Tested report system (proper validation and RLS enforcement)
- [ ] Tested block system (RLS filters blocked users)

---

**Last Updated:** 2025-01-19
**Security Update Version:** 1.0
