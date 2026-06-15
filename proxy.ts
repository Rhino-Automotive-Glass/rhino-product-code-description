import { redirectWithSessionCookies, updateSession } from '@/app/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'

const AUTH_PAGES = new Set(['/login', '/signup'])
const PUBLIC_API_ROUTES = new Set(['/api/auth/callback'])

const apiCorsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function unauthorizedApiResponseWithSessionCookies(supabaseResponse: NextResponse) {
  const response = NextResponse.json(
    { error: 'Unauthorized' },
    {
      status: 401,
      headers: apiCorsHeaders,
    }
  )

  supabaseResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie)
  })

  return response
}

export default async function proxy(request: NextRequest) {
  const { response: supabaseResponse, user: sessionUser } = await updateSession(request)

  const { pathname } = request.nextUrl
  let user: User | null = sessionUser
  const isApiRoute = pathname.startsWith('/api/')
  const isAuthPage = AUTH_PAGES.has(pathname)
  const isPublicApiRoute = PUBLIC_API_ROUTES.has(pathname)

  if (isApiRoute && request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: apiCorsHeaders,
    })
  }

  if (isPublicApiRoute) {
    return supabaseResponse
  }

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
  if (isApiRoute) {
    if (user) {
      return supabaseResponse
    }

    return unauthorizedApiResponseWithSessionCookies(supabaseResponse)
  }

  // Redirect authenticated users away from auth pages
  if (user && isAuthPage) {
    return redirectWithSessionCookies(request, supabaseResponse, '/')
  }

  // Redirect unauthenticated users to login (except for auth pages)
  if (!user && !isAuthPage) {
    return redirectWithSessionCookies(request, supabaseResponse, '/login')
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
