import { useEffect } from 'react'
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'

export interface ToastProps {
  message: string
  tone?: 'success' | 'warning' | 'danger' | 'neutral'
  onClose: () => void
  durationMs?: number
}

const iconMap = {
  success: <CheckCircle2 size={18} className="success-text" />,
  warning: <AlertTriangle size={18} className="warning-text" />,
  danger: <AlertCircle size={18} className="danger-text" />,
  neutral: <Info size={18} style={{ color: 'var(--primary)' }} />,
}

export const Toast = ({
  message,
  tone = 'neutral',
  onClose,
  durationMs = 3500,
}: ToastProps) => {
  useEffect(() => {
    const timeout = window.setTimeout(onClose, durationMs)
    return () => window.clearTimeout(timeout)
  }, [durationMs, onClose])

  return (
    <div className="toast-container" role="status">
      <div className={`toast toast--${tone}`}>
        <div className="toast__content">
          {iconMap[tone]}
          <p>{message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="بستن پیام"
          className="toast__close"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
