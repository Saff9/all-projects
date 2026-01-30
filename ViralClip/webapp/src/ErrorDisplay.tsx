import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorDisplayProps {
  message: string
  onRetry: () => void
}

export function ErrorDisplay({ message, onRetry }: ErrorDisplayProps) {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center">
        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
          <AlertTriangle className="h-5 w-5 text-red-400" />
        </div>
        <h3 className="mb-2 text-sm font-semibold text-red-300">Something went wrong</h3>
        <p className="mb-4 text-xs text-slate-500">{message}</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/20"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try Again
        </button>
      </div>
    </div>
  )
}
