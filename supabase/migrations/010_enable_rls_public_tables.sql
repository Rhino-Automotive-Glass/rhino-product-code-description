-- ============================================
-- Close anonymous write access on public tables
-- ============================================
-- Written against the LIVE policy state (inspected 2026-09-18), not against
-- the repo's earlier migrations, which had drifted from it. What was live:
--
--   product_codes           RLS on, but legacy "Allow public insert / update /
--                           delete" policies (TO public, USING true) let anyone
--                           holding the browser-visible anon key create and
--                           delete rows. Updates were already stopped by the
--                           enforce_product_codes_verified_only_update trigger.
--   tasks                   RLS on, but "Allow anonymous read/insert/update/
--                           delete" policies opened it completely.
--   brands, product_brands  RLS off.
--   product_stock           RLS off.
--   products                RLS on, public read, admin/editor update. Fine.
--   product_groups,         RLS on, anon reads published groups only. Fine —
--   product_group_products  deliberately left alone so this does not widen it.
--
-- Access after this migration:
--
--   PUBLIC READ  product_codes, products, brands, product_brands (+ published
--                product_groups / product_group_products, unchanged).
--                rhino-landing-catalog (rhinoautoglass.mx) reads these with the
--                anon key and no session, so anon SELECT must stay open.
--   NO ANON WRITES anywhere below.
--   PRIVATE      product_stock, tasks — authenticated only. rhino-stock gates
--                every route behind supabase.auth.getUser(); rhino-plan is not
--                in production.
--
-- Unaffected: service_role (rhino-catalog's createAdminClient) bypasses RLS;
-- SECURITY DEFINER functions/triggers (set_product_brands, the catalog-sync
-- triggers on product_codes) run as the table owner.

-- --------------------------------------------
-- 1. product_codes: drop the anonymous write policies
-- --------------------------------------------
-- Kept: "Allow public read access" (public catalog), and the existing
-- authenticated policies — admins (hierarchy >= 80) insert/update/delete,
-- QA-level (50-79) update, which the verified-only trigger narrows further.
DROP POLICY IF EXISTS "Allow public insert" ON public.product_codes;
DROP POLICY IF EXISTS "Allow public update" ON public.product_codes;
DROP POLICY IF EXISTS "Allow public delete" ON public.product_codes;

-- Editors (hierarchy 60) created rows only through "Allow public insert".
-- Keep that working: app/api/products POST allows super_admin, admin, editor.
DROP POLICY IF EXISTS "Editors can create product codes" ON public.product_codes;
CREATE POLICY "Editors can create product codes"
ON public.product_codes FOR INSERT TO authenticated
WITH CHECK ((SELECT public.current_user_hierarchy_level()) >= 60);

-- --------------------------------------------
-- 2. brands, product_brands: public read, no API writes
-- --------------------------------------------
ALTER TABLE public.brands         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_brands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Catalog is publicly readable" ON public.brands;
CREATE POLICY "Catalog is publicly readable"
ON public.brands FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Catalog is publicly readable" ON public.product_brands;
CREATE POLICY "Catalog is publicly readable"
ON public.product_brands FOR SELECT TO anon, authenticated USING (true);

-- --------------------------------------------
-- 3. product_stock, tasks: authenticated only
-- --------------------------------------------
ALTER TABLE public.product_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks         ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous read"   ON public.tasks;
DROP POLICY IF EXISTS "Allow anonymous insert" ON public.tasks;
DROP POLICY IF EXISTS "Allow anonymous update" ON public.tasks;
DROP POLICY IF EXISTS "Allow anonymous delete" ON public.tasks;

-- Refuse anon at the privilege layer too, so a future policy written without
-- a TO clause cannot reopen these tables by accident.
REVOKE ALL ON public.product_stock FROM anon;
REVOKE ALL ON public.tasks         FROM anon;

DROP POLICY IF EXISTS "Authenticated users can access stock" ON public.product_stock;
CREATE POLICY "Authenticated users can access stock"
ON public.product_stock FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can access tasks" ON public.tasks;
CREATE POLICY "Authenticated users can access tasks"
ON public.tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
