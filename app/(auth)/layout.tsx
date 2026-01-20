export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Rhino Code Generator
          </h1>
          <p className="text-sm text-slate-600">
            Automotive Glass Production Catalog
          </p>
        </div>

        <div className="card p-8">{children}</div>
      </div>
    </div>
  )
}
