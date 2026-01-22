import { LoginForm } from '@/app/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome</h2>
        <p className="text-sm text-slate-600">
          Sign in to access your automotive glass catalog
        </p>
      </div>

      <LoginForm />
    </div>
  )
}
