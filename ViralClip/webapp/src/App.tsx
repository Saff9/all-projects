import { useState, useEffect, useCallback, useRef } from 'react'
import type { AppConfig, ProcessRequest, ProcessComplete, SSEProgress } from './types'
import { fetchConfig, startProcess, connectSSE } from './api'
import { useApiKey } from './useApiKey'
import { Header } from './Header'
import { InputArea } from './InputArea'
import { Progress } from './Progress'
import { Results } from './Results'
import { ErrorDisplay } from './ErrorDisplay'
import { SettingsDrawer } from './SettingsDrawer'

type AppState = 'idle' | 'processing' | 'complete' | 'error'

function App() {
  const [appState, setAppState] = useState<AppState>('idle')
  const [config, setConfig] = useState<AppConfig | null>(null)
  const [configError, setConfigError] = useState<string | null>(null)
  const [results, setResults] = useState<ProcessComplete | null>(null)
  const [progress, setProgress] = useState<SSEProgress>({ label: '', percent: 0, detail: '' })
  const [error, setError] = useState<string>('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [apiKey, setApiKey] = useApiKey()
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    fetchConfig()
      .then(setConfig)
      .catch((e) => setConfigError(e.message || 'Failed to load config'))
  }, [])

  const handleProcess = useCallback(async (req: ProcessRequest) => {
    setAppState('processing')
    setProgress({ label: 'Starting...', percent: 0, detail: 'Initializing' })
    setError('')
    setResults(null)

    try {
      const { request_id } = await startProcess(req)
      const es = connectSSE(
        request_id,
        (data) => setProgress(data),
        (data) => {
          setResults(data)
          setAppState('complete')
        },
        (errMsg) => {
          setError(errMsg)
          setAppState('error')
        },
      )
      esRef.current = es
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start processing')
      setAppState('error')
    }
  }, [])

  const handleReset = useCallback(() => {
    if (esRef.current) {
      esRef.current.close()
      esRef.current = null
    }
    setAppState('idle')
    setResults(null)
    setProgress({ label: '', percent: 0, detail: '' })
    setError('')
  }, [])

  const handleRetry = useCallback(() => {
    handleReset()
  }, [handleReset])

  useEffect(() => {
    return () => {
      if (esRef.current) esRef.current.close()
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 font-sans">
      <Header onOpenSettings={() => setSettingsOpen(true)} />

      {configError && !config && (
        <div className="mx-auto max-w-3xl px-6 pt-6">
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-300">
            {configError}
          </div>
        </div>
      )}

      {appState === 'idle' && (
        <InputArea
          config={config}
          apiKey={apiKey}
          onApiKeyChange={setApiKey}
          onSubmit={handleProcess}
          disabled={false}
        />
      )}

      {appState === 'processing' && (
        <Progress
          message={progress.label}
          percent={progress.percent}
          stage={progress.detail}
        />
      )}

      {appState === 'complete' && results && (
        <Results data={results} onReset={handleReset} />
      )}

      {appState === 'error' && (
        <ErrorDisplay message={error} onRetry={handleRetry} />
      )}

      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        config={config}
      />
    </div>
  )
}

export default App
