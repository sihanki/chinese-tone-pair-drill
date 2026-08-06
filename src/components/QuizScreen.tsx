import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import type { AnswerRecord, Word } from '../types'
import { FIRST_TONES, SECOND_TONES, formatPattern, isCorrectAnswer, toneLabel } from '../data'
import { markSyllable } from '../pinyin'
import { playAudio, pauseAudio } from '../audio'
import PlayIcon from './PlayIcon'

interface Props {
  questions: Word[]
  keyboardEnabled: boolean
  listenOnce: boolean
  onFinish: (results: AnswerRecord[]) => void
  onQuit: (results: AnswerRecord[]) => void
}

type Position = 'first' | 'second'
interface Selection {
  first: number | null
  second: number | null
}

export default function QuizScreen({ questions, keyboardEnabled, listenOnce, onFinish, onQuit }: Props) {
  const [index, setIndex] = useState(0)
  const [selection, setSelection] = useState<Selection>({ first: null, second: null })
  const [revealed, setRevealed] = useState(false)
  const [results, setResults] = useState<AnswerRecord[]>([])
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

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
    playAudio(word.audio)
    return pauseAudio
  }, [index, word])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return
      if (e.key.toLowerCase() === 'r' && (!listenOnce || revealed)) {
        playAudio(word.audio)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [word, listenOnce, revealed])

  useEffect(() => {
    if (keyboardEnabled) {
      inputRef.current?.focus()
    }
  }, [index, keyboardEnabled])

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
    setInputValue('')
  }

  function handleInputKeyDown(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (revealed) {
      if (e.key === 'Enter') {
        e.preventDefault()
        next()
      }
      return
    }
    if (e.key === 'Backspace') {
      e.preventDefault()
      if (selection.second !== null) {
        setSelection((prev) => ({ ...prev, second: null }))
        setInputValue(selection.first === null ? '' : String(selection.first))
      } else {
        setSelection((prev) => ({ ...prev, first: null }))
        setInputValue('')
      }
      return
    }
    if (e.key === 'Enter') {
      return
    }
    if (!/^[0-4]$/.test(e.key)) {
      if (e.key.length === 1) {
        e.preventDefault()
      }
      return
    }
    const digit = Number(e.key)
    if (selection.first === null) {
      if (digit < 1 || digit > 4) {
        e.preventDefault()
        return
      }
      e.preventDefault()
      setSelection((prev) => ({ ...prev, first: digit }))
      setInputValue(String(digit))
    } else {
      e.preventDefault()
      setSelection((prev) => ({ ...prev, second: digit }))
      setInputValue('')
    }
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
        <button
          type="button"
          className="btn ghost small"
          onClick={() => {
            if (results.length === 0) {
              onQuit(results)
            } else if (window.confirm('Quit the drill?\nYou will be redirected to the results screen.')) {
              onQuit(results)
            }
          }}
        >
          Quit
        </button>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${((index + (revealed ? 1 : 0)) / total) * 100}%` }} />
      </div>

      {(!listenOnce || revealed) && (
        <div className="audio-area">
          <button
            type="button"
            className="play-button"
            aria-label="Play audio"
            onClick={() => playAudio(word.audio)}
          >
            <PlayIcon size={64} />
          </button>
          <button
            type="button"
            className="btn ghost small"
            onClick={() => playAudio(word.audio)}
          >
            Replay
          </button>
        </div>
      )}

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

      {keyboardEnabled && (
        <div className="keyboard-row">
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={inputValue}
            readOnly={revealed}
            className={`keyboard-input${revealed ? ' readonly' : ''}`}
            onChange={() => {}}
            onKeyDown={handleInputKeyDown}
            aria-label="Tone pair via keyboard"
          />
          <span className="muted">Type first tone (1–4), then second (0–4). Enter advances.</span>
        </div>
      )}
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
