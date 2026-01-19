-- ============================================
-- Enable RLS on Counters Table
-- ============================================
-- This migration enables Row Level Security on the counters table
-- to prevent unauthorized direct access via the Data API

-- Step 1: Enable Row Level Security
-- ============================================
ALTER TABLE counters ENABLE ROW LEVEL SECURITY;

-- Step 2: Create RLS Policies
-- ============================================

-- Policy: Allow authenticated users to READ counters
-- This allows the preview endpoint to work
CREATE POLICY "Allow authenticated users to read counters"
ON counters
FOR SELECT
TO authenticated
USING (true);

-- Policy: Prevent direct INSERT/UPDATE/DELETE via API
-- Users can only modify counters through the SECURITY DEFINER functions
-- which bypass RLS and have their own logic

CREATE POLICY "Prevent direct modifications"
ON counters
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

-- Note: The get_next_rhino_number() and get_current_rhino_number() functions
-- use SECURITY DEFINER which means they run with the privileges of the function
-- owner (usually the database admin) and bypass RLS policies.
-- This is intentional - we want controlled access through functions only.

-- Step 3: Grant appropriate permissions
-- ============================================
-- These were already granted in the previous migration, but let's ensure they exist
GRANT SELECT ON counters TO authenticated;
GRANT EXECUTE ON FUNCTION get_next_rhino_number() TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_rhino_number() TO authenticated;

-- ============================================
-- Verification Queries
-- ============================================

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'counters';
-- Expected: rowsecurity = true

-- View policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'counters';

-- Test that functions still work (they bypass RLS with SECURITY DEFINER)
SELECT get_current_rhino_number();
-- Should return current counter value

-- ============================================
-- Security Notes
-- ============================================
-- With RLS enabled:
-- ✅ Direct API access to counters table is blocked
-- ✅ Users can still call get_next_rhino_number() (increments counter)
-- ✅ Users can still call get_current_rhino_number() (reads counter)
-- ✅ Functions use SECURITY DEFINER to bypass RLS safely
-- ✅ No one can manually UPDATE counters via API
-- ✅ Admin functions like reset_rhino_counter() still work
