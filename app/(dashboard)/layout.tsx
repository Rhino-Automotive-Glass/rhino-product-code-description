import { createClient } from '@/app/lib/supabase/server'
import { redirect } from 'next/navigation'
import Header from '@/app/components/Header'
import { signOut } from '@/app/lib/auth/actions'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <>
      <Header user={user} onSignOut={signOut} />
      {children}
    </>
  )
}
