import { ALL_PATTERNS } from './data'

export interface SetupSettings {
  selected: string[]
  count: number
  keyboardEnabled: boolean
  listenOnce: boolean
}

const STORAGE_KEY = 'tone-drill-settings'
const MIN_COUNT = 1
const MAX_COUNT = 200

export function loadSettings(): SetupSettings {
  const defaults: SetupSettings = {
    selected: [...ALL_PATTERNS],
    count: 20,
    keyboardEnabled: false,
    listenOnce: false,
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return defaults
    }
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) {
      return defaults
    }
    const obj = parsed as Record<string, unknown>
    const selected = Array.isArray(obj.selected)
      ? obj.selected.filter((p): p is string => typeof p === 'string' && ALL_PATTERNS.includes(p))
      : []
    const count =
      typeof obj.count === 'number' && Number.isFinite(obj.count)
        ? Math.min(Math.max(Math.trunc(obj.count), MIN_COUNT), MAX_COUNT)
        : defaults.count
    const keyboardEnabled = obj.keyboardEnabled === true
    const listenOnce = obj.listenOnce === true
    if (selected.length === 0) {
      return defaults
    }
    return { selected, count, keyboardEnabled, listenOnce }
  } catch {
    return defaults
  }
}

export function saveSettings(settings: SetupSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // storage unavailable — settings stay in memory for this session
  }
}
