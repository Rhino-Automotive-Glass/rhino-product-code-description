import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const supabase = await createClient();

    const updateData: Record<string, unknown> = {};

    if (body.productCode) {
      updateData.product_code_data = body.productCode;
    }
    if (body.compatibility) {
      updateData.compatibility_data = body.compatibility;
    }
    if (body.description) {
      updateData.description_data = body.description;
    }
    if (body.verified !== undefined) {
      updateData.verified = body.verified;
    }

    const { data, error } = await supabase
      .from('product_codes')
      .update(updateData)
      .eq('id', id)
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get('hard') === 'true';

    const supabase = await createClient();

    if (hardDelete) {
      const { error } = await supabase
        .from('product_codes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    } else {
      const { error } = await supabase
        .from('product_codes')
        .update({ status: 'archived' })
        .eq('id', id);

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
