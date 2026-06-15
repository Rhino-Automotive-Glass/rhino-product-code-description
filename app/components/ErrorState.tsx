'use client'

type ErrorStateProps = {
  title: string
  message: string
  actionLabel?: string
  onAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
}

export function ErrorState({
  title,
  message,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: ErrorStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-50 px-4">
      <div className="card max-w-lg w-full p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
            <svg
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v4a.75.75 0 001.5 0v-4zM10 15a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
            {(actionLabel || secondaryActionLabel) && (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {actionLabel && onAction && (
                  <button
                    type="button"
                    onClick={onAction}
                    className="btn btn-primary btn-md"
                  >
                    {actionLabel}
                  </button>
                )}
                {secondaryActionLabel && onSecondaryAction && (
                  <button
                    type="button"
                    onClick={onSecondaryAction}
                    className="btn btn-secondary btn-md"
                  >
                    {secondaryActionLabel}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
