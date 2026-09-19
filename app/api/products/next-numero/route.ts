import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/app/lib/rbac/apiMiddleware';

/** Rows fetched per page; PostgREST caps a single response at 1000. */
const PAGE_SIZE = 1000;

/**
 * GET /api/products/next-numero
 *
 * Suggests the Número for a new Rhino (clasificación R) product code: the
 * highest Número already used by an R code, plus one. The Agregar form
 * pre-fills it and the user can change it — several codes legitimately share
 * a Número (one per part of the same family), so this is only a suggestion.
 *
 * Computed from product_codes directly rather than a separate counter, so it
 * cannot drift out of sync with the real data (the old `counters` table did,
 * and was removed in migration 017). Stored values are mixed "00123" / "123",
 * so they are compared as integers.
 *
 * Same roles as creating a product.
 */
export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ['super_admin', 'admin', 'editor']);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { supabase } = authResult;

  try {
    let highest = 0;

    for (let from = 0; ; from += PAGE_SIZE) {
      const { data, error } = await supabase
        .from('product_codes')
        .select('numero:product_code_data->>numero')
        .eq('product_code_data->>clasificacion', 'R')
        .order('id', { ascending: true })
        .range(from, from + PAGE_SIZE - 1);

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      for (const row of data ?? []) {
        const value = parseInt(String(row.numero ?? ''), 10);
        if (!Number.isNaN(value) && value > highest) highest = value;
      }

      if (!data || data.length < PAGE_SIZE) break;
    }

    // Número is at most 5 digits (see CodeGenerator); never suggest beyond it.
    const next = highest + 1;
    if (next > 99999) {
      return NextResponse.json({ numero: null });
    }

    return NextResponse.json({ numero: String(next) });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
