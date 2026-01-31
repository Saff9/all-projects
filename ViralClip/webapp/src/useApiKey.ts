import { useState, useCallback } from 'react'

const KEY = 'viralclip_api_key'

export function useApiKey(): [string, (key: string) => void] {
  const [key, setKeyState] = useState<string>(() => {
    try { return localStorage.getItem(KEY) || '' } catch { return '' }
  })
  const setKey = useCallback((val: string) => {
    setKeyState(val)
    try { localStorage.setItem(KEY, val) } catch { /* ok */ }
  }, [])
  return [key, setKey]
}
