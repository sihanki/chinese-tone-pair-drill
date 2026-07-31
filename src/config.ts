export const DATA_URL = import.meta.env.VITE_DATA_URL ?? '/data.json'

export const AUDIO_BASE_URL = (import.meta.env.VITE_AUDIO_BASE_URL ?? '/audio').replace(/\/$/, '')

export function audioUrl(file: string): string {
  return `${AUDIO_BASE_URL}/${file}`
}
