import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/app/lib/rbac/apiMiddleware';
import { createAdminClient } from '@/app/lib/supabase/admin';

export async function GET(request: NextRequest) {
  // Only admins can view all users
  const authResult = await requireRole(request, ['super_admin', 'admin']);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { supabase } = authResult;

    // Use admin client to list users (requires service role key)
    const adminClient = createAdminClient();

    // Get all users from auth
    const { data: userData, error: userError } =
      await adminClient.auth.admin.listUsers();

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 400 });
    }

    // Get their roles with joined role names
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role_id, assigned_at, roles(name, display_name)');

    if (rolesError) {
      return NextResponse.json({ error: rolesError.message }, { status: 400 });
    }

    // Combine the data
    const usersWithRoles = userData.users.map((user) => {
      const roleData = rolesData?.find((r: any) => r.user_id === user.id);
      const roleInfo = roleData?.roles as any;
      return {
        id: user.id,
        email: user.email || '',
        role: roleInfo?.name || 'viewer',
        role_display_name: roleInfo?.display_name || 'Viewer',
        assigned_at: roleData?.assigned_at || user.created_at,
      };
    });

    return NextResponse.json({ data: usersWithRoles });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
