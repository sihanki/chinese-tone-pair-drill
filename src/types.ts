export interface Word {
  expression: string
  audio: string
  pinyin: string
  pattern: string
}

export interface AnswerRecord {
  index: number
  word: Word
  correctPattern: string
  userPattern: string
  correct: boolean
}
