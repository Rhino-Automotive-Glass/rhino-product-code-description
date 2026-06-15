'use client'

export type NoticeTone = 'error' | 'success' | 'warning' | 'info'

export type Notice = {
  tone: NoticeTone
  title: string
  message?: string
}

const toneClasses: Record<NoticeTone, string> = {
  error: 'border-red-200 bg-red-50 text-red-800',
  success: 'border-green-200 bg-green-50 text-green-800',
  warning: 'border-orange-200 bg-orange-50 text-orange-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
}

export function NoticeBanner({
  notice,
  onDismiss,
}: {
  notice: Notice
  onDismiss?: () => void
}) {
  return (
    <div className={`rounded-lg border p-4 ${toneClasses[notice.tone]}`} role="status">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">{notice.title}</p>
          {notice.message && (
            <p className="mt-1 whitespace-pre-line text-sm opacity-90">
              {notice.message}
            </p>
          )}
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-md px-2 py-1 text-sm font-semibold opacity-70 hover:opacity-100"
            aria-label="Dismiss message"
          >
            X
          </button>
        )}
      </div>
    </div>
  )
}
