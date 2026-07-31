import { useMemo, useState } from 'react'
import type { Word } from '../types'
import { ALL_PATTERNS, FIRST_TONES, SECOND_TONES, toneLabel } from '../data'

interface Props {
  groups: Map<string, Word[]>
  onStart: (selected: string[], count: number) => void
}

export default function SetupScreen({ groups, onStart }: Props) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(ALL_PATTERNS))
  const [count, setCount] = useState(20)

  const maxAvailable = useMemo(() => {
    let total = 0
    for (const pattern of selected) {
      total += groups.get(pattern)?.length ?? 0
    }
    return total
  }, [selected, groups])

  const clampedCount = Math.min(Math.max(1, count), Math.max(1, maxAvailable))

  function togglePattern(pattern: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(pattern)) {
        next.delete(pattern)
      } else {
        next.add(pattern)
      }
      return next
    })
  }

  const valid = selected.size > 0 && clampedCount >= 1

  return (
    <div className="screen setup-screen">
      <h1>Chinese Tone Drill</h1>
      <p className="subtitle">Select tone pairs to practice and the number of questions.</p>

      <div className="card">
        <h2>1. Choose tone pairs</h2>
        <div
          className="pair-grid"
          style={{ gridTemplateColumns: `auto repeat(${SECOND_TONES.length}, 1fr)` }}
        >
          <div />
          {SECOND_TONES.map((t) => (
            <div key={t} className={`grid-head tone-${t}`}>
              {toneLabel(t)}
            </div>
          ))}
          {FIRST_TONES.map((first) => (
            <div className="grid-row" key={first}>
              <div className={`grid-head tone-${first}`}>{first}</div>
              {SECOND_TONES.map((second) => {
                const pattern = `${first} ${second}`
                const on = selected.has(pattern)
                return (
                  <button
                    key={pattern}
                    type="button"
                    className={`pair-chip${on ? ' selected' : ''}`}
                    onClick={() => togglePattern(pattern)}
                    aria-pressed={on}
                  >
                    <span className={`tone-${first}`}>{first}</span>
                    <span className="pair-sep">/</span>
                    <span className={`tone-${second}`}>{toneLabel(second)}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
        <div className="row-actions">
          <button
            type="button"
            className="btn ghost"
            onClick={() => setSelected(new Set(ALL_PATTERNS))}
          >
            Select all
          </button>
          <button type="button" className="btn ghost" onClick={() => setSelected(new Set())}>
            Clear
          </button>
          <span className="muted">{selected.size} / 20 pairs selected</span>
        </div>
      </div>

      <div className="card">
        <h2>2. Number of questions</h2>
        <div className="count-row">
          <input
            type="number"
            min={1}
            max={maxAvailable}
            value={clampedCount}
            onChange={(e) => setCount(Math.max(1, Number(e.target.value) || 1))}
            onBlur={() => setCount(clampedCount)}
          />
          <span className="muted">
            max {maxAvailable} available ({selected.size} pair{selected.size === 1 ? '' : 's'})
          </span>
        </div>
      </div>

      <button
        type="button"
        className="btn primary big"
        disabled={!valid}
        onClick={() => onStart([...selected], clampedCount)}
      >
        Start Drill
      </button>
    </div>
  )
}
