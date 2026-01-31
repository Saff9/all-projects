export interface AppConfig {
  platforms: string[]
  video_ratios: string[]
  caption_styles: string[]
  whisper_models: string[]
  llm_models: string[]
  default_platform: string
  video_ratio: string
  caption_style: string
  max_clips: number
  whisper_model: string
  llm_model: string
}

export interface ProcessRequest {
  url: string
  api_key: string
  platform: string
  max_clips: number
  llm_model: string
  whisper_model: string
  video_ratio: string
  caption_style: string
}

export interface ProcessResponse {
  success: boolean
  request_id: string
}

export interface SSEProgress {
  label: string
  percent: number
  detail: string
}

export interface Clip {
  id: number
  title: string
  hook: string
  reason: string
  virality_score: number
  start_time: number
  end_time: number
  platform_hint: string
  success: boolean
  clip_file?: string
  download_url?: string
  error?: string
}

export interface ProcessComplete {
  success: boolean
  request_id: string
  title: string
  thumbnail: string
  duration: string
  duration_sec: number
  platform: string
  model_used: string
  transcript: string
  transcript_segments: number
  clips: Clip[]
  clips_count: number
  captions: Record<string, string>
  tags: string[]
  description: string
  metadata: Record<string, string>
}

export interface CookieRequest {
  cookies: string
}
