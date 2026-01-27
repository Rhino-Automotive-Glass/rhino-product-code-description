import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required. Use ?q=<search_term>' },
        { status: 400, headers: corsHeaders }
      );
    }

    const supabase = await createClient();

    const searchPattern = `${query.trim()}%`;

    const { data, error } = await supabase
      .from('product_codes')
      .select('id, product_code_data, description_data, verified')
      .eq('status', 'active')
      .ilike('product_code_data->>generated', searchPattern)
      .order('product_code_data->>generated', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to search products' },
        { status: 500, headers: corsHeaders }
      );
    }

    const results = data.map((item) => ({
      id: item.id,
      code: (item.product_code_data as any)?.generated || '',
      description: (item.description_data as any)?.generated || '',
      verified: item.verified ?? false,
    }));

    return NextResponse.json(
      {
        results,
        count: results.length,
        query: query.trim(),
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
