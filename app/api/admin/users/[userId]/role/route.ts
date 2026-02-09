import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/app/lib/rbac/apiMiddleware';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  // Only admins can assign roles
  const authResult = await requireRole(request, ['super_admin', 'admin']);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { userId } = await params;
    const body = await request.json();
    const { role_id } = body as { role_id: string };

    if (!role_id) {
      return NextResponse.json({ error: 'role_id is required' }, { status: 400 });
    }

    const { supabase, user } = authResult;

    // Validate the role_id exists
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id, name, hierarchy_level')
      .eq('id', role_id)
      .single();

    if (roleError || !roleData) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const { error } = await supabase.from('user_roles').upsert({
      user_id: userId,
      role_id: role_id,
      assigned_by: user.id,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id'
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
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
