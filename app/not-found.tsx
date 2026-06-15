import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-50 px-4">
      <div className="card max-w-lg w-full p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          404
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          Page not found
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          This route does not exist or is no longer available.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className="btn btn-primary btn-md">
            Go to dashboard
          </Link>
          <Link href="/login" className="btn btn-secondary btn-md">
            Go to login
          </Link>
        </div>
      </div>
    </main>
  )
}
