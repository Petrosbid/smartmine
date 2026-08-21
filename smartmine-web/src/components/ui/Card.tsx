import type { CSSProperties, ReactNode } from 'react'

export interface CardProps {
  title?: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export const Card = ({ title, subtitle, actions, children, className, style }: CardProps) => {
  return (
    <section className={`card ${className ?? ''}`} style={style}>
      {(title || subtitle || actions) && (
        <header className="card__header">
          <div>
            {title && <h3 className="card__title">{title}</h3>}
            {subtitle && <p className="card__subtitle">{subtitle}</p>}
          </div>
          {actions}
        </header>
      )}
      <div>{children}</div>
    </section>
  )
}
