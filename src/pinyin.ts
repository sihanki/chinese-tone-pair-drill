const TONE_VOWELS: Record<string, string[]> = {
  a: ['ā', 'á', 'ǎ', 'à'],
  e: ['ē', 'é', 'ě', 'è'],
  i: ['ī', 'í', 'ǐ', 'ì'],
  o: ['ō', 'ó', 'ǒ', 'ò'],
  u: ['ū', 'ú', 'ǔ', 'ù'],
  ü: ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
}

const LOWER_VOWELS = 'aeiouvü'

function markTarget(syllable: string): string {
  const lower = syllable.toLowerCase()
  if (lower.includes('a')) return 'a'
  if (lower.includes('e')) return 'e'
  if (lower.includes('ou')) return 'o'
  for (let i = lower.length - 1; i >= 0; i--) {
    if (LOWER_VOWELS.includes(lower[i])) return lower[i]
  }
  return ''
}

export function markSyllable(syllable: string, tone: number): string {
  if (tone < 1 || tone > 4) return syllable
  const target = markTarget(syllable)
  if (!target) return syllable
  const accent = TONE_VOWELS[target][tone - 1]
  if (syllable.includes(target)) {
    return syllable.replace(target, accent)
  }
  return syllable.replace(target.toUpperCase(), accent.toUpperCase())
}

export function markPinyin(pinyin: string, tones: string): string {
  const toneList = tones.split(' ')
  return pinyin
    .split(' ')
    .map((syllable, i) => markSyllable(syllable, Number(toneList[i]) || 0))
    .join(' ')
}
