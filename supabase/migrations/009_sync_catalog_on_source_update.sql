-- ============================================
-- Propagate product_codes UPDATEs into the catalog (public.products)
-- ============================================
-- product_codes is the origin table. The AFTER UPDATE trigger
-- touch_catalog_on_source_change() previously only bumped products.updated_at
-- and ignored compatibility_data entirely, so edits to marca / modelo /
-- subModelo never reached the catalog row -- products.model, products."subModel",
-- primary_brand_id and product_brands all went stale.
--
-- This migration:
--   1. Rewrites touch_catalog_on_source_change() to re-sync model, subModel,
--      primary_brand_id and product_brands membership whenever compatibility_data
--      changes (same brand-upsert logic as create_catalog_entry()).
--   2. Patches prevent_source_managed_product_field_updates() (owned by the
--      rhino-catalog app, migration 202603170003) to honour a transaction-local
--      bypass flag set by the source-sync trigger. The guard still blocks the
--      catalog app itself from mutating source-managed fields.
--
-- NOTE: the change to prevent_source_managed_product_field_updates() must be
-- reflected back into the rhino-catalog repo (202603170003_*) to keep that
-- repo's migrations authoritative.

-- --------------------------------------------
-- 1. Catalog guard: allow the source-sync bypass flag
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_source_managed_product_field_updates()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  jwt_role text := coalesce(current_setting('request.jwt.claim.role', true), '');
BEGIN
  -- Allow service-level sync paths (App A or backend jobs) to keep mirroring data.
  IF jwt_role IN ('service_role', 'supabase_admin') THEN
    RETURN new;
  END IF;

  -- Allow updates originating from the product_codes source-sync trigger.
  -- The flag is set transaction-locally by touch_catalog_on_source_change().
  IF coalesce(current_setting('app.product_codes_sync', true), '') = 'on' THEN
    RETURN new;
  END IF;

  IF new.primary_brand_id IS DISTINCT FROM old.primary_brand_id
     OR new.model IS DISTINCT FROM old.model
     OR new."subModel" IS DISTINCT FROM old."subModel" THEN
    RAISE EXCEPTION 'Source-managed fields (primary_brand_id, model, subModel) are read-only in Rhino Catalog';
  END IF;

  RETURN new;
END;
$function$;

-- --------------------------------------------
-- 2. Source-sync trigger function
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.touch_catalog_on_source_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_product_id uuid;
  v_primary_brand_id uuid;
  v_marca_count int;
BEGIN
  SELECT id INTO v_product_id
  FROM public.products
  WHERE product_code_id = NEW.id;

  -- No mirrored catalog row (e.g. product_code created before sync existed).
  IF v_product_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.compatibility_data IS DISTINCT FROM OLD.compatibility_data THEN
    -- Signal the catalog-side guard that this update originates from the
    -- source app, so source-managed fields may legitimately change.
    PERFORM set_config('app.product_codes_sync', 'on', true);

    -- Ensure a brands row exists for every marca in the new payload.
    INSERT INTO public.brands (name)
    SELECT DISTINCT ON (public.normalize_brand_name(item->>'marca')) item->>'marca'
    FROM jsonb_array_elements(COALESCE(NEW.compatibility_data->'items', '[]'::jsonb)) AS item
    WHERE public.normalize_brand_name(item->>'marca') IS NOT NULL
    ON CONFLICT (public.normalize_brand_name(name)) DO NOTHING;

    SELECT count(*) INTO v_marca_count
    FROM jsonb_array_elements(COALESCE(NEW.compatibility_data->'items', '[]'::jsonb)) AS item
    WHERE public.normalize_brand_name(item->>'marca') IS NOT NULL;

    -- Primary brand = first marca in payload order.
    SELECT b.id
    INTO v_primary_brand_id
    FROM jsonb_array_elements(COALESCE(NEW.compatibility_data->'items', '[]'::jsonb))
         WITH ORDINALITY AS t(item, ord)
    JOIN public.brands b
      ON public.normalize_brand_name(b.name) = public.normalize_brand_name(t.item->>'marca')
    WHERE public.normalize_brand_name(t.item->>'marca') IS NOT NULL
    ORDER BY t.ord
    LIMIT 1;

    -- Add memberships for the new marca set first. The composite FK
    -- products_primary_brand_membership_fkey is DEFERRABLE INITIALLY DEFERRED,
    -- so the products update below is satisfied at commit time.
    INSERT INTO public.product_brands (product_id, brand_id)
    SELECT DISTINCT v_product_id, b.id
    FROM jsonb_array_elements(COALESCE(NEW.compatibility_data->'items', '[]'::jsonb)) AS item
    JOIN public.brands b
      ON public.normalize_brand_name(b.name) = public.normalize_brand_name(item->>'marca')
    WHERE public.normalize_brand_name(item->>'marca') IS NOT NULL
    ON CONFLICT DO NOTHING;

    IF v_marca_count > 0 THEN
      -- Full resync: model, subModel and primary brand follow the source.
      UPDATE public.products
      SET model            = NEW.compatibility_data->'items'->0->>'modelo',
          "subModel"       = NEW.compatibility_data->'items'->0->>'subModelo',
          primary_brand_id = v_primary_brand_id,
          updated_at       = now()
      WHERE id = v_product_id;

      -- Drop memberships no longer present in the payload.
      DELETE FROM public.product_brands pb
      WHERE pb.product_id = v_product_id
        AND pb.brand_id NOT IN (
          SELECT b.id
          FROM jsonb_array_elements(COALESCE(NEW.compatibility_data->'items', '[]'::jsonb)) AS item
          JOIN public.brands b
            ON public.normalize_brand_name(b.name) = public.normalize_brand_name(item->>'marca')
          WHERE public.normalize_brand_name(item->>'marca') IS NOT NULL
        );
    ELSE
      -- Payload has no marca: update model/subModel only. primary_brand_id and
      -- existing memberships are left intact so a published catalog row is not
      -- broken (products_published_requires_primary_brand).
      UPDATE public.products
      SET model      = NEW.compatibility_data->'items'->0->>'modelo',
          "subModel" = NEW.compatibility_data->'items'->0->>'subModelo',
          updated_at = now()
      WHERE id = v_product_id;
    END IF;

  ELSIF NEW.product_code_data IS DISTINCT FROM OLD.product_code_data
     OR NEW.description_data IS DISTINCT FROM OLD.description_data THEN
    -- Non-compatibility source change: just bump the catalog timestamp.
    UPDATE public.products
    SET updated_at = now()
    WHERE id = v_product_id;
  END IF;

  RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION public.touch_catalog_on_source_change() IS
  'AFTER UPDATE trigger on product_codes: re-syncs model, subModel, primary_brand_id and product_brands into public.products when compatibility_data changes; bumps updated_at on any source change.';

-- Recreate the trigger so this migration is self-contained and reproducible.
DROP TRIGGER IF EXISTS trg_product_codes_after_update ON public.product_codes;

CREATE TRIGGER trg_product_codes_after_update
  AFTER UPDATE ON public.product_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_catalog_on_source_change();
