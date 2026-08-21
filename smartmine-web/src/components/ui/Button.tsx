import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'success'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  block?: boolean
  loading?: boolean
  icon?: ReactNode
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  block = false,
  loading = false,
  icon,
  children,
  className,
  disabled,
  ...rest
}: ButtonProps) => {
  return (
    <button
      className={`btn btn--${variant} ${size !== 'md' ? `btn--${size}` : ''} ${block ? 'btn--block' : ''} ${className ?? ''}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
      ) : (
        icon
      )}
      {children && <span>{children}</span>}
    </button>
  )
}
