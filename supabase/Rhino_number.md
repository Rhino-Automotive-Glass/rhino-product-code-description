# Supabase Database Setup Guide

## Rhino Auto-Number Feature Setup

This guide will walk you through setting up the database for the Rhino auto-number feature.

---

## Prerequisites

- Access to your Supabase project dashboard
- Database write permissions

---

## Step-by-Step Instructions

### 1. Open Supabase SQL Editor

1. Go to your Supabase project: https://supabase.com/dashboard
2. Select your project: **rhino-code-generator**
3. Click on **SQL Editor** in the left sidebar
4. Click **New query** button

### 2. Run the Migration Script

1. Open the file: `supabase/migrations/001_rhino_auto_number.sql`
2. Copy the entire contents
3. Paste into the Supabase SQL Editor
4. Click **Run** button (or press Cmd/Ctrl + Enter)

### 3. Verify Installation

After running the migration, you should see:
```
Success. No rows returned
```

Run these verification queries one by one:

#### Check counter was created:
```sql
SELECT * FROM counters WHERE name = 'rhino_auto_number';
```
**Expected result:**
| id | name | current_value | created_at | updated_at |
|----|------|---------------|------------|------------|
| (uuid) | rhino_auto_number | 0 | (timestamp) | (timestamp) |

#### Test the increment function:
```sql
SELECT get_next_rhino_number();
```
**Expected result:** `1`

Run it again:
```sql
SELECT get_next_rhino_number();
```
**Expected result:** `2`

Run it again:
```sql
SELECT get_next_rhino_number();
```
**Expected result:** `3`

#### Check current value (without incrementing):
```sql
SELECT get_current_rhino_number();
```
**Expected result:** `3` (or whatever the current counter value is)

---

## What Was Created

### 1. **counters** table
Stores auto-increment counters for different purposes.

**Columns:**
- `id` - Unique identifier (UUID)
- `name` - Counter name (unique) - e.g., "rhino_auto_number"
- `current_value` - Current counter value (starts at 0)
- `created_at` - When counter was created
- `updated_at` - Last time counter was updated

### 2. **get_next_rhino_number()** function
- Atomically increments the counter
- Returns the next available number
- Thread-safe (handles concurrent requests)
- Used by the API to get sequential numbers

### 3. **get_current_rhino_number()** function
- Returns current counter value WITHOUT incrementing
- Useful for checking status
- Used for debugging/monitoring

### 4. **reset_rhino_counter(new_value)** function
- Resets counter to a specific value
- **Use with caution!** Only for admin/testing
- Example: `SELECT reset_rhino_counter(0);` resets to 0

---

## Testing the Setup

### Basic Test Sequence

Run these queries in order to test everything works:

```sql
-- 1. Reset counter to start fresh (optional)
SELECT reset_rhino_counter(0);

-- 2. Get next number (should be 1)
SELECT get_next_rhino_number();

-- 3. Get next number (should be 2)
SELECT get_next_rhino_number();

-- 4. Get next number (should be 3)
SELECT get_next_rhino_number();

-- 5. Check current value without incrementing (should be 3)
SELECT get_current_rhino_number();

-- 6. View full counter details
SELECT * FROM counters WHERE name = 'rhino_auto_number';
```

### Concurrency Test (Advanced)

To test that concurrent requests work correctly:

```sql
-- Open two SQL Editor tabs and run this simultaneously in both:
SELECT get_next_rhino_number();

-- Each should get a different number (no duplicates)
-- Example: Tab 1 gets "4", Tab 2 gets "5"
```

---

## Permissions

The migration automatically sets up these permissions:

- **authenticated** users can:
  - SELECT from `counters` table
  - Execute `get_next_rhino_number()`
  - Execute `get_current_rhino_number()`

- **anon** users: No access (security)

- **Reset function**: Only available via SQL Editor (restricted)

---

## Troubleshooting

### Issue: "permission denied for table counters"

**Solution:** Re-run the permission grants:
```sql
GRANT SELECT ON counters TO authenticated;
GRANT EXECUTE ON FUNCTION get_next_rhino_number() TO authenticated;
```

### Issue: "relation 'counters' already exists"

**Solution:** Table already exists. To start fresh:
```sql
DROP TABLE IF EXISTS counters CASCADE;
-- Then re-run the migration
```

### Issue: Numbers are duplicating

**Solution:** Check if counter is being incremented:
```sql
-- This should show an incrementing current_value
SELECT * FROM counters WHERE name = 'rhino_auto_number';

-- Try calling the function
SELECT get_next_rhino_number();

-- Check again - current_value should have increased by 1
SELECT * FROM counters WHERE name = 'rhino_auto_number';
```

### Issue: Want to reset counter back to 0

**Solution:**
```sql
SELECT reset_rhino_counter(0);
```

---

## Next Steps

Once you've verified the database setup:

1. ✅ Counter table created
2. ✅ Functions working correctly
3. ✅ Permissions set up

You're ready to move on to:
- **API Layer**: Create endpoint to fetch next Rhino number
- **Frontend**: Auto-fill numero field when clasificacion = 'R'

---

## Monitoring

### Check how many Rhino numbers have been used:
```sql
SELECT current_value as total_rhino_products
FROM counters
WHERE name = 'rhino_auto_number';
```

### View counter history (if updated_at changes):
```sql
SELECT
  name,
  current_value,
  updated_at,
  updated_at - created_at as time_since_creation
FROM counters
WHERE name = 'rhino_auto_number';
```

---

## Production Considerations

### Before Going Live:

1. **Set Initial Value**: If you already have Rhino products, set counter appropriately:
   ```sql
   -- Find max existing Rhino number
   SELECT MAX(CAST(product_code_data->>'numero' AS INTEGER))
   FROM product_codes
   WHERE product_code_data->>'clasificacion' = 'R';

   -- Set counter to max + 1 (replace 100 with your max)
   SELECT reset_rhino_counter(100);
   ```

2. **Backup**: Supabase automatically backs up, but good practice:
   ```sql
   -- Export current state
   SELECT * FROM counters;
   ```

3. **Monitor**: Set up alerts if counter value seems unusual

---

## Rollback

If you need to completely remove this feature:

```sql
-- Remove functions
DROP FUNCTION IF EXISTS get_next_rhino_number();
DROP FUNCTION IF EXISTS get_current_rhino_number();
DROP FUNCTION IF EXISTS reset_rhino_counter(INTEGER);

-- Remove table
DROP TABLE IF EXISTS counters CASCADE;
```

**Warning:** This will delete all counter data permanently!
