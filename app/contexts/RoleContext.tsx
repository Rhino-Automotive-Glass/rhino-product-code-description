'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/app/lib/supabase/client';
import { UserRole, RolePermissions } from '@/app/lib/rbac/types';
import { getPermissions } from '@/app/lib/rbac/permissions';

interface RoleContextType {
  user: User | null;
  role: UserRole | null;
  permissions: RolePermissions | null;
  isLoading: boolean;
  error: string | null;
  refreshRole: () => Promise<void>;
}

type RoleRelation = {
  name?: string
} | null

const RoleContext = createContext<RoleContextType>({
  user: null,
  role: null,
  permissions: null,
  isLoading: true,
  error: null,
  refreshRole: async () => {},
});

export function RoleProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [permissions, setPermissions] = useState<RolePermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchUserRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role_id, roles(name)')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return 'viewer' as UserRole;
      }

      throw new Error(error.message);
    }

    if (!data || !data.roles) {
      return 'viewer' as UserRole;
    }

    const roleRelation = data.roles as RoleRelation | RoleRelation[];
    const roleName = Array.isArray(roleRelation)
      ? roleRelation[0]?.name
      : roleRelation?.name;

    return (roleName ?? 'viewer') as UserRole;
  };

  const refreshRole = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(userError.message);
      }

      if (currentUser) {
        setUser(currentUser);
        const userRole = await fetchUserRole(currentUser.id);
        setRole(userRole);
        setPermissions(getPermissions(userRole));
      } else {
        setUser(null);
        setRole(null);
        setPermissions(null);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown role error';
      setError(`Unable to load your account permissions. ${message}`);
      setUser(null);
      setRole(null);
      setPermissions(null);
      console.error('Error fetching role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshRole();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        refreshRole();
      } else {
        setUser(null);
        setRole(null);
        setPermissions(null);
        setError(null);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <RoleContext.Provider
      value={{ user, role, permissions, isLoading, error, refreshRole }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
