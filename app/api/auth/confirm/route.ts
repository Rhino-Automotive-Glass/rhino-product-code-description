import type { EmailOtpType } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'

/**
 * GET /api/auth/confirm?token_hash=…&type=…[&next=/path]
 *
 * Target of the links in Supabase Auth emails (Confirm signup, Magic link,
 * Invite, …) once their templates point here:
 *   {{ .SiteURL }}/api/auth/confirm?token_hash={{ .TokenHash }}&type=email
 *
 * Verifies the one-time token server-side and signs the user in. Unlike
 * /api/auth/callback (PKCE `?code=`), this needs nothing stored in the
 * browser that started the flow, so the link works when opened on another
 * device — e.g. sign up on a computer, confirm from a phone.
 *
 * Public route: the person clicking the link is not signed in yet (see
 * PUBLIC_API_ROUTES in proxy.ts).
 */

const EMAIL_OTP_TYPES: readonly EmailOtpType[] = [
  'signup',
  'invite',
  'magiclink',
  'recovery',
  'email_change',
  'email',
]

function redirectToLogin(request: Request, message: string) {
  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('error', message)
  return NextResponse.redirect(loginUrl)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') || '/'
  // Same-site paths only: never redirect to another host.
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/'

  if (!tokenHash || !type || !EMAIL_OTP_TYPES.includes(type as EmailOtpType)) {
    return redirectToLogin(request, 'This confirmation link is incomplete. Please use the latest link from your email.')
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: type as EmailOtpType,
  })

  if (error) {
    return redirectToLogin(
      request,
      `This confirmation link is invalid or has expired. ${error.message}`,
    )
  }

  return NextResponse.redirect(new URL(safeNext, request.url))
}
