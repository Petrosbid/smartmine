import type { ReactNode } from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'

export interface StatCardProps {
  label: string
  value: string | number
  hint?: string
  icon?: ReactNode
  trend?: {
    value: string
    direction: 'up' | 'down'
  }
  onClick?: () => void
}

export const StatCard = ({ label, value, hint, icon, trend, onClick }: StatCardProps) => {
  return (
    <article
      className="stat-card"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="stat-card__top">
        <span className="stat-card__label">{label}</span>
        {icon && <div className="stat-card__icon-box">{icon}</div>}
      </div>

      <div className="stat-card__row">
        <strong className="stat-card__value">{value}</strong>
        {trend && (
          <span
            className={`stat-card__trend ${
              trend.direction === 'up' ? 'stat-card__trend--up' : 'stat-card__trend--down'
            }`}
          >
            {trend.direction === 'up' ? (
              <TrendingUp size={13} aria-hidden="true" />
            ) : (
              <TrendingDown size={13} aria-hidden="true" />
            )}
            {trend.value}
          </span>
        )}
      </div>

      {hint && <p className="stat-card__hint">{hint}</p>}
    </article>
  )
}
