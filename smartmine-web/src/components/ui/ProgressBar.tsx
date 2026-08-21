interface ProgressBarProps {
  value: number
  tone?: 'success' | 'warning' | 'danger' | 'primary'
}

export const ProgressBar = ({ value, tone = 'primary' }: ProgressBarProps) => {
  return (
    <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}>
      <div className={`progress__fill progress__fill--${tone}`} style={{ width: `${value}%` }} />
    </div>
  )
}
