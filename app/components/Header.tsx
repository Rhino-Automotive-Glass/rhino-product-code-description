'use client';

import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { useRole } from '../contexts/RoleContext'

interface HeaderProps {
  user?: User
  onSignOut?: () => Promise<void>
}

export default function Header({ user, onSignOut }: HeaderProps) {
  const { role, permissions } = useRole();
  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-slate-900">
                Rhino Code Generator
              </h1>
              <p className="text-sm text-slate-600">
                Automotive Glass Production Catalog
              </p>
            </div>

            {user && (
              <nav className="hidden md:flex items-center gap-4">
                <Link href="/" className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">
                  Dashboard
                </Link>
                {permissions?.canManageUsers && (
                  <Link href="/admin" className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">
                    Admin Panel
                  </Link>
                )}
              </nav>
            )}
          </div>

          {user && onSignOut && (
            <div className="flex items-center gap-4">
              {role && (
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 uppercase">
                  {role === 'qa' ? 'QA' : role}
                </span>
              )}
              <div className="text-right hidden sm:block">
                <p className="text-sm text-slate-600">Signed in as</p>
                <p className="text-sm font-medium text-slate-900">{user.email}</p>
              </div>
              <button
                onClick={() => onSignOut()}
                className="btn btn-ghost btn-sm gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
