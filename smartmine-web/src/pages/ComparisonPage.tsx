import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '../components/ui/Card'
import { LoadingState } from '../components/ui/LoadingState'
import { PageHeader } from '../components/ui/PageHeader'
import { comparisonMetrics as fallbackComparison } from '../data/mockData'
import { smartmineApi } from '../services/api/smartmineApi'
import type { ComparisonMetric } from '../types/domain'

export const ComparisonPage = () => {
  const [metrics, setMetrics] = useState<ComparisonMetric[]>(fallbackComparison)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async (): Promise<void> => {
      try {
        const response = await smartmineApi.getComparison()
        setMetrics(response)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const chartData = useMemo(
    () =>
      metrics.map((item) => ({
        name: item.label,
        سنتی: item.traditional,
        هوشمند: item.smart,
      })),
    [metrics],
  )

  return (
    <div className="page-grid">
      <PageHeader
        title="ارزیابی سامانه"
        subtitle="مقایسه مدیریت سنتی با مدیریت هوشمند مبتنی بر IIoT"
        label="داده‌های زنده از API"
      />

      {loading ? (
        <LoadingState message="در حال دریافت داده‌های مقایسه..." />
      ) : (
        <>
          <Card title="مقایسه شاخص‌ها">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip />
                <Legend />
                <Bar dataKey="سنتی" fill="var(--warning)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="هوشمند" fill="var(--success)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <div className="two-col-grid">
            <Card title="سیستم سنتی">
              <ul className="metric-list">
                {metrics.map((metric) => (
                  <li key={metric.label}>
                    <span>{metric.label}</span>
                    <strong>
                      {metric.traditional} {metric.unit}
                    </strong>
                  </li>
                ))}
              </ul>
            </Card>

            <Card title="سیستم هوشمند">
              <ul className="metric-list">
                {metrics.map((metric) => (
                  <li key={metric.label}>
                    <span>{metric.label}</span>
                    <strong>
                      {metric.smart} {metric.unit}
                    </strong>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
