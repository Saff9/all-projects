import { useState, useCallback, useEffect } from 'react'
import { Link, ChevronDown, KeyRound } from 'lucide-react'
import type { AppConfig, ProcessRequest } from './types'
import { SegmentedControl } from './SegmentedControl'

interface InputAreaProps {
  config: AppConfig | null
  apiKey: string
  onApiKeyChange: (key: string) => void
  onSubmit: (req: ProcessRequest) => void
  disabled: boolean
}

const platformOptions = [
  { label: 'General', value: 'general' },
  { label: 'TikTok', value: 'tiktok' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'YouTube', value: 'youtube' },
  { label: 'X', value: 'twitter' },
]

const maxClipsOptions = [
  { label: '3', value: 3 },
  { label: '5', value: 5 },
  { label: '8', value: 8 },
  { label: '10', value: 10 },
]

const ratioDisplay: Record<string, string> = {
  '16:9': 'w-6 h-3.5 rounded-sm border border-current',
  '9:16': 'w-3.5 h-6 rounded-sm border border-current',
  '1:1': 'w-5 h-5 rounded-sm border border-current',
  '4:5': 'w-4 h-5 rounded-sm border border-current',
}

export function InputArea({ config, apiKey, onApiKeyChange, onSubmit, disabled }: InputAreaProps) {
  const [url, setUrl] = useState('')
  const [platform, setPlatform] = useState('general')
  const [maxClips, setMaxClips] = useState(5)
  const [llmModel, setLlmModel] = useState('')
  const [whisperModel, setWhisperModel] = useState('')
  const [videoRatio, setVideoRatio] = useState('16:9')
  const [captionStyle, setCaptionStyle] = useState('bold')
  const [showConfig, setShowConfig] = useState(false)

  useEffect(() => {
    if (config) {
      if (config.llm_models?.length && !llmModel) setLlmModel(config.llm_models[0])
      if (config.whisper_models?.length && !whisperModel) setWhisperModel(config.whisper_models[0])
      if (config.default_platform) setPlatform(config.default_platform)
      if (config.video_ratio) setVideoRatio(config.video_ratio)
      if (config.caption_style) setCaptionStyle(config.caption_style)
    }
  }, [config])

  const handleSubmit = useCallback(() => {
    if (!url.trim()) return
    onSubmit({
      url: url.trim(),
      api_key: apiKey,
      platform,
      max_clips: maxClips,
      llm_model: llmModel,
      whisper_model: whisperModel,
      video_ratio: videoRatio,
      caption_style: captionStyle,
    })
  }, [url, apiKey, platform, maxClips, llmModel, whisperModel, videoRatio, captionStyle, onSubmit])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && !disabled && url.trim()) {
        e.preventDefault()
        handleSubmit()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleSubmit, disabled, url])

  const captionStyles = ['bold', 'modern', 'neon', 'classic']

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">
          Turn long videos into viral clips
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Paste any video URL and let AI find the most engaging moments
        </p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
            <Link className="h-4 w-4 text-slate-500" />
          </div>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a YouTube, TikTok, or any video URL..."
            disabled={disabled}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-3.5 pl-11 pr-4 text-sm text-slate-100 placeholder-slate-600 transition-colors focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/25 disabled:opacity-50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl
            options={platformOptions}
            value={platform}
            onChange={setPlatform}
          />
          <div className="flex items-center gap-1.5">
            {maxClipsOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setMaxClips(opt.value)}
                disabled={disabled}
                className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-medium transition-all ${
                  maxClips === opt.value
                    ? 'border-slate-700 bg-slate-800 text-slate-100'
                    : 'border-slate-800/50 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                } disabled:opacity-50`}
              >
                {opt.label}
              </button>
            ))}
            <span className="ml-1 text-xs text-slate-600">clips</span>
          </div>
          {config?.llm_models && config.llm_models.length > 0 && (
            <select
              value={llmModel}
              onChange={(e) => setLlmModel(e.target.value)}
              disabled={disabled}
              className="rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-1.5 text-xs text-slate-300 transition-colors focus:border-violet-500/50 disabled:opacity-50"
            >
              {config.llm_models.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600">Ratio</span>
            <div className="flex gap-1">
              {(config?.video_ratios || ['16:9', '9:16', '1:1', '4:5']).map((r) => (
                <button
                  key={r}
                  onClick={() => setVideoRatio(r)}
                  disabled={disabled}
                  title={r}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs transition-all ${
                    videoRatio === r
                      ? 'border-slate-700 bg-slate-800 text-slate-200'
                      : 'border-slate-800/50 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                  } disabled:opacity-50`}
                >
                  <div className={ratioDisplay[r] || 'h-4 w-4 border border-current rounded-sm'} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600">Caption</span>
            <div className="flex gap-1">
              {(config?.caption_styles || captionStyles).map((s) => (
                <button
                  key={s}
                  onClick={() => setCaptionStyle(s)}
                  disabled={disabled}
                  className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium capitalize transition-all ${
                    captionStyle === s
                      ? 'border-slate-700 bg-slate-800 text-slate-200'
                      : 'border-slate-800/50 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                  } disabled:opacity-50`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-1.5 text-xs text-slate-600 transition-colors hover:text-slate-400"
          >
            <KeyRound className="h-3 w-3" />
            Configuration
            <ChevronDown className={`h-3 w-3 transition-transform ${showConfig ? 'rotate-180' : ''}`} />
          </button>
          {showConfig && (
            <div className="mt-3 space-y-3 rounded-lg border border-slate-800/50 bg-slate-900/30 p-3">
              <div>
                <label className="mb-1 block text-xs text-slate-500">
                  Groq API Key{' '}
                  <a
                    href="https://console.groq.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-400 hover:text-violet-300"
                  >
                    console.groq.com
                  </a>
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => onApiKeyChange(e.target.value)}
                  placeholder="gsk_..."
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/25"
                />
              </div>
              {config?.whisper_models && config.whisper_models.length > 0 && (
                <div>
                  <label className="mb-1 block text-xs text-slate-500">Whisper Model</label>
                  <select
                    value={whisperModel}
                    onChange={(e) => setWhisperModel(e.target.value)}
                    disabled={disabled}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs text-slate-300 focus:border-violet-500/50 disabled:opacity-50"
                  >
                    {config.whisper_models.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={disabled || !url.trim()}
          className="w-full rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white transition-all hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Generate Clips
        </button>
      </div>
    </div>
  )
}
