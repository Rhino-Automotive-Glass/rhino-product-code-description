import { redirectWithSessionCookies, updateSession } from '@/app/lib/supabase/middleware'
import { type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'

export default async function proxy(request: NextRequest) {
  const { response: supabaseResponse, user: sessionUser } = await updateSession(request)

  const { pathname } = request.nextUrl
  let user: User | null = sessionUser

  // Check for Bearer token in Authorization header (for cross-origin API calls)
  const authHeader = request.headers.get('Authorization')

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
    const { data, error } = await supabase.auth.getUser(token)
    if (!error && data.user) {
      user = data.user
    }
  }

  // Allow API routes with valid cookie or Bearer token authentication
  if (pathname.startsWith('/api/') && user) {
    return supabaseResponse
  }

  // Redirect authenticated users away from auth pages
  if (user && (pathname === '/login' || pathname === '/signup')) {
    return redirectWithSessionCookies(request, supabaseResponse, '/')
  }

  // Redirect unauthenticated users to login (except for auth pages)
  if (!user && pathname !== '/login' && pathname !== '/signup') {
    return redirectWithSessionCookies(request, supabaseResponse, '/login')
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
