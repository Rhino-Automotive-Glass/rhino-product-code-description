Update Val 5 
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Database Backups

This project ships a backup/restore system for the Supabase PostgreSQL
database, built on `pg_dump` / `pg_restore`.

- `scripts/backup-db.sh` — creates a compressed, restorable backup.
- `scripts/restore-db.sh` — restores a backup (latest by default).
- Backups are written to `backups/YYYY-MM-DD/backup_YYYY-MM-DD_HHMMSS.dump`.
- The `backups/` directory is git-ignored (only `.gitkeep` is tracked) so dumps
  never land in version control.

### 1. Install the PostgreSQL CLI tools

The scripts need `pg_dump` and `pg_restore` on your `PATH`.

**macOS (Homebrew):**

```bash
brew install libpq
brew link --force libpq   # exposes pg_dump / pg_restore on PATH
```

(Or `brew install postgresql@16` for the full server + client.)

**Ubuntu / Debian:**

```bash
sudo apt-get update
sudo apt-get install -y postgresql-client
```

**Verify:**

```bash
pg_dump --version
pg_restore --version
```

> Tip: keep the client major version >= your Supabase Postgres major version.

### 2. Configure credentials

Copy the example env file and fill in the database URL — no secrets live in
the scripts:

```bash
cp .env.example .env
```

Set `SUPABASE_DB_URL` in `.env`. Find it in the Supabase dashboard under
**Project Settings → Database → Connection string → URI**. Prefer the **direct
connection** (port `5432`) for dump/restore so the full schema is captured:

```
SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

The scripts also accept `SUPABASE_DB_URL` from the shell environment, which is
how CI/cron should provide it.

### 3. Run a backup

```bash
npm run db:backup
```

This dumps the entire database — schema, tables, and indexes — in PostgreSQL
custom format (`--format=custom`), compressed, to
`backups/<date>/backup_<date>_<time>.dump`. The script fails fast on any error
and prints progress logs.

### 4. Restore a backup

Restore the most recent backup automatically:

```bash
npm run db:restore
```

Restore a specific file:

```bash
npm run db:restore -- backups/2026-05-14/backup_2026-05-14_142530.dump
```

Restore uses `pg_restore --clean --if-exists`, which **drops and recreates**
existing objects. It is destructive, so it asks for a typed `yes` confirmation
first. In non-interactive environments set `RESTORE_YES=1` to skip the prompt.

### 5. Automate backups

The scripts are non-interactive for backups, so they drop straight into a
scheduler.

**cron (daily at 02:00):**

```cron
0 2 * * * cd /path/to/rhino-product-code-description && SUPABASE_DB_URL='postgresql://...' npm run db:backup >> /var/log/db-backup.log 2>&1
```

**GitHub Actions** — store `SUPABASE_DB_URL` as a repository secret:

```yaml
name: Database Backup
on:
  schedule:
    - cron: '0 2 * * *'   # daily at 02:00 UTC
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install PostgreSQL client
        run: sudo apt-get update && sudo apt-get install -y postgresql-client
      - name: Run backup
        env:
          SUPABASE_DB_URL: ${{ secrets.SUPABASE_DB_URL }}
        run: npm run db:backup
      - name: Upload backup artifact
        uses: actions/upload-artifact@v4
        with:
          name: db-backup-${{ github.run_id }}
          path: backups/
          retention-days: 30
```

For long-term storage, push the contents of `backups/` to off-site storage
(e.g. S3, GCS, a Supabase Storage bucket) as a follow-up step.
