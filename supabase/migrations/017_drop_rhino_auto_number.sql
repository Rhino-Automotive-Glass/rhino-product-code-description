-- ============================================
-- Remove the abandoned Rhino auto-number feature
-- ============================================
-- Checked against the LIVE database (2026-09-19) before writing.
--
-- History:
--   2026-01-16  added (8f39f1b): counters table + 3 functions (migration 001),
--               /api/counters/rhino-next and /rhino-preview, auto-filled
--               Número when clasificación R was selected.
--   2026-01-19  RLS on counters (002); the same afternoon the feature was
--               removed from the UI (fa88740). Número is entered by hand.
--   later       the counters table was dropped by hand (not recorded in any
--               migration; supabase/Rhino_number.md carried DROP snippets).
--               DROP TABLE ... CASCADE does not remove functions whose bodies
--               merely mention a table, so these three were left behind and
--               have failed with 42P01 ever since.
--
-- Nothing depends on them: no policy, default, view or other function, and
-- no rhino-* repo calls them (the two API routes are removed in the same PR).
-- Migrations 001/002 stay as history.

DROP FUNCTION IF EXISTS public.get_next_rhino_number();
DROP FUNCTION IF EXISTS public.get_current_rhino_number();
DROP FUNCTION IF EXISTS public.reset_rhino_counter(integer);
