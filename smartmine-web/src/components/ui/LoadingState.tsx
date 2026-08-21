import type { ReactNode } from 'react'

interface LoadingStateProps {
  message?: string
  icon?: ReactNode
}

export const LoadingState = ({
  message = 'در حال بارگذاری اطلاعات...',
}: LoadingStateProps) => {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <div className="loading-spinner" />
      <p style={{ fontWeight: 500 }}>{message}</p>
    </div>
  )
}
