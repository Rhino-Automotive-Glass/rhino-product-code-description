#!/usr/bin/env bash
set -euo pipefail

export PGPASSWORD=postgres
db=(psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -X -v ON_ERROR_STOP=1 -Atq)
migration=supabase/migrations/20260923064618_backfill_legacy_catalog_sync.sql

cleanup() {
  "${db[@]}" -c "DELETE FROM public.product_codes WHERE id IN ('00000000-0000-4000-8000-00000000c008','00000000-0000-4000-8000-00000000c009');" >/dev/null
}
trap cleanup EXIT
cleanup

"${db[@]}" <<'SQL' >/dev/null
ALTER TABLE public.product_codes DISABLE TRIGGER trg_product_codes_after_insert;
INSERT INTO public.product_codes (id, product_code_data, compatibility_data, description_data)
VALUES ('00000000-0000-4000-8000-00000000c008','{}',
        '{"items":[{"marca":"Repeat Brand","modelo":"2026","subModelo":"Backfill"}]}','{}');
ALTER TABLE public.product_codes ENABLE TRIGGER trg_product_codes_after_insert;
INSERT INTO public.product_codes (id, product_code_data, compatibility_data, description_data)
VALUES ('00000000-0000-4000-8000-00000000c009','{}',
        '{"items":[{"marca":"Existing Brand","modelo":"2025"}]}','{}');
UPDATE public.products SET price=88.50,stock=4,images=ARRAY['owned.jpg'],status='published'
WHERE product_code_id='00000000-0000-4000-8000-00000000c009';
SQL

before=$("${db[@]}" -c "SELECT row_to_json(p)::text FROM public.products p WHERE product_code_id='00000000-0000-4000-8000-00000000c009';")
"${db[@]}" -1 -f "$migration" >/dev/null
"${db[@]}" -1 -f "$migration" >/dev/null
after=$("${db[@]}" -c "SELECT row_to_json(p)::text FROM public.products p WHERE product_code_id='00000000-0000-4000-8000-00000000c009';")

if [[ "$before" != "$after" ]]; then
  echo 'Existing catalog row changed during repeated migration' >&2
  exit 1
fi

result=$("${db[@]}" -c "SELECT count(*) FROM public.products WHERE product_code_id IN ('00000000-0000-4000-8000-00000000c008','00000000-0000-4000-8000-00000000c009');")
if [[ "$result" != 2 ]]; then
  echo "Expected exactly two products after repeated migration; got $result" >&2
  exit 1
fi

result=$("${db[@]}" -c "SELECT count(*) FROM public.product_brands pb JOIN public.products p ON p.id=pb.product_id WHERE p.product_code_id='00000000-0000-4000-8000-00000000c008';")
if [[ "$result" != 1 ]]; then
  echo "Expected one backfilled brand membership; got $result" >&2
  exit 1
fi

echo 'Migration applied twice: one backfilled product, one membership, existing catalog row unchanged.'
