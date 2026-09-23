#!/usr/bin/env bash
set -euo pipefail

# Local Supabase only. Two psql sessions overlap; cleanup removes fixtures.
db=(psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -X -v ON_ERROR_STOP=1 -Atq)
export PGPASSWORD=postgres

cleanup() {
  "${db[@]}" -c "DELETE FROM public.product_codes WHERE id IN ('00000000-0000-4000-8000-00000000c006','00000000-0000-4000-8000-00000000c007');" >/dev/null
}
trap cleanup EXIT
cleanup

# Transaction A creates a source row but leaves it uncommitted. Backfill
# cannot see it; A's INSERT trigger creates its catalog row before commit.
"${db[@]}" <<'SQL' &
BEGIN;
INSERT INTO public.product_codes (id, product_code_data, compatibility_data, description_data)
VALUES ('00000000-0000-4000-8000-00000000c006','{}',
        '{"items":[{"marca":"Concurrent Insert","modelo":"2026"}]}','{}');
SELECT pg_sleep(2);
COMMIT;
SQL
writer=$!
sleep 0.3
"${db[@]}" -c "SELECT private.ensure_catalog_entry('00000000-0000-4000-8000-00000000c006');" >/dev/null
wait "$writer"

"${db[@]}" <<'SQL' >/dev/null
ALTER TABLE public.product_codes DISABLE TRIGGER trg_product_codes_after_insert;
INSERT INTO public.product_codes (id, product_code_data, compatibility_data, description_data)
VALUES ('00000000-0000-4000-8000-00000000c007','{}',
        '{"items":[{"marca":"Concurrent Backfill","modelo":"2026"}]}','{}');
ALTER TABLE public.product_codes ENABLE TRIGGER trg_product_codes_after_insert;
SQL

# Two concurrent backfill calls on the same missing source row serialize on
# SELECT ... FOR UPDATE; second call sees first transaction's product.
"${db[@]}" <<'SQL' &
BEGIN;
SELECT private.ensure_catalog_entry('00000000-0000-4000-8000-00000000c007');
SELECT pg_sleep(2);
COMMIT;
SQL
first=$!
sleep 0.3
"${db[@]}" -c "SELECT private.ensure_catalog_entry('00000000-0000-4000-8000-00000000c007');" >/dev/null
wait "$first"

result=$("${db[@]}" -c "SELECT count(*) FROM public.products WHERE product_code_id IN ('00000000-0000-4000-8000-00000000c006','00000000-0000-4000-8000-00000000c007');")
if [[ "$result" != 2 ]]; then
  echo "Expected exactly two catalog products; got $result" >&2
  exit 1
fi

result=$("${db[@]}" -c "SELECT count(*) FROM public.product_brands pb JOIN public.products p ON p.id=pb.product_id WHERE p.product_code_id IN ('00000000-0000-4000-8000-00000000c006','00000000-0000-4000-8000-00000000c007');")
if [[ "$result" != 2 ]]; then
  echo "Expected exactly two brand memberships; got $result" >&2
  exit 1
fi

echo 'Concurrent source insert and two overlapping backfills: one product and one membership per source.'
