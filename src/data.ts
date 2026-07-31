import type { Word } from './types'
import { DATA_URL } from './config'

export const FIRST_TONES = [1, 2, 3, 4] as const
export const SECOND_TONES = [1, 2, 3, 4, 0] as const

export const ALL_PATTERNS: string[] = FIRST_TONES.flatMap((first) =>
  SECOND_TONES.map((second) => `${first} ${second}`),
)

export function toneLabel(tone: number): string {
  return tone === 0 ? '轻声' : String(tone)
}

export function formatPattern(pattern: string): string {
  const [first, second] = pattern.split(' ').map(Number)
  return `${first} · ${toneLabel(second)}`
}

export async function loadWords(): Promise<Word[]> {
  const res = await fetch(DATA_URL)
  if (!res.ok) {
    throw new Error(`Failed to load data (${res.status})`)
  }
  return (await res.json()) as Word[]
}

export function groupByPattern(words: Word[]): Map<string, Word[]> {
  const groups = new Map<string, Word[]>()
  for (const word of words) {
    let list = groups.get(word.pattern)
    if (!list) {
      list = []
      groups.set(word.pattern, list)
    }
    list.push(word)
  }
  return groups
}
