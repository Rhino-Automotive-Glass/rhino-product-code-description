import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../supabase/server';
import { UserRole } from './types';

export async function requireAuth(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return { user, supabase };
}

export async function requireRole(
  request: NextRequest,
  allowedRoles: UserRole[]
) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult; // Auth failed
  }

  const { user, supabase } = authResult;

  const userRole = await getUserRole(user.id, supabase);
  if (!allowedRoles.includes(userRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return { user, supabase, role: userRole };
}

export async function getUserRole(
  userId: string,
  supabase: any
): Promise<UserRole> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role_id, roles(name)')
    .eq('user_id', userId)
    .single();

  if (error || !data || !data.roles) {
    return 'viewer'; // Default role
  }

  return data.roles.name as UserRole;
}
