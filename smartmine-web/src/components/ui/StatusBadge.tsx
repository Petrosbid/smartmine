import type { StatusLevel } from '../../types/domain'

const toneMap: Record<StatusLevel, string> = {
  success: 'status--success',
  warning: 'status--warning',
  danger: 'status--danger',
  neutral: 'status--neutral',
}

interface StatusBadgeProps {
  label: string
  tone?: StatusLevel
}

export const StatusBadge = ({ label, tone = 'neutral' }: StatusBadgeProps) => {
  return (
    <span className={`status-badge ${toneMap[tone]}`}>
      <span className="status-badge__dot" aria-hidden="true" />
      {label}
    </span>
  )
}
