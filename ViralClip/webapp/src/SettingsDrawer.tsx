import { useState, useEffect } from 'react'
import { X, Save, Loader2 } from 'lucide-react'
import type { AppConfig } from './types'
import { submitCookies } from './api'

interface SettingsDrawerProps {
  open: boolean
  onClose: () => void
  config: AppConfig | null
}

export function SettingsDrawer({ open, onClose, config }: SettingsDrawerProps) {
  const [cookies, setCookies] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => {
    if (open) {
      try {
        const stored = localStorage.getItem('viralclip_cookies')
        if (stored) setCookies(stored)
      } catch { /* ok */ }
    }
  }, [open])

  const handleSaveCookies = async () => {
    setSaving(true)
    setSaveMsg('')
    try {
      await submitCookies(cookies)
      localStorage.setItem('viralclip_cookies', cookies)
      setSaveMsg('Cookies saved')
      setTimeout(() => setSaveMsg(''), 2000)
    } catch {
      setSaveMsg('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-slate-800 bg-slate-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <h2 className="text-sm font-semibold text-slate-100">Settings</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">AI Config</h3>
            <div className="space-y-3">
              {config?.whisper_models && config.whisper_models.length > 0 && (
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Whisper Model</label>
                  <select className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-xs text-slate-300 focus:border-violet-500/50">
                    {config.whisper_models.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              )}
              {config?.llm_models && config.llm_models.length > 0 && (
                <div>
                  <label className="mb-1 block text-xs text-slate-400">LLM Model</label>
                  <select className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-xs text-slate-300 focus:border-violet-500/50">
                    {config.llm_models.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Clip Settings</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-slate-400">Min Clip Duration (seconds)</label>
                <input
                  type="number"
                  defaultValue={10}
                  min={5}
                  max={60}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-xs text-slate-300 focus:border-violet-500/50"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">Max Clip Duration (seconds)</label>
                <input
                  type="number"
                  defaultValue={60}
                  min={15}
                  max={180}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-xs text-slate-300 focus:border-violet-500/50"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">CRF (quality)</label>
                <input
                  type="number"
                  defaultValue={23}
                  min={0}
                  max={51}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-xs text-slate-300 focus:border-violet-500/50"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">Preset</label>
                <select defaultValue="medium" className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-xs text-slate-300 focus:border-violet-500/50">
                  <option value="ultrafast">Ultrafast</option>
                  <option value="superfast">Superfast</option>
                  <option value="veryfast">Very Fast</option>
                  <option value="faster">Faster</option>
                  <option value="fast">Fast</option>
                  <option value="medium">Medium</option>
                  <option value="slow">Slow</option>
                  <option value="slower">Slower</option>
                  <option value="veryslow">Very Slow</option>
                </select>
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">YouTube Cookies</h3>
            <p className="mb-2 text-xs text-slate-600">
              Required for private or age-restricted videos. Export cookies from your browser.
            </p>
            <textarea
              value={cookies}
              onChange={(e) => setCookies(e.target.value)}
              placeholder="Paste your YouTube cookies here..."
              rows={6}
              className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 font-mono text-xs text-slate-300 placeholder-slate-700 focus:border-violet-500/50"
            />
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={handleSaveCookies}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-slate-700 hover:text-slate-100 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                Save Cookies
              </button>
              {saveMsg && <span className="text-xs text-emerald-400">{saveMsg}</span>}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">About</h3>
            <div className="space-y-1.5 text-xs text-slate-500">
              <p>ViralClip — AI-powered viral video clip generator</p>
              <p>Uses Whisper for transcription, LLM for analysis, FFmpeg for cutting.</p>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
