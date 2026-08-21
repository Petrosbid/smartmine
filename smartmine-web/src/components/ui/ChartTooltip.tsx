interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{
    name?: string
    value?: number | string
    color?: string
    dataKey?: string | number
  }>
  label?: string
  unit?: string
  labelMap?: Record<string, string>
}

export const ChartTooltip = ({
  active,
  payload,
  label,
  unit = '',
  labelMap = {
    score: 'امتیاز',
    ton: 'تناژ (تن)',
    cycle: 'تعداد چرخه',
    speed: 'سرعت (km/h)',
    temp: 'دما (°C)',
    rpm: 'دور موتور (RPM)',
    engineTemp: 'دمای موتور (°C)',
    vibration: 'ارتعاش (g)',
    oilPressure: 'فشار روغن (PSI)',
    tirePressure: 'فشار تایر (PSI)',
    سنتی: 'روش سنتی',
    هوشمند: 'روش هوشمند SmartMine',
  },
}: ChartTooltipProps) => {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  return (
    <div className="chart-tooltip">
      {label && <div className="chart-tooltip__label">{label}</div>}
      {payload.map((item, index) => {
        const key = String(item.dataKey ?? item.name ?? '')
        const displayName = labelMap[key] || item.name || key
        const displayValue = item.value

        return (
          <div key={`${key}-${index}`} className="chart-tooltip__item">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span
                className="chart-tooltip__color-indicator"
                style={{ backgroundColor: item.color || 'var(--primary)' }}
              />
              <span className="muted">{displayName}:</span>
            </div>
            <strong className="mono" style={{ color: 'var(--text-primary)' }}>
              {displayValue} {unit}
            </strong>
          </div>
        )
      })}
    </div>
  )
}
