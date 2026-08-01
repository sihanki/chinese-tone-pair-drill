interface Props {
  size?: number
}

export default function PlayIcon({ size = 32 }: Props) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
      <polygon points="9,6 9,18 18,12" fill="currentColor" />
    </svg>
  )
}
