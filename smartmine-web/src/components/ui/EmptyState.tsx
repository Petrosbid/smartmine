import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description: string
  icon?: ReactNode
  action?: ReactNode
}

export const EmptyState = ({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) => {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        {icon ?? <Inbox size={26} />}
      </div>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>{title}</h3>
      <p style={{ fontSize: '0.9rem', margin: 0 }}>{description}</p>
      {action && <div style={{ marginTop: 12 }}>{action}</div>}
    </div>
  )
}
