\set ON_ERROR_STOP on

-- Run only against disposable local Supabase. Transaction leaves no fixture rows.
BEGIN;

DO $$
BEGIN
  IF has_function_privilege('anon','public.create_catalog_entry()','EXECUTE')
     OR has_function_privilege('anon','public.touch_catalog_on_source_change()','EXECUTE')
     OR has_function_privilege('authenticated','public.create_catalog_entry()','EXECUTE')
     OR has_function_privilege('authenticated','public.touch_catalog_on_source_change()','EXECUTE') THEN
    RAISE EXCEPTION 'trigger functions still exposed as API RPCs';
  END IF;
END $$;

-- Recreate a source row from before the INSERT trigger existed.
ALTER TABLE public.product_codes DISABLE TRIGGER trg_product_codes_after_insert;
INSERT INTO public.product_codes (id, product_code_data, compatibility_data, description_data)
VALUES (
  '00000000-0000-4000-8000-00000000c001', '{}',
  '{"items":[{"marca":"Toyota","modelo":"2020","subModelo":"Corolla"},{"marca":"toyota ","modelo":"2021","subModelo":"Camry"}]}',
  '{}'
);
ALTER TABLE public.product_codes ENABLE TRIGGER trg_product_codes_after_insert;

-- An editor editing someone else's legacy source row must heal missing mirror.
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-00000000e2e0', true);
SELECT set_config('request.jwt.claim.role', 'authenticated', true);
UPDATE public.product_codes
SET compatibility_data = '{"items":[{"marca":"Toyota","modelo":"2022","subModelo":"Corolla"},{"marca":"toyota ","modelo":"2023","subModelo":"Camry"}]}'
WHERE id = '00000000-0000-4000-8000-00000000c001';
RESET ROLE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.product_codes pc ON pc.id = p.product_code_id
    WHERE pc.id = '00000000-0000-4000-8000-00000000c001'
      AND p.status = 'draft' AND p.price = 0 AND p.stock = 0
      AND p.images = ARRAY[]::text[] AND p.model = '2022'
      AND p."subModel" = 'Corolla'
      AND (SELECT count(*) FROM public.product_brands pb WHERE pb.product_id = p.id) = 1
  ) THEN
    RAISE EXCEPTION 'legacy UPDATE failed to create matching catalog row';
  END IF;
END $$;

-- Give seeded second user admin role. Source rows have no owner column; these
-- IDs represent rows written by distinct authenticated users in this test.
INSERT INTO public.user_roles (user_id, role_id)
SELECT '00000000-0000-4000-8000-00000000e2e2', id
FROM public.roles WHERE name = 'admin';

-- Anonymous and viewer users cannot write source rows.
SET ROLE anon;
SELECT set_config('request.jwt.claim.sub', '', true);
SELECT set_config('request.jwt.claim.role', 'anon', true);
DO $$
BEGIN
  BEGIN
    INSERT INTO public.product_codes (id, product_code_data, compatibility_data, description_data)
    VALUES ('00000000-0000-4000-8000-00000000c099', '{}', '{"items":[]}', '{}');
    RAISE EXCEPTION 'anon INSERT unexpectedly allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM private.ensure_catalog_entry('00000000-0000-4000-8000-00000000c001');
    RAISE EXCEPTION 'anon called private helper';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END $$;
RESET ROLE;

SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-00000000e2e1', true);
SELECT set_config('request.jwt.claim.role', 'authenticated', true);
DO $$
BEGIN
  BEGIN
    INSERT INTO public.product_codes (id, product_code_data, compatibility_data, description_data)
    VALUES ('00000000-0000-4000-8000-00000000c098', '{}', '{"items":[]}', '{}');
    RAISE EXCEPTION 'viewer INSERT unexpectedly allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END $$;
RESET ROLE;

-- Editor creates row with duplicate normalized brand; admin creates a second
-- user's row with no marca. Both paths must produce one draft catalog row.
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-00000000e2e0', true);
INSERT INTO public.product_codes (id, product_code_data, compatibility_data, description_data)
VALUES ('00000000-0000-4000-8000-00000000c002', '{}',
        '{"items":[{"marca":"Honda","modelo":"2020","subModelo":"Civic"},{"marca":"honda ","modelo":"2021","subModelo":"Accord"}]}', '{}');
RESET ROLE;

SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-00000000e2e2', true);
INSERT INTO public.product_codes (id, product_code_data, compatibility_data, description_data)
VALUES ('00000000-0000-4000-8000-00000000c003', '{}',
        '{"items":[{"modelo":"2030","subModelo":"Blank brand"}]}', '{}');
RESET ROLE;

DO $$
BEGIN
  IF (SELECT count(*) FROM public.products WHERE product_code_id IN
      ('00000000-0000-4000-8000-00000000c002','00000000-0000-4000-8000-00000000c003')) <> 2
     OR (SELECT count(*) FROM public.product_brands pb JOIN public.products p ON p.id=pb.product_id
         WHERE p.product_code_id='00000000-0000-4000-8000-00000000c002') <> 1
     OR (SELECT primary_brand_id FROM public.products
         WHERE product_code_id='00000000-0000-4000-8000-00000000c003') IS NOT NULL THEN
    RAISE EXCEPTION 'INSERT sync failed for duplicate or empty marca';
  END IF;
END $$;

-- Catalog and source reads remain public for rows created by two users.
SET ROLE anon;
SELECT set_config('request.jwt.claim.sub', '', true);
DO $$
BEGIN
  IF (SELECT count(*) FROM public.product_codes WHERE id IN
      ('00000000-0000-4000-8000-00000000c002','00000000-0000-4000-8000-00000000c003'))<>2
     OR (SELECT count(*) FROM public.products WHERE product_code_id IN
      ('00000000-0000-4000-8000-00000000c002','00000000-0000-4000-8000-00000000c003'))<>2 THEN
    RAISE EXCEPTION 'anon cannot read both users source and catalog rows';
  END IF;
END $$;
RESET ROLE;

SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-00000000e2e1', true);
DO $$
BEGIN
  IF (SELECT count(*) FROM public.products WHERE product_code_id IN
      ('00000000-0000-4000-8000-00000000c002','00000000-0000-4000-8000-00000000c003'))<>2 THEN
    RAISE EXCEPTION 'viewer cannot read both users catalog rows';
  END IF;
END $$;
RESET ROLE;

DO $$
BEGIN
  BEGIN
    INSERT INTO public.products (product_code_id)
    VALUES ('00000000-0000-4000-8000-00000000c002');
    RAISE EXCEPTION 'duplicate catalog product unexpectedly allowed';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;
END $$;

-- Catalog-owned fields survive source UPDATE; empty marca preserves an
-- existing published primary brand and memberships.
UPDATE public.products SET price=123.45, stock=7, images=ARRAY['existing.jpg'], status='published'
WHERE product_code_id='00000000-0000-4000-8000-00000000c002';

SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-00000000e2e0', true);
UPDATE public.product_codes
SET compatibility_data='{"items":[{"modelo":"2031","subModelo":"No brand"}]}'
WHERE id='00000000-0000-4000-8000-00000000c002';
RESET ROLE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.products p WHERE product_code_id='00000000-0000-4000-8000-00000000c002'
      AND p.status='published' AND p.price=123.45 AND p.stock=7
      AND p.images=ARRAY['existing.jpg'] AND p.model='2031' AND p."subModel"='No brand'
      AND p.primary_brand_id IS NOT NULL
      AND (SELECT count(*) FROM public.product_brands pb WHERE pb.product_id=p.id)=1
  ) THEN
    RAISE EXCEPTION 'empty marca UPDATE lost catalog-owned fields or primary brand';
  END IF;
END $$;

-- Viewer and anon cannot update editor's row.
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-00000000e2e1', true);
DO $$
DECLARE n integer;
BEGIN
  UPDATE public.product_codes SET notes='viewer denied'
  WHERE id='00000000-0000-4000-8000-00000000c002';
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 0 THEN RAISE EXCEPTION 'viewer UPDATE unexpectedly affected % rows',n; END IF;
END $$;
RESET ROLE;

SET ROLE anon;
SELECT set_config('request.jwt.claim.sub', '', true);
DO $$
DECLARE n integer;
BEGIN
  UPDATE public.product_codes SET notes='anon denied'
  WHERE id='00000000-0000-4000-8000-00000000c002';
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 0 THEN RAISE EXCEPTION 'anon UPDATE unexpectedly affected % rows',n; END IF;
EXCEPTION WHEN insufficient_privilege THEN NULL;
END $$;
RESET ROLE;

-- Admin updates editor's source row; editor updates admin's row. No row-level
-- ownership predicate exists in live product_codes policies.
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-00000000e2e2', true);
UPDATE public.product_codes SET compatibility_data='{"items":[{"marca":"Honda","modelo":"2032","subModelo":"Admin edit"}]}'
WHERE id='00000000-0000-4000-8000-00000000c002';
RESET ROLE;
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-00000000e2e0', true);
UPDATE public.product_codes SET compatibility_data='{"items":[{"marca":"Ford","modelo":"2033","subModelo":"Editor edit"}]}'
WHERE id='00000000-0000-4000-8000-00000000c003';
RESET ROLE;

DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM public.products WHERE product_code_id='00000000-0000-4000-8000-00000000c002'
                AND model='2032' AND "subModel"='Admin edit' AND price=123.45)
     OR NOT EXISTS(SELECT 1 FROM public.products WHERE product_code_id='00000000-0000-4000-8000-00000000c003'
                AND model='2033' AND "subModel"='Editor edit' AND primary_brand_id IS NOT NULL) THEN
    RAISE EXCEPTION 'cross-user admin/editor UPDATE sync failed';
  END IF;
END $$;

-- Service role uses same triggers and bypasses source RLS.
SET ROLE service_role;
SELECT set_config('request.jwt.claim.role', 'service_role', true);
INSERT INTO public.product_codes (id, product_code_data, compatibility_data, description_data)
VALUES ('00000000-0000-4000-8000-00000000c004', '{}',
        '{"items":[{"marca":"Nissan","modelo":"2024","subModelo":"Sentra"}]}', '{}');
UPDATE public.product_codes SET compatibility_data='{"items":[{"marca":"Nissan","modelo":"2025","subModelo":"Sentra"}]}'
WHERE id='00000000-0000-4000-8000-00000000c004';
RESET ROLE;
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM public.products WHERE product_code_id='00000000-0000-4000-8000-00000000c004'
                AND model='2025' AND primary_brand_id IS NOT NULL) THEN
    RAISE EXCEPTION 'service role sync failed';
  END IF;
END $$;

-- Backfill empty marca twice. Existing catalog row snapshots
-- must stay byte-for-byte unchanged; only missing row may be inserted.
ALTER TABLE public.product_codes DISABLE TRIGGER trg_product_codes_after_insert;
INSERT INTO public.product_codes (id, product_code_data, compatibility_data, description_data)
VALUES ('00000000-0000-4000-8000-00000000c005', '{}', '{"items":[]}', '{}');
ALTER TABLE public.product_codes ENABLE TRIGGER trg_product_codes_after_insert;

CREATE TEMP TABLE catalog_before AS
SELECT p.* FROM public.products p WHERE p.product_code_id='00000000-0000-4000-8000-00000000c002';

SELECT private.ensure_catalog_entry('00000000-0000-4000-8000-00000000c005');
SELECT private.ensure_catalog_entry('00000000-0000-4000-8000-00000000c005');

DO $$
BEGIN
  IF (SELECT count(*) FROM public.products WHERE product_code_id='00000000-0000-4000-8000-00000000c005')<>1
     OR (SELECT count(*) FROM public.products WHERE product_code_id='00000000-0000-4000-8000-00000000c002')<>1
     OR (SELECT count(*) FROM (SELECT * FROM catalog_before EXCEPT
          SELECT p.* FROM public.products p WHERE p.product_code_id='00000000-0000-4000-8000-00000000c002') d)<>0
     OR (SELECT count(*) FROM public.product_brands pb JOIN public.products p ON p.id=pb.product_id
         WHERE p.product_code_id='00000000-0000-4000-8000-00000000c005')<>0 THEN
    RAISE EXCEPTION 'repeated backfill changed existing row or mishandled empty marca';
  END IF;
END $$;

ROLLBACK;
