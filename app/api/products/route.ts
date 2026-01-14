import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const supabase = await createClient();

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
