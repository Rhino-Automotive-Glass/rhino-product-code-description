import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { requireRole } from '@/app/lib/rbac/apiMiddleware';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Allow admin-level and QA-level roles, but with different permissions
  const authResult = await requireRole(request, ['super_admin', 'admin', 'editor', 'quality_assurance', 'approver']);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const { supabase, role } = authResult;

    const updateData: Record<string, unknown> = {};

    // QA/approver users can ONLY update the verified field
    if (role === 'quality_assurance' || role === 'approver') {
      if (Object.keys(body).length !== 1 || body.verified === undefined) {
        return NextResponse.json(
          { error: 'QA users can only toggle verified status' },
          { status: 403 }
        );
      }
      updateData.verified = body.verified;
    } else {
      // Admins can update everything
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
  // Only admins can delete
  const authResult = await requireRole(request, ['super_admin', 'admin']);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get('hard') === 'true';

    const { supabase } = authResult;

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
