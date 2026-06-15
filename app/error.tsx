'use client'

import { ErrorState } from '@/app/components/ErrorState'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorState
      title="Something went wrong"
      message={
        error.message ||
        'The app hit an unexpected error while rendering this page.'
      }
      actionLabel="Try again"
      onAction={reset}
      secondaryActionLabel="Go to login"
      onSecondaryAction={() => {
        window.location.href = '/login'
      }}
    />
  )
}
