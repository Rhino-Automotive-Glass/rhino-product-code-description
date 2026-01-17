-- ============================================
-- Rhino Auto-Number Migration
-- ============================================
-- This migration creates the infrastructure for auto-incrementing
-- Rhino product numbers (00001, 00002, etc.)

-- Step 1: Create counters table
-- ============================================
CREATE TABLE IF NOT EXISTS counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  current_value INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment for documentation
COMMENT ON TABLE counters IS 'Stores auto-increment counters for various product types';
COMMENT ON COLUMN counters.name IS 'Unique identifier for the counter (e.g., rhino_auto_number)';
COMMENT ON COLUMN counters.current_value IS 'Current counter value - increments with each use';

-- Step 2: Insert initial Rhino counter
-- ============================================
INSERT INTO counters (name, current_value)
VALUES ('rhino_auto_number', 0)
ON CONFLICT (name) DO NOTHING;

-- Step 3: Create function to get next number atomically
-- ============================================
CREATE OR REPLACE FUNCTION get_next_rhino_number()
RETURNS INTEGER AS $$
DECLARE
  next_val INTEGER;
BEGIN
  -- Atomically increment and return the new value
  -- This operation is thread-safe due to row-level locking
  UPDATE counters
  SET
    current_value = current_value + 1,
    updated_at = NOW()
  WHERE name = 'rhino_auto_number'
  RETURNING current_value INTO next_val;

  -- Return the incremented value
  RETURN next_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for documentation
COMMENT ON FUNCTION get_next_rhino_number() IS 'Atomically gets the next Rhino auto-number and increments the counter';

-- Step 4: Create helper function to get current value (without incrementing)
-- ============================================
CREATE OR REPLACE FUNCTION get_current_rhino_number()
RETURNS INTEGER AS $$
DECLARE
  current_val INTEGER;
BEGIN
  SELECT current_value INTO current_val
  FROM counters
  WHERE name = 'rhino_auto_number';

  RETURN COALESCE(current_val, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_current_rhino_number() IS 'Gets current Rhino counter value without incrementing';

-- Step 5: Create function to reset counter (admin use only)
-- ============================================
CREATE OR REPLACE FUNCTION reset_rhino_counter(new_value INTEGER DEFAULT 0)
RETURNS INTEGER AS $$
DECLARE
  updated_val INTEGER;
BEGIN
  UPDATE counters
  SET
    current_value = new_value,
    updated_at = NOW()
  WHERE name = 'rhino_auto_number'
  RETURNING current_value INTO updated_val;

  RETURN updated_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION reset_rhino_counter(INTEGER) IS 'Resets Rhino counter to specified value (default: 0). Use with caution!';

-- Step 6: Grant permissions
-- ============================================
-- Allow authenticated users to read counters
GRANT SELECT ON counters TO authenticated;

-- Allow authenticated users to execute the get_next function
GRANT EXECUTE ON FUNCTION get_next_rhino_number() TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_rhino_number() TO authenticated;

-- Restrict reset function to service role only (more secure)
-- GRANT EXECUTE ON FUNCTION reset_rhino_counter(INTEGER) TO service_role;

-- Step 7: Create index for faster lookups
-- ============================================
CREATE INDEX IF NOT EXISTS idx_counters_name ON counters(name);

-- ============================================
-- Verification Queries (Run these to test)
-- ============================================

-- Check that counter was created
SELECT * FROM counters WHERE name = 'rhino_auto_number';
-- Expected: One row with current_value = 0

-- Test getting next number (run multiple times to see increment)
SELECT get_next_rhino_number();
-- Expected: 1 (first time), 2 (second time), 3 (third time), etc.

-- Check current value without incrementing
SELECT get_current_rhino_number();
-- Expected: Shows current value (e.g., 3 if you ran get_next three times)

-- View counter state
SELECT
  name,
  current_value,
  created_at,
  updated_at
FROM counters
WHERE name = 'rhino_auto_number';

-- ============================================
-- Rollback Script (if needed)
-- ============================================
-- Uncomment and run these lines to remove everything:

-- DROP FUNCTION IF EXISTS get_next_rhino_number();
-- DROP FUNCTION IF EXISTS get_current_rhino_number();
-- DROP FUNCTION IF EXISTS reset_rhino_counter(INTEGER);
-- DROP TABLE IF EXISTS counters CASCADE;
