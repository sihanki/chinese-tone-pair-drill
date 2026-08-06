import { audioUrl } from './config'

let current: HTMLAudioElement | null = null
let currentFile: string | null = null

function getAudio(): HTMLAudioElement {
  if (!current) current = new Audio()
  return current
}

export function playAudio(audioFile: string) {
  const audio = getAudio()
  if (currentFile !== audioFile) {
    audio.src = audioUrl(audioFile)
    currentFile = audioFile
  }
  audio.currentTime = 0
  audio.play().catch(() => {})
}

export function pauseAudio() {
  current?.pause()
}
