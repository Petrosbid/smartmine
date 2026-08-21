import {
  Activity,
  ArrowRight,
  Bot,
  Clock,
  Flame,
  Gauge,
  HeartPulse,
  Route,
  Sparkles,
  TrendingUp,
  Truck,
  Weight,
  Zap,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ChartTooltip } from '../components/ui/ChartTooltip'
import { PageHeader } from '../components/ui/PageHeader'
import { ProgressBar } from '../components/ui/ProgressBar'
import { StatCard } from '../components/ui/StatCard'
import { StatusBadge } from '../components/ui/StatusBadge'
import { routes } from '../constants/routes'
import { useAppState } from '../context/AppStateContext'
import { performanceTrend } from '../data/mockData'

export const DashboardPage = () => {
  const navigate = useNavigate()
  const {
    session,
    mission,
    telemetry,
    dashboardKpi,
    vehicleHealth,
    presentationMode,
    fleetStatus,
    recentPerformance,
    aiRecommendation,
  } = useAppState()

  // Use recentPerformance if available, otherwise rich fallback
  const trendData =
    recentPerformance && recentPerformance.length > 0
      ? recentPerformance.map((item, idx) => ({
          day: item.createdAt || `روز ${idx + 1}`,
          score: item.overallScore,
          ton: item.payloadTon,
          cycle: item.cycleCount,
        }))
      : performanceTrend.map((p) => ({
          day: p.day,
          score: p.score,
          ton: p.ton,
          cycle: p.cycle,
        }))

  return (
    <div className={`page-grid ${presentationMode ? 'presentation' : ''}`}>
      <PageHeader
        title={`سلام، ${session.driver.name}`}
        subtitle={`شیفت ${session.driver.shift} — مجتمع معدنی چادرملو / معدن شماره ۱`}
        label="سامانه IIoT فعال"
      />

      {/* Hero Section */}
      <div className="two-col-grid">
        <Card
          title={`کامیون فعال: ${session.driver.truckId}`}
          subtitle="پایش پیوسته پارامترهای موتور و ارتعاش"
          actions={
            <Button
              size="sm"
              variant="ghost"
              icon={<HeartPulse size={15} />}
              onClick={() => navigate(routes.vehicleHealth)}
            >
              جزئیات سلامت
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 'var(--radius)',
                  background: 'var(--primary-bg)',
                  border: '1px solid rgba(229, 169, 60, 0.3)',
                  color: 'var(--primary)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Truck size={28} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>شاخص سلامت کل</span>
                  <strong className="mono" style={{ fontSize: '1.25rem', color: 'var(--success-text)' }}>
                    {vehicleHealth.overallScore}٪
                  </strong>
                </div>
                <ProgressBar value={vehicleHealth.overallScore} tone="success" />
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 8,
                padding: '10px 12px',
                background: 'var(--surface)',
                borderRadius: 'var(--radius)',
                fontSize: 12,
              }}
            >
              <div>
                <span className="muted">دمای موتور:</span>{' '}
                <strong className="mono">{telemetry.engineTemp}°C</strong>
              </div>
              <div>
                <span className="muted">فشار تایر:</span>{' '}
                <strong className="mono">{telemetry.tirePressure} PSI</strong>
              </div>
              <div>
                <span className="muted">ارتعاش:</span>{' '}
                <strong className="mono">{telemetry.vibration} g</strong>
              </div>
            </div>
          </div>
        </Card>

        {/* Live Telemetry Summary */}
        <div className="telemetry-grid">
          <StatCard
            label="سرعت لحظه‌ای"
            value={`${telemetry.speed} km/h`}
            icon={<Gauge size={16} />}
            trend={{ value: 'مطلوب', direction: 'up' }}
            onClick={() => navigate(routes.telemetry)}
          />
          <StatCard
            label="بار جاری کامیون"
            value={`${telemetry.payloadTon} ton`}
            icon={<Weight size={16} />}
            hint="ظرفیت نامی: ۳۵ تن"
            onClick={() => navigate(routes.telemetry)}
          />
          <StatCard
            label="سطح سوخت"
            value={`${telemetry.fuelPercent}٪`}
            icon={<Flame size={16} />}
            hint="باک دیزل"
            onClick={() => navigate(routes.telemetry)}
          />
          <StatCard
            label="دور موتور"
            value={`${telemetry.rpm} RPM`}
            icon={<Zap size={16} />}
            hint="محدوده اقتصادی"
            onClick={() => navigate(routes.telemetry)}
          />
        </div>
      </div>

      {/* KPI Stats */}
      <section className="kpi-grid">
        <StatCard
          label="امتیاز عملکرد شیفت"
          value={`${dashboardKpi.performanceScore} / ۱۰۰`}
          icon={<TrendingUp size={18} />}
          trend={{ value: '+۴.۲٪', direction: 'up' }}
          hint="رتبه A شیفت صبح"
          onClick={() => navigate(routes.performance)}
        />
        <StatCard
          label="تناژ حمل‌شده امروز"
          value={`${dashboardKpi.hauledTon} تن`}
          icon={<Weight size={18} />}
          trend={{ value: '+۱۸ تن', direction: 'up' }}
          hint="هدف شیفت: ۴۲۰ تن"
        />
        <StatCard
          label="تعداد چرخه تکمیل‌شده"
          value={`${dashboardKpi.cycleCount} بار`}
          icon={<Activity size={18} />}
          hint="میانگین زمان: ۳۱ دقیقه"
        />
        <StatCard
          label="زمان کار مفید"
          value={dashboardKpi.productiveHours}
          icon={<Clock size={18} />}
          hint="راندمان زمانی: ۸۸٪"
        />
      </section>

      {/* Mission & Fleet Status */}
      <div className="two-col-grid">
        <Card
          title="مأموریت فعال دیسپچ"
          subtitle="تخصیص هوشمند مسیر بر اساس بار ترافیک"
          actions={
            <Button
              size="sm"
              variant="ghost"
              icon={<Route size={15} />}
              onClick={() => navigate(routes.dispatch)}
            >
              نقشه تاکتیکی
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'var(--surface)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--primary-bg)',
                    color: 'var(--primary)',
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  {mission.fromShovel}
                </span>
                <ArrowRight size={16} className="muted" />
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--info-bg)',
                    color: 'var(--info-text)',
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  {mission.toCrusher}
                </span>
              </div>
              <StatusBadge label={mission.status} tone="success" />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 10,
                textAlign: 'center',
                fontSize: 12,
              }}
            >
              <div style={{ background: 'var(--surface)', padding: 8, borderRadius: 'var(--radius-sm)' }}>
                <span className="muted">فاصله مسیر:</span>
                <div className="mono" style={{ fontWeight: 700, marginTop: 2 }}>
                  {mission.distanceKm} km
                </div>
              </div>
              <div style={{ background: 'var(--surface)', padding: 8, borderRadius: 'var(--radius-sm)' }}>
                <span className="muted">زمان تا مقصد (ETA):</span>
                <div className="mono" style={{ fontWeight: 700, marginTop: 2, color: 'var(--primary)' }}>
                  {mission.etaMin} دقیقه
                </div>
              </div>
              <div style={{ background: 'var(--surface)', padding: 8, borderRadius: 'var(--radius-sm)' }}>
                <span className="muted">کل زمان چرخه:</span>
                <div className="mono" style={{ fontWeight: 700, marginTop: 2 }}>
                  {mission.cycleTimeMin} دقیقه
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card title="وضعیت ناوگان در مدار" subtitle="موقعیت لحظه‌ای سایر کامیون‌های شیفت">
          <ul className="fleet-list">
            {fleetStatus.map((vehicle) => (
              <li key={vehicle.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Truck size={16} className="muted" />
                  <strong>کامیون {vehicle.id}</strong>
                </div>
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

      {/* Performance Analytics Charts */}
      <div className="charts-grid">
        <Card title="روند امتیاز عملکرد (۷ روز اخیر)" subtitle="شاخص ترکیبی تولید، ایمنی و بهره‌وری">
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" domain={[60, 100]} fontSize={11} />
              <Tooltip content={<ChartTooltip unit="از ۱۰۰" />} />
              <Line
                type="monotone"
                dataKey="score"
                name="امتیاز"
                stroke="var(--primary)"
                strokeWidth={3}
                dot={{ fill: 'var(--primary)', r: 4 }}
                activeDot={{ r: 6, fill: '#fff', stroke: 'var(--primary)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="تناژ بارگیری روزانه (تن)" subtitle="روند بار استخراجی حمل‌شده">
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="tonGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} />
              <Tooltip content={<ChartTooltip unit="تن" />} />
              <Area
                type="monotone"
                dataKey="ton"
                name="تناژ"
                stroke="var(--primary)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#tonGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card title="تعداد چرخه‌های موفق" subtitle="تعداد رفت و برگشت بارگیری و تخلیه">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} />
              <Tooltip content={<ChartTooltip unit="بار" />} />
              <Bar dataKey="cycle" name="چرخه‌ها" fill="var(--success)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* AI Recommendation Alert */}
      <Card
        title="پیشنهاد هوشمند SmartMine AI"
        subtitle="تحلیل الگوریتم بهینه‌سازی دیسپچ و پایش ناوگان"
        actions={
          <Button
            size="sm"
            icon={<Bot size={16} />}
            onClick={() => navigate(routes.aiAssistant)}
          >
            مشاوره با هوش مصنوعی
          </Button>
        }
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div
            style={{
              padding: 10,
              borderRadius: 'var(--radius)',
              background: 'var(--primary-bg)',
              color: 'var(--primary)',
            }}
          >
            <Sparkles size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.96rem', lineHeight: 1.7 }}>
              {aiRecommendation ||
                'با توجه به بار سنگین شاول 02، هدایت کامیون به سمت شاول 03 زمان انتظار را تا 24٪ کاهش می‌دهد.'}
            </p>
            <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate(routes.dispatch)}
                icon={<Route size={14} />}
              >
                مشاهده مأموریت بهینه‌شده
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
