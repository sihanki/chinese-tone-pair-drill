import { useMemo } from 'react'
import type { AnswerRecord } from '../types'
import { formatPattern } from '../data'
import { audioUrl } from '../config'

interface Props {
  results: AnswerRecord[]
  startTime: number
  endTime: number
  onRestart: () => void
}

function formatDuration(ms: number): string {
  const total = Math.round(ms / 1000)
  const min = Math.floor(total / 60)
  const sec = total % 60
  return `${min}:${String(sec).padStart(2, '0')}`
}

function playAudio(audioFile: string) {
  const audio = new Audio(audioUrl(audioFile))
  audio.play().catch(() => {})
}

export default function ResultsScreen({ results, startTime, endTime, onRestart }: Props) {
  const total = results.length
  const correct = results.filter((r) => r.correct).length
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0

  const byPattern = useMemo(() => {
    const map = new Map<string, { attempts: number; correct: number }>()
    for (const r of results) {
      let entry = map.get(r.correctPattern)
      if (!entry) {
        entry = { attempts: 0, correct: 0 }
        map.set(r.correctPattern, entry)
      }
      entry.attempts++
      if (r.correct) entry.correct++
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [results])

  return (
    <div className="screen results-screen">
      <h1>Drill Results</h1>

      <div className="stat-cards">
        <div className="stat-card">
          <span className="stat-value">{correct}/{total}</span>
          <span className="stat-label">Correct</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{accuracy}%</span>
          <span className="stat-label">Accuracy</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{formatDuration(endTime - startTime)}</span>
          <span className="stat-label">Time</span>
        </div>
      </div>

      <div className="card">
        <h2>By tone pair</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Pair</th>
              <th>Attempts</th>
              <th>Correct</th>
              <th>Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {byPattern.map(([pattern, entry]) => {
              const pct = entry.attempts > 0 ? Math.round((entry.correct / entry.attempts) * 100) : 0
              return (
                <tr key={pattern}>
                  <td>{formatPattern(pattern)}</td>
                  <td>{entry.attempts}</td>
                  <td>{entry.correct}</td>
                  <td>{pct}%</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2>By question</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Word</th>
              <th>Pinyin</th>
              <th>Correct</th>
              <th>Your answer</th>
              <th>Result</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.index}>
                <td>{r.index + 1}</td>
                <td>{r.word.expression}</td>
                <td className="muted">{r.word.pinyin}</td>
                <td>{formatPattern(r.correctPattern)}</td>
                <td>{formatPattern(r.userPattern)}</td>
                <td className={r.correct ? 'ok' : 'no'}>{r.correct ? '✓' : '✗'}</td>
                <td>
                  <button
                    type="button"
                    className="play-word"
                    aria-label={`Play ${r.word.expression}`}
                    onClick={() => playAudio(r.word.audio)}
                  >
                    ▶
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button type="button" className="btn primary big" onClick={onRestart}>
        New drill
      </button>
    </div>
  )
}
