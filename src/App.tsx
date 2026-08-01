import { useEffect, useState } from 'react'
import type { AnswerRecord, Word } from './types'
import { groupByPattern, loadWords } from './data'
import { generateQuestions } from './questions'
import SetupScreen from './components/SetupScreen'
import QuizScreen from './components/QuizScreen'
import ResultsScreen from './components/ResultsScreen'
import Credits from './components/Credits'
import './App.css'

type Screen = 'loading' | 'setup' | 'quiz' | 'results'

export default function App() {
  const [screen, setScreen] = useState<Screen>('loading')
  const [error, setError] = useState<string | null>(null)
  const [groups, setGroups] = useState<Map<string, Word[]>>(new Map())
  const [questions, setQuestions] = useState<Word[]>([])
  const [results, setResults] = useState<AnswerRecord[]>([])
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(0)

  useEffect(() => {
    loadWords()
      .then((words) => {
        setGroups(groupByPattern(words))
        setScreen('setup')
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err))
        setScreen('setup')
      })
  }, [])

  function handleStart(selected: string[], count: number) {
    const { questions: qs } = generateQuestions(groups, selected, count)
    setQuestions(qs)
    setResults([])
    setStartTime(Date.now())
    setScreen('quiz')
  }

  function handleFinish(finalResults: AnswerRecord[]) {
    setResults(finalResults)
    setEndTime(Date.now())
    setScreen('results')
  }

  if (screen === 'loading') {
    return (
      <>
        <div className="screen center-screen">Loading words…</div>
        <Credits />
      </>
    )
  }

  if (screen === 'quiz') {
    return (
      <>
        <QuizScreen questions={questions} onFinish={handleFinish} onQuit={() => setScreen('setup')} />
        <Credits />
      </>
    )
  }

  if (screen === 'results') {
    return (
      <>
        <ResultsScreen
          results={results}
          startTime={startTime}
          endTime={endTime}
          onRestart={() => setScreen('setup')}
        />
        <Credits />
      </>
    )
  }

  if (error) {
    return (
      <>
        <div className="screen center-screen">
          <h1>Error</h1>
          <p>{error}</p>
          <button type="button" className="btn primary" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
        <Credits />
      </>
    )
  }

  return (
    <>
      <SetupScreen groups={groups} onStart={handleStart} />
      <Credits />
    </>
  )
}
