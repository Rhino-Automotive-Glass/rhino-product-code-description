# Enable RLS on Counters Table - Quick Guide

## ⚠️ Security Issue
Your `counters` table currently has RLS (Row Level Security) disabled, which means anyone with access to your Supabase URL can read/modify it via the Data API.

## ✅ Fix (2 minutes)

### Step 1: Go to Supabase SQL Editor
1. Open your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar

### Step 2: Run the Migration
1. Click **New Query**
2. Copy the contents of `supabase/migrations/002_enable_rls_counters.sql`
3. Paste into the SQL editor
4. Click **Run** (or press Cmd/Ctrl + Enter)

### Step 3: Verify RLS is Enabled
Run this query to confirm:
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'counters';
```

Expected result:
```
tablename | rowsecurity
----------|------------
counters  | true
```

### Step 4: Test Functionality
Your app should still work perfectly. Test by:
1. Selecting "R - Rhino Automotive" in your app
2. Verifying the number preview loads
3. Creating a new Rhino product
4. Confirming the counter increments

## 🔒 What This Does

**Before (Insecure):**
- ❌ Anyone can read counters via API
- ❌ Anyone can modify counters via API
- ❌ Risk of counter manipulation

**After (Secure):**
- ✅ RLS enabled on counters table
- ✅ Direct API access blocked
- ✅ Access only through controlled functions
- ✅ Functions use SECURITY DEFINER (bypass RLS safely)
- ✅ Your app continues working normally

## 🎯 RLS Policies Created

1. **"Allow authenticated users to read counters"**
   - Allows SELECT operations
   - Needed for preview endpoint

2. **"Prevent direct modifications"**
   - Blocks INSERT/UPDATE/DELETE via API
   - Counter can only be modified through functions

## 🧪 How to Test

After running the migration:

```sql
-- This should work (reads through function):
SELECT get_current_rhino_number();

-- This should work (increments through function):
SELECT get_next_rhino_number();

-- This should be blocked by RLS (direct update):
UPDATE counters SET current_value = 999 WHERE name = 'rhino_auto_number';
-- Expected: Permission denied or 0 rows affected
```

## 🔧 Troubleshooting

### Issue: "Permission denied for table counters"
**Solution:** The migration should have granted SELECT permission. Re-run:
```sql
GRANT SELECT ON counters TO authenticated;
GRANT EXECUTE ON FUNCTION get_next_rhino_number() TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_rhino_number() TO authenticated;
```

### Issue: "Function get_next_rhino_number() doesn't work"
**Check:** Functions use `SECURITY DEFINER` which bypasses RLS. Verify with:
```sql
SELECT routine_name, security_type
FROM information_schema.routines
WHERE routine_name LIKE '%rhino%';
```
Expected: `security_type = DEFINER`

### Issue: App can't get Rhino numbers
1. Check browser console for errors
2. Verify API endpoints are working: `http://localhost:3000/api/counters/rhino-preview`
3. Check Supabase logs for permission errors

## 📚 Learn More

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Security Functions](https://www.postgresql.org/docs/current/sql-createfunction.html#SQL-CREATEFUNCTION-SECURITY)

## ✨ Benefits

- **Security**: Protected from unauthorized access
- **Integrity**: Counter can't be manipulated via direct API calls
- **Compliance**: Follows security best practices
- **No app changes**: Your frontend continues working as-is
