import type { Word } from './types'

export interface GenerationResult {
  questions: Word[]
  counts: Record<string, number>
}

function shuffle<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[items[i], items[j]] = [items[j], items[i]]
  }
  return items
}

function sample<T>(items: T[], count: number): T[] {
  return shuffle([...items]).slice(0, count)
}

export function generateQuestions(
  pool: Map<string, Word[]>,
  selected: string[],
  count: number,
): GenerationResult {
  const available: Record<string, number> = {}
  for (const pattern of selected) {
    available[pattern] = pool.get(pattern)?.length ?? 0
  }

  const alloc: Record<string, number> = {}
  for (const pattern of selected) {
    alloc[pattern] = 0
  }

  const base = Math.floor(count / selected.length)
  for (const pattern of selected) {
    alloc[pattern] = Math.min(base, available[pattern])
  }

  let remaining = count - selected.reduce((sum, p) => sum + alloc[p], 0)
  while (remaining > 0) {
    const candidates = selected
      .map((pattern) => ({ pattern, alloc: alloc[pattern], avail: available[pattern] }))
      .filter((c) => c.alloc < c.avail)
    if (candidates.length === 0) break
    const min = Math.min(...candidates.map((c) => c.alloc))
    const best = sample(candidates.filter((c) => c.alloc === min), 1)[0]
    alloc[best.pattern]++
    remaining--
  }

  const questions: Word[] = []
  for (const pattern of selected) {
    const words = pool.get(pattern) ?? []
    questions.push(...sample(words, alloc[pattern]))
  }

  return { questions: shuffle(questions), counts: alloc }
}
