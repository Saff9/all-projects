import { useState } from 'react'
import { Clock, Play, Download, Copy, Check, Hash, MessageSquare, FileText, Video, X } from 'lucide-react'
import type { ProcessComplete, Clip } from './types'
import { useCopy } from './useCopy'

interface ResultsProps {
  data: ProcessComplete
  onReset: () => void
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatTime(seconds: number): string {
  return formatDuration(seconds)
}

function scoreColor(score: number): string {
  if (score > 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
  if (score > 60) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
  if (score > 40) return 'text-orange-400 bg-orange-500/10 border-orange-500/20'
  return 'text-red-400 bg-red-500/10 border-red-500/20'
}

function CopyButton({ text, id, copiedId, copy }: { text: string; id: string; copiedId: string | null; copy: (t: string, id: string) => void }) {
  const copied = copiedId === id
  return (
    <button
      onClick={() => copy(text, id)}
      className={`flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition-all ${
        copied
          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
          : 'border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
      }`}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function ClipsTab({ clips, copy, copiedId }: { clips: Clip[]; copy: (t: string, id: string) => void; copiedId: string | null }) {
  if (clips.length === 0) {
    return <div className="py-12 text-center text-sm text-slate-600">No clips found</div>
  }
  return (
    <div className="space-y-3">
      {clips.map((clip, i) => (
        <div key={clip.id || i} className="flex gap-4 rounded-xl border border-slate-800/50 bg-slate-900/30 p-4 transition-colors hover:border-slate-800">
          <div className="relative flex h-24 w-36 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-slate-800 to-slate-900">
            <Play className="h-8 w-8 text-slate-600" />
            <div className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-slate-300">
              {formatDuration(clip.end_time - clip.start_time)}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-start justify-between gap-2">
              <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${scoreColor(clip.virality_score)}`}>
                {clip.virality_score}
              </span>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Clock className="h-3 w-3" />
                {formatTime(clip.start_time)} — {formatTime(clip.end_time)}
              </div>
            </div>
            <h4 className="mb-1 truncate text-sm font-semibold text-slate-100">{clip.title}</h4>
            <p className="mb-2 line-clamp-2 text-xs text-slate-500">{clip.hook}</p>
            {clip.platform_hint && (
              <span className="mb-2 inline-block rounded border border-slate-800 px-1.5 py-0.5 text-[10px] text-slate-500 capitalize">
                {clip.platform_hint}
              </span>
            )}
            {clip.reason && (
              <p className="mb-2 text-[11px] text-slate-600 line-clamp-1">{clip.reason}</p>
            )}
            <div className="flex items-center gap-2">
              {clip.download_url && (
                <a
                  href={clip.download_url}
                  download
                  className="flex items-center gap-1 rounded-md border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-400 transition-colors hover:bg-violet-500/20"
                >
                  <Download className="h-3 w-3" />
                  Download
                </a>
              )}
              <CopyButton text={clip.title} id={`title-${i}`} copiedId={copiedId} copy={copy} />
              <CopyButton text={clip.hook} id={`hook-${i}`} copiedId={copiedId} copy={copy} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function CaptionsTab({ captions, copy, copiedId }: { captions: Record<string, string>; copy: (t: string, id: string) => void; copiedId: string | null }) {
  const platforms = Object.keys(captions)
  const [activeTab, setActiveTab] = useState(platforms[0] || '')

  if (platforms.length === 0) {
    return <div className="py-12 text-center text-sm text-slate-600">No captions generated</div>
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-1 border-b border-slate-800/50">
        {platforms.map((p) => (
          <button
            key={p}
            onClick={() => setActiveTab(p)}
            className={`border-b-2 px-3 py-2 text-xs font-medium capitalize transition-colors ${
              activeTab === p
                ? 'border-violet-500 text-violet-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {p}
          </button>
        ))}
      </div>
      {activeTab && captions[activeTab] && (
        <div className="relative rounded-lg border border-slate-800/50 bg-slate-900/30 p-4">
          <div className="mb-3 flex justify-end">
            <CopyButton text={captions[activeTab]} id={`caption-${activeTab}`} copiedId={copiedId} copy={copy} />
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{captions[activeTab]}</p>
        </div>
      )}
    </div>
  )
}

function TagsTab({ tags, description, copy, copiedId }: { tags: string[]; description: string; copy: (t: string, id: string) => void; copiedId: string | null }) {
  if (tags.length === 0) {
    return <div className="py-12 text-center text-sm text-slate-600">No tags generated</div>
  }
  const allTags = tags.map((t) => `#${t}`).join(' ')
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tags.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-1 rounded-md border border-slate-800/50 bg-slate-900/50 px-2.5 py-1 text-xs text-slate-300">
            <Hash className="h-3 w-3 text-slate-500" />
            {t}
          </span>
        ))}
      </div>
      {description && (
        <div className="rounded-lg border border-slate-800/50 bg-slate-900/30 p-4">
          <p className="text-sm leading-relaxed text-slate-400">{description}</p>
        </div>
      )}
      <CopyButton text={allTags} id="all-tags" copiedId={copiedId} copy={copy} />
    </div>
  )
}

function TranscriptTab({ transcript, copy, copiedId }: { transcript: string; copy: (t: string, id: string) => void; copiedId: string | null }) {
  if (!transcript) {
    return <div className="py-12 text-center text-sm text-slate-600">No transcript available</div>
  }
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <CopyButton text={transcript} id="transcript" copiedId={copiedId} copy={copy} />
      </div>
      <div className="max-h-96 overflow-auto rounded-lg border border-slate-800/50 bg-slate-900/30 p-4">
        <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-slate-400">{transcript}</pre>
      </div>
    </div>
  )
}

const tabs = [
  { id: 'clips', label: 'Clips', icon: Video },
  { id: 'captions', label: 'Captions', icon: MessageSquare },
  { id: 'tags', label: 'Tags', icon: Hash },
  { id: 'transcript', label: 'Transcript', icon: FileText },
]

export function Results({ data, onReset }: ResultsProps) {
  const [activeTab, setActiveTab] = useState('clips')
  const { copiedId, copy } = useCopy()

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-100">{data.title || 'Video Results'}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {data.platform && (
              <span className="rounded-md border border-slate-800 bg-slate-900/50 px-2 py-0.5 text-[11px] font-medium text-slate-400 capitalize">
                {data.platform}
              </span>
            )}
            {data.duration && (
              <span className="flex items-center gap-1 text-[11px] text-slate-500">
                <Clock className="h-3 w-3" />
                {data.duration}
              </span>
            )}
            {data.model_used && (
              <span className="rounded-md border border-slate-800 bg-slate-900/50 px-2 py-0.5 text-[11px] text-slate-500">
                {data.model_used}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 rounded-lg border border-slate-800 px-3 py-1.5 text-xs text-slate-400 transition-colors hover:border-slate-700 hover:text-slate-200"
        >
          <X className="h-3.5 w-3.5" />
          New
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <StatPill label="Clips" value={data.clips_count || data.clips?.length || 0} />
        <StatPill label="Top Score" value={data.clips?.length ? Math.max(...data.clips.map(c => c.virality_score)) : '-'} />
        <StatPill label="Captions" value={Object.keys(data.captions || {}).length} />
        <StatPill label="Tags" value={data.tags?.length || 0} />
      </div>

      <div className="flex gap-1 border-b border-slate-800/50">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-medium transition-colors ${
              activeTab === id
                ? 'border-violet-500 text-violet-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="py-4">
        {activeTab === 'clips' && <ClipsTab clips={data.clips || []} copy={copy} copiedId={copiedId} />}
        {activeTab === 'captions' && <CaptionsTab captions={data.captions || {}} copy={copy} copiedId={copiedId} />}
        {activeTab === 'tags' && <TagsTab tags={data.tags || []} description={data.description || ''} copy={copy} copiedId={copiedId} />}
        {activeTab === 'transcript' && <TranscriptTab transcript={data.transcript || ''} copy={copy} copiedId={copiedId} />}
      </div>
    </div>
  )
}

function StatPill({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-slate-800/50 bg-slate-900/50 px-2.5 py-1.5 text-xs">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-200">{value}</span>
    </div>
  )
}
