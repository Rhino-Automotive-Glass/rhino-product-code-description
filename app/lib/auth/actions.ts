'use server'

import { createClient } from '@/app/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signIn(email: string, password: string) {
  const supabase = await createClient()

  let errorMessage: string | null = null

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      errorMessage = error.message
    }
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : 'Unexpected sign-in error'
  }

  if (errorMessage) {
    return { error: errorMessage }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signUp(email: string, password: string) {
  const supabase = await createClient()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  let errorMessage: string | null = null

  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${siteUrl}/api/auth/callback`,
      },
    })

    if (error) {
      errorMessage = error.message
    }
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : 'Unexpected sign-up error'
  }

  if (errorMessage) {
    return { error: errorMessage }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
