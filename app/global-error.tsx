'use client'

import { ErrorState } from '@/app/components/ErrorState'
import './globals.css'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body>
        <ErrorState
          title="The app could not start"
          message={
            error.message ||
            'A critical error stopped the page from loading.'
          }
          actionLabel="Try again"
          onAction={reset}
          secondaryActionLabel="Reload"
          onSecondaryAction={() => {
            window.location.reload()
          }}
        />
      </body>
    </html>
  )
}
