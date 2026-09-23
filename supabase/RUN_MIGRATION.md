# Running the Verified Column Migration

## Quick Steps

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new

2. Copy and paste the SQL from `supabase/migrations/add_verified_column.sql`

3. Click "Run" to execute the migration

## What This Does

- Adds a `verified` boolean column to the `product_codes` table
- Sets default value to `false` for all new records
- Creates an index for better query performance
- All existing products will have `verified = false`

## Verification

After running the migration, you can verify it worked by running:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'product_codes'
AND column_name = 'verified';
```

You should see the `verified` column listed.

## Do not use `supabase db push` from this repository

Production is shared with several Rhino apps and has drifted from
`supabase/migrations/`, so `supabase/config.toml` sets
`db.migrations.enabled = false` and `supabase db push`, `migration repair`, and
other remote migration commands are off limits here. Apply production changes
through the dashboard SQL editor as above.

Locally, migrations are exercised automatically: `npm run e2e:db` loads the
baseline `supabase/e2e/schema.sql` and then applies every migration the
baseline does not already contain. See
docs/TESTING.md, "Database Setup: Baseline Schema and Pending Migrations".
