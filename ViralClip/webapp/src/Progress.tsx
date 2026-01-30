interface ProgressProps {
  message: string
  percent: number
  stage: string
}

export function Progress({ message, percent, stage }: ProgressProps) {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 text-center">
        <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/10">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        </div>
        <h3 className="mb-1 text-sm font-medium text-slate-200">{stage}</h3>
        <p className="mb-4 text-xs text-slate-500">{message}</p>
        <div className="mx-auto max-w-xs">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
            <span>Progress</span>
            <span>{Math.round(percent)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all duration-500 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
