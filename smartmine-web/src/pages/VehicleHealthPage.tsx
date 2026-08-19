import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { ProgressBar } from '../components/ui/ProgressBar'
import { StatusBadge } from '../components/ui/StatusBadge'
import { useAppState } from '../context/AppStateContext'
import { healthTrend } from '../data/mockData'

export const VehicleHealthPage = () => {
  const { vehicleHealth } = useAppState()

  return (
    <div className="page-grid">
      <PageHeader title="سلامت کامیون" subtitle={`کامیون ${vehicleHealth.truckId}`} />

      <Card title="سلامت کلی">
        <div className="health-overall">
          <strong>{vehicleHealth.overallScore}%</strong>
          <ProgressBar value={vehicleHealth.overallScore} tone="success" />
        </div>
      </Card>

      <Card title="وضعیت اجزا">
        <div className="component-list">
          {vehicleHealth.components.map((component) => (
            <div key={component.name} className="component-item">
              <div>
                <p>{component.name}</p>
                <strong>{component.score}%</strong>
              </div>
              <StatusBadge label={component.statusText} tone={component.statusLevel} />
            </div>
          ))}
        </div>
      </Card>

      <div className="charts-grid two-col-grid">
        <Card title="دمای موتور">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={healthTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="idx" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip />
              <Line type="monotone" dataKey="engineTemp" stroke="var(--warning)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="ارتعاش">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={healthTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="idx" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip />
              <Area type="monotone" dataKey="vibration" stroke="var(--danger)" fill="rgba(224,90,90,.2)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title="نگهداری پیش‌بینانه" subtitle="پیش‌بینی شبیه‌سازی‌شده">
        <p className="warning-text">🟡 هشدار سطح متوسط</p>
        <p>{vehicleHealth.predictiveNote}</p>
      </Card>
    </div>
  )
}
