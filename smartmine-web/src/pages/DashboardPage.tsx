import { Bot, Truck } from 'lucide-react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { ProgressBar } from '../components/ui/ProgressBar'
import { StatCard } from '../components/ui/StatCard'
import { StatusBadge } from '../components/ui/StatusBadge'
import { useAppState } from '../context/AppStateContext'
import { performanceTrend } from '../data/mockData'

export const DashboardPage = () => {
  const { session, mission, telemetry, dashboardKpi, vehicleHealth, presentationMode, fleetStatus } = useAppState()

  return (
    <div className={`page-grid ${presentationMode ? 'presentation' : ''}`}>
      <PageHeader
        title={`سلام، راننده ${session.driver.id}`}
        subtitle="شیفت صبح — معدن شماره ۱"
        label="نمونه اولیه"
      />

      <div className="dashboard-hero">
        <Card title={session.driver.truckId} subtitle="آماده به کار">
          <div className="hero-status">
            <Truck size={20} />
            <div>
              <p>سلامت</p>
              <strong>{vehicleHealth.overallScore}%</strong>
              <ProgressBar value={vehicleHealth.overallScore} tone="success" />
            </div>
          </div>
        </Card>

        <div className="telemetry-grid">
          <StatCard label="سرعت" value={`${telemetry.speed} km/h`} />
          <StatCard label="بار فعلی" value={`${telemetry.payloadTon} ton`} />
          <StatCard label="دمای موتور" value={`${telemetry.engineTemp}°C`} />
          <StatCard label="سوخت" value={`${telemetry.fuelPercent}%`} />
        </div>
      </div>

      <section className="kpi-grid">
        <StatCard label="امتیاز عملکرد امروز" value={`${dashboardKpi.performanceScore} / 100`} />
        <StatCard label="تناژ حمل‌شده" value={`${dashboardKpi.hauledTon} ton`} />
        <StatCard label="تعداد چرخه" value={dashboardKpi.cycleCount} />
        <StatCard label="زمان کار مفید" value={dashboardKpi.productiveHours} />
      </section>

      <div className="two-col-grid">
        <Card title="مأموریت فعلی">
          <div className="mission-card">
            <p>
              {mission.fromShovel} ← {mission.toCrusher}
            </p>
            <ul>
              <li>فاصله: {mission.distanceKm} km</li>
              <li>زمان تخمینی: {mission.etaMin} دقیقه</li>
              <li>وضعیت: {mission.status}</li>
            </ul>
          </div>
        </Card>

        <Card title="وضعیت ناوگان">
          <ul className="fleet-list">
            {fleetStatus.map((vehicle) => (
              <li key={vehicle.id}>
                <span>{vehicle.id}</span>
                <StatusBadge
                  label={vehicle.status}
                  tone={
                    vehicle.status === 'Online'
                      ? 'success'
                      : vehicle.status === 'Warning'
                        ? 'warning'
                        : 'danger'
                  }
                />
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="charts-grid">
        <Card title="عملکرد 7 روز اخیر">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={performanceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="تناژ روزانه">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={performanceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip />
              <Area type="monotone" dataKey="ton" fill="rgba(214,162,58,.25)" stroke="var(--primary)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card title="زمان چرخه">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={performanceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip />
              <Bar dataKey="cycle" fill="var(--success)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title="پیشنهاد هوشمند" subtitle="AI Recommendation" actions={<Bot size={18} />}>
        <p>
          با توجه به وضعیت فعلی صف‌ها، مأموریت بعدی به شاول 03 پیشنهاد می‌شود.
        </p>
      </Card>
    </div>
  )
}
