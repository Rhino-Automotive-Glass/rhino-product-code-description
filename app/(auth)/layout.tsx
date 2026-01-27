import Image from 'next/image'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/parabrisas-medallones-van-camioneta-autobuses.webp"
          alt="Rhino Automotive Glass"
          fill
          className="object-cover object-center"
          priority
          quality={90}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-800/70 to-blue-700/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md p-4">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">
            Rhino Code
          </h1>
          <p className="text-md text-blue-100">
            Automotive Glass Production Code Catalog
          </p>
        </div>

        <div className="card p-8 bg-white/95 backdrop-blur-sm">{children}</div>
      </div>
    </div>
  )
}
