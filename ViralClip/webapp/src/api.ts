import type { AppConfig, ProcessRequest, ProcessResponse, CookieRequest, ProcessComplete } from './types'

const BASE = ''

export async function fetchConfig(): Promise<AppConfig> {
  const res = await fetch(`${BASE}/api/config`)
  if (!res.ok) throw new Error('Failed to load configuration')
  return res.json()
}

export async function startProcess(req: ProcessRequest): Promise<ProcessResponse> {
  const res = await fetch(`${BASE}/api/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Process request failed' }))
    throw new Error(err.error || 'Process request failed')
  }
  return res.json()
}

export function connectSSE(
  requestId: string,
  onProgress: (data: { label: string; percent: number; detail: string }) => void,
  onComplete: (data: ProcessComplete) => void,
  onError: (err: string) => void,
): EventSource {
  const es = new EventSource(`${BASE}/api/stream/${requestId}`)

  es.onmessage = (e) => {
    try {
      const msg = JSON.parse(e.data)
      if (msg.type === 'progress') {
        onProgress({ label: msg.label, percent: msg.percent, detail: msg.detail })
      } else if (msg.type === 'complete') {
        if (msg.success && msg.data) {
          onComplete(msg.data)
        } else {
          onError(msg.error || 'Processing failed')
        }
        es.close()
      } else if (msg.type === 'ping') {
        // keep-alive, ignore
      }
    } catch {
      // skip malformed messages
    }
  }

  es.onerror = () => {
    onError('Connection lost')
    es.close()
  }

  return es
}

export async function submitCookies(cookies: string): Promise<void> {
  const body: CookieRequest = { cookies }
  const res = await fetch(`${BASE}/api/cookies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('Failed to save cookies')
}
