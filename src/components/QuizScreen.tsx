import { useEffect, useRef, useState } from 'react'
import type { AnswerRecord, Word } from '../types'
import { FIRST_TONES, SECOND_TONES, formatPattern, isCorrectAnswer, toneLabel } from '../data'
import { markSyllable } from '../pinyin'
import { audioUrl } from '../config'
import PlayIcon from './PlayIcon'

interface Props {
  questions: Word[]
  onFinish: (results: AnswerRecord[]) => void
  onQuit: () => void
}

type Position = 'first' | 'second'
interface Selection {
  first: number | null
  second: number | null
}

export default function QuizScreen({ questions, onFinish, onQuit }: Props) {
  const [index, setIndex] = useState(0)
  const [selection, setSelection] = useState<Selection>({ first: null, second: null })
  const [revealed, setRevealed] = useState(false)
  const [results, setResults] = useState<AnswerRecord[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const word = questions[index]
  const [correctFirst, correctSecond] = word.pattern.split(' ').map(Number)
  const userPattern =
    selection.first !== null && selection.second !== null
      ? `${selection.first} ${selection.second}`
      : null
  const correct = userPattern !== null && isCorrectAnswer(word.pattern, userPattern)
  const syllables = word.pinyin.split(' ')
  const firstSyllable = syllables[0] ?? ''
  const secondSyllable = syllables[1] ?? ''
  const total = questions.length
  const isLast = index === total - 1

  useEffect(() => {
    const audio = new Audio(audioUrl(word.audio))
    audioRef.current = audio
    audio.play().catch(() => {})
    return () => {
      audio.pause()
    }
  }, [index, word])

  useEffect(() => {
    if (revealed || selection.first === null || selection.second === null) return
    const userPattern = `${selection.first} ${selection.second}`
    setResults((prev) => [
      ...prev,
      { index, word, correctPattern: word.pattern, userPattern, correct },
    ])
    setRevealed(true)
  }, [selection, revealed, index, word, correct])

  function handleTone(position: Position, tone: number) {
    if (revealed) return
    setSelection((prev) => ({
      ...prev,
      [position]: prev[position] === tone ? null : tone,
    }))
  }

  function next() {
    if (isLast) {
      onFinish(results)
      return
    }
    setIndex((i) => i + 1)
    setSelection({ first: null, second: null })
    setRevealed(false)
  }

  function toneClass(position: Position, tone: number): string {
    let cls = `tone-btn tone-${tone}`
    const userTone = selection[position]
    if (revealed) {
      const correctTone = correct ? userTone : position === 'first' ? correctFirst : correctSecond
      if (tone === correctTone) {
        cls += ' correct'
      } else if (tone === userTone) {
        cls += ' wrong'
      }
    } else if (tone === userTone) {
      cls += ' selected'
    }
    return cls
  }

  return (
    <div className="screen quiz-screen">
      <div className="quiz-header">
        <span className="muted">
          Question {index + 1} / {total}
        </span>
        <button type="button" className="btn ghost small" onClick={() => {
          if (window.confirm('Quit the drill? Progress will be lost.')) onQuit()
        }}>
          Quit
        </button>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${((index + (revealed ? 1 : 0)) / total) * 100}%` }} />
      </div>

      <div className="audio-area">
        <button
          type="button"
          className="play-button"
          aria-label="Play audio"
          onClick={() => audioRef.current?.play().catch(() => {})}
        >
          <PlayIcon size={64} />
        </button>
        <button
          type="button"
          className="btn ghost small"
          onClick={() => audioRef.current?.play().catch(() => {})}
        >
          Replay
        </button>
      </div>

      <div className="answer-area">
        <div className="tone-row">
          <span className="tone-row-label">First</span>
          <div className="tone-row-buttons">
            {FIRST_TONES.map((tone) => (
              <button
                key={tone}
                type="button"
                className={toneClass('first', tone)}
                onClick={() => handleTone('first', tone)}
                aria-label={`First tone ${tone}: ${markSyllable(firstSyllable, tone)}`}
              >
                {markSyllable(firstSyllable, tone)}
              </button>
            ))}
          </div>
        </div>
        <div className="tone-row">
          <span className="tone-row-label">Second</span>
          <div className="tone-row-buttons">
            {SECOND_TONES.map((tone) => (
              <button
                key={tone}
                type="button"
                className={toneClass('second', tone)}
                onClick={() => handleTone('second', tone)}
                aria-label={`Second tone ${toneLabel(tone)}: ${markSyllable(secondSyllable, tone)}`}
              >
                {markSyllable(secondSyllable, tone)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={`feedback ${revealed ? (correct ? 'correct' : 'incorrect') : 'hidden'}`}>
        {revealed && (
          <>
            <p className="feedback-title">
              {correct
                ? 'Correct!'
                : `Incorrect — correct pair: ${formatPattern(word.pattern)}`}
            </p>
            <p className="word-big">{word.expression}</p>
            <p className="word-pinyin">{word.pinyin}</p>
          </>
        )}
      </div>

      {revealed && (
        <button type="button" className="btn primary big" onClick={next}>
          {isLast ? 'See results' : 'Next'}
        </button>
      )}
    </div>
  )
}
