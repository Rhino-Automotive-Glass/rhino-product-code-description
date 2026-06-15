'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signUp } from '@/app/lib/auth/actions'
import { AuthErrorMessage } from './AuthErrorMessage'
import Link from 'next/link'

export function SignupForm() {
  const [error, setError] = useState<string>()
  const [success, setSuccess] = useState<string>()
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(undefined)
    setSuccess(undefined)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const result = await signUp(email, password)

      if (result?.error) {
        setError(result.error)
        setLoading(false)
      } else if (result?.success) {
        setSuccess('Account created. Check your email to confirm your account before signing in.')
        setLoading(false)
        router.prefetch('/login')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setError(`Unable to create account. ${message}`)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AuthErrorMessage message={error} />
      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-3 flex items-start gap-2">
          <svg
            className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.45-1.647-1.647a.75.75 0 10-1.06 1.061l2.267 2.267a.75.75 0 001.137-.089l3.753-5.16z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm text-green-800 font-medium">{success}</p>
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="input-base"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          className="input-base"
          placeholder="••••••••"
        />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          className="input-base"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary btn-md w-full"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Creating account...
          </span>
        ) : (
          'Create Account'
        )}
      </button>

      <p className="text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          Sign in
        </Link>
      </p>
    </form>
  )
}
