import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { requireRole } from '@/app/lib/rbac/apiMiddleware';

export async function POST(request: NextRequest) {
  // Only admins can create products
  const authResult = await requireRole(request, ['admin']);
  if (authResult instanceof NextResponse) {
    return authResult; // Access denied
  }

  try {
    const body = await request.json();

    const { supabase } = authResult;

    const insertData = {
      product_code_data: body.productCode,
      compatibility_data: body.compatibility,
      description_data: body.description,
      verified: body.verified ?? false,
      status: 'active',
    };

    const { data, error } = await supabase
      .from('product_codes')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
