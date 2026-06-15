'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRole } from '@/app/contexts/RoleContext';
import AdminPanel from '@/app/components/AdminPanel';

export default function AdminPage() {
  const { role, isLoading, error, refreshRole } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && role !== 'admin' && role !== 'super_admin') {
      router.push('/');
    }
  }, [role, isLoading, router]);

  // Show loading while checking role
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-50">
        <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-700 font-medium">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-50 px-4">
        <div className="card max-w-lg w-full p-6 sm:p-8">
          <h1 className="text-xl font-semibold text-slate-900">
            Unable to load admin panel
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">{error}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={refreshRole} className="btn btn-primary btn-md">
              Try again
            </button>
            <button type="button" onClick={() => router.push('/login')} className="btn btn-secondary btn-md">
              Go to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Don't render anything if not admin (will redirect)
  if (role !== 'admin' && role !== 'super_admin') {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Panel de Administración</h1>
          <p className="text-slate-600 mt-2">Gestiona los roles y permisos de los usuarios</p>
        </div>
        <AdminPanel />
      </div>
    </main>
  );
}
