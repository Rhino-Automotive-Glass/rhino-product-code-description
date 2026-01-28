import { updateSession } from '@/app/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export default async function proxy(request: NextRequest) {
  // First, refresh the session
  const supabaseResponse = await updateSession(request)

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        },
      },
    }
  )

  const { pathname } = request.nextUrl
  let user = null

  // Check for Bearer token in Authorization header (for cross-origin API calls)
  const authHeader = request.headers.get('Authorization')

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    const { data, error } = await supabase.auth.getUser(token)
    if (!error && data.user) {
      user = data.user
    }
  }

  // If no Bearer token or invalid, try cookie-based session
  if (!user) {
    const { data } = await supabase.auth.getUser()
    user = data.user
  }

  // Allow API routes with valid Bearer token authentication
  if (pathname.startsWith('/api/') && user) {
    return supabaseResponse
  }

  // Redirect authenticated users away from auth pages
  if (user && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Redirect unauthenticated users to login (except for auth pages)
  if (!user && pathname !== '/login' && pathname !== '/signup') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
