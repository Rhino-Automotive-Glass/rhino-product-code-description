import { createClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/'
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set(
        'error',
        `Unable to confirm your sign-in link. ${error.message}`
      )
      return NextResponse.redirect(loginUrl)
    }
  } else {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('error', 'Missing sign-in confirmation code.')
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.redirect(new URL(safeNext, request.url))
}
