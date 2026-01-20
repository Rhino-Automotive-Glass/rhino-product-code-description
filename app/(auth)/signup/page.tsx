import { SignupForm } from '@/app/components/auth/SignupForm'

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Create Account</h2>
        <p className="text-sm text-slate-600">
          Get started with Rhino Code Generator
        </p>
      </div>

      <SignupForm />
    </div>
  )
}
