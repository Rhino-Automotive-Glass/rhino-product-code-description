'use client';

import { useState, useEffect } from 'react';
import { UserRole } from '../lib/rbac/types';

interface UserWithRole {
  id: string;
  email: string;
  role: UserRole;
  role_display_name: string;
  assigned_at: string;
}

interface RoleOption {
  id: string;
  name: string;
  display_name: string;
}

const ROLE_BADGE_COLORS: Record<string, string> = {
  super_admin: 'bg-red-100 text-red-800',
  admin: 'bg-purple-100 text-purple-800',
  editor: 'bg-green-100 text-green-800',
  quality_assurance: 'bg-blue-100 text-blue-800',
  approver: 'bg-yellow-100 text-yellow-800',
  viewer: 'bg-gray-100 text-gray-800',
};

export default function AdminPanel() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const loadRoles = async () => {
    try {
      const { createClient } = await import('../lib/supabase/client');
      const supabase = createClient();
      const { data, error } = await supabase
        .from('roles')
        .select('id, name, display_name')
        .order('hierarchy_level', { ascending: false });

      if (!error && data) {
        setRoles(data);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      const result = await response.json();

      if (response.ok && result.data) {
        setUsers(result.data);
      } else {
        console.error('Error loading users:', result.error);
        alert('Error al cargar usuarios');
      }
    } catch (error) {
      console.error('Unexpected error loading users:', error);
      alert('Error inesperado al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, roleId: string) => {
    setUpdatingUserId(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role_id: roleId }),
      });

      if (response.ok) {
        await loadUsers();
        alert('Rol actualizado exitosamente');
      } else {
        const errorData = await response.json();
        console.error('Error updating role:', errorData);
        alert('Error al actualizar el rol');
      }
    } catch (error) {
      console.error('Unexpected error updating role:', error);
      alert('Error inesperado al actualizar el rol');
    } finally {
      setUpdatingUserId(null);
    }
  };

  useEffect(() => {
    loadRoles();
    loadUsers();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-slate-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Gestión de Usuarios</h2>
        <button
          onClick={loadUsers}
          className="btn btn-secondary btn-sm flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          <span>Actualizar</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol Actual
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Asignado
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cambiar Rol
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No hay usuarios disponibles
                </td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{user.email}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      ROLE_BADGE_COLORS[user.role] || 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role_display_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.assigned_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={roles.find(r => r.name === user.role)?.id || ''}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={updatingUserId === user.id}
                      className={`text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                        updatingUserId === user.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>
                          {role.display_name}
                        </option>
                      ))}
                    </select>
                    {updatingUserId === user.id && (
                      <span className="ml-2 inline-block">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        <p>Total de usuarios: {users.length}</p>
      </div>
    </div>
  );
}
