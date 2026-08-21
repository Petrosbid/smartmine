interface PageHeaderProps {
  title: string
  subtitle?: string
  label?: string
}

export const PageHeader = ({ title, subtitle, label }: PageHeaderProps) => {
  return (
    <header className="page-header">
      {label && <span className="page-header__label">{label}</span>}
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </header>
  )
}
