interface CircularScoreProps {
  score: number
  size?: number
  strokeWidth?: number
}

export const CircularScore = ({
  score,
  size = 140,
  strokeWidth = 10,
}: CircularScoreProps) => {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clampedScore = Math.min(100, Math.max(0, score))
  const offset = circumference - (clampedScore / 100) * circumference

  // Color selection based on score value
  const strokeColor =
    clampedScore >= 80
      ? 'var(--success)'
      : clampedScore >= 65
        ? 'var(--primary)'
        : clampedScore >= 50
          ? 'var(--warning)'
          : 'var(--danger)'

  return (
    <div
      className="circular-score"
      style={{ width: size, height: size }}
      aria-label={`امتیاز ${clampedScore} از 100`}
    >
      <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="circular-score__track"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="circular-score__value"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="circular-score__text">
        <strong>{clampedScore}</strong>
        <span>از ۱۰۰</span>
      </div>
    </div>
  )
}
