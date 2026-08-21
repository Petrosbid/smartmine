import { useEffect, useState } from 'react'
import {
  Activity,
  Disc,
  Droplet,
  Flame,
  Gauge,
  MapPin,
  Pause,
  Play,
  RefreshCw,
  Weight,
  Zap,
} from 'lucide-react'
import {
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
import { StatCard } from '../components/ui/StatCard'
import { useAppState } from '../context/AppStateContext'
import { useTelemetrySimulation } from '../hooks/useTelemetrySimulation'

export const TelemetryPage = () => {
  const { session, telemetry, setTelemetry, setVehicleHealth, showToast } = useAppState()
  const [liveMode, setLiveMode] = useState(true)
  const [trend, setTrend] = useState<
    Array<{ idx: number; speed: number; temp: number; rpm: number; vibration: number }>
  >([])

  useTelemetrySimulation({
    enabled: liveMode,
    truckId: session.driver.truckId,
    setTelemetry,
    setVehicleHealth,
  })

  useEffect(() => {
    if (!liveMode) return

    setTrend((prev) => {
      const next = {
        idx: (prev.at(-1)?.idx ?? 0) + 1,
        speed: telemetry.speed,
        temp: telemetry.engineTemp,
        rpm: telemetry.rpm,
        vibration: Number((telemetry.vibration * 100).toFixed(0)),
      }
      return [...prev.slice(-19), next]
    })
  }, [liveMode, telemetry.engineTemp, telemetry.rpm, telemetry.speed, telemetry.vibration])

  const toggleLive = () => {
    setLiveMode((prev) => {
      const next = !prev
      showToast(
        next ? 'جریان داده‌های زنده فعال شد' : 'شبیه‌سازی زنده متوقف شد',
        next ? 'success' : 'neutral',
      )
      return next
    })
  }

  return (
    <div className="page-grid">
      <PageHeader
        title="داده‌های لحظه‌ای اینترنت اشیا صنعتی (IIoT)"
        subtitle={`جریان زنده داده‌های تله‌متری، پایش سنسورها و موقعیت کامیون ${session.driver.truckId}`}
        label="پایش زنده ۵۰Hz"
      />

      {/* Control Bar & Network Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div className="actions-row">
          <Button
            size="md"
            variant={liveMode ? 'primary' : 'ghost'}
            icon={liveMode ? <Pause size={16} /> : <Play size={16} />}
            onClick={toggleLive}
          >
            {liveMode ? 'توقف موقت جریان زنده' : 'ادامه دریافت زنده داده‌ها'}
          </Button>

          <Button
            size="md"
            variant="ghost"
            icon={<RefreshCw size={16} />}
            onClick={() => {
              setTrend([])
              showToast('نمودار تاریخچه پاکسازی شد', 'neutral')
            }}
          >
            پاکسازی تاریخچه
          </Button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="meta-chip meta-chip--pulse">
            <span className="pulse-dot" />
            <span className="mono" style={{ fontSize: 12 }}>IIoT Gateway: متصل (18ms)</span>
          </span>
        </div>
      </div>

      {/* Telemetry Sensor Grid */}
      <section className="telemetry-grid">
        <StatCard
          label="موقعیت ماهواره‌ای GPS"
          value={telemetry.gps}
          icon={<MapPin size={16} />}
          hint="دقت: ±۱.۲ متر"
        />
        <StatCard
          label="سرعت جاده‌ای"
          value={`${telemetry.speed} km/h`}
          icon={<Gauge size={16} />}
          hint="محدوده مجاز: ۴۰"
        />
        <StatCard
          label="دور موتور"
          value={`${telemetry.rpm} RPM`}
          icon={<Zap size={16} />}
          hint="وضعیت اقتصادی"
        />
        <StatCard
          label="دمای موتور"
          value={`${telemetry.engineTemp}°C`}
          icon={<Flame size={16} />}
          hint="محدوده نرمال: ۷۵-۹۲"
        />
        <StatCard
          label="فشار روغن هیدرولیک"
          value={telemetry.oilPressure}
          icon={<Droplet size={16} />}
          hint="سطح فشار استاندارد"
        />
        <StatCard
          label="فشار باد تایرها"
          value={`${telemetry.tirePressure} PSI`}
          icon={<Disc size={16} />}
          hint="سنسور TPMS فعال"
        />
        <StatCard
          label="سطح ارتعاش بدنه"
          value={`${telemetry.vibration} g`}
          icon={<Activity size={16} />}
          hint="شتاب‌سنج ۳محوره"
        />
        <StatCard
          label="بار محفظه کامیون"
          value={`${telemetry.payloadTon} ton`}
          icon={<Weight size={16} />}
          hint="لودسل هیدرولیک"
        />
      </section>

      {/* Real-time Multi-sensor Telemetry Stream Chart */}
      <Card
        title="نمودار نوسانات لحظه‌ای سنسورها (Live Waveform)"
        subtitle="پایش همزمان سرعت، دور موتور و دمای رادیاتور"
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="pulse-dot" />
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>بروزرسانی هر ۱.۵ ثانیه</span>
          </div>
        }
      >
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
            <XAxis dataKey="idx" stroke="var(--text-muted)" fontSize={11} />
            <YAxis stroke="var(--text-muted)" fontSize={11} />
            <Tooltip content={<ChartTooltip />} />
            <Line
              type="monotone"
              dataKey="speed"
              name="سرعت"
              stroke="var(--primary)"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="temp"
              name="دما"
              stroke="var(--danger)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Telemetry Network Diagnostics */}
      <div className="two-col-grid">
        <Card title="وضعیت ارتباطات تله‌متری و گیت‌وی معدن" subtitle="شبکه بی‌سیم اختصاصی IIoT Mesh">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            <div style={{ background: 'var(--surface)', padding: 12, borderRadius: 'var(--radius)' }}>
              <span className="muted" style={{ fontSize: 12 }}>پروتکل مخابراتی:</span>
              <p className="mono" style={{ fontWeight: 700, marginTop: 4 }}>MQTT over TLS 1.3</p>
            </div>
            <div style={{ background: 'var(--surface)', padding: 12, borderRadius: 'var(--radius)' }}>
              <span className="muted" style={{ fontSize: 12 }}>تاخیر شبکه (Latency):</span>
              <p className="mono success-text" style={{ fontWeight: 700, marginTop: 4 }}>۱۸ میلی‌ثانیه</p>
            </div>
            <div style={{ background: 'var(--surface)', padding: 12, borderRadius: 'var(--radius)' }}>
              <span className="muted" style={{ fontSize: 12 }}>پکت‌های از دست‌رفته:</span>
              <p className="mono success-text" style={{ fontWeight: 700, marginTop: 4 }}>۰.۰۰٪ (Zero Loss)</p>
            </div>
            <div style={{ background: 'var(--surface)', padding: 12, borderRadius: 'var(--radius)' }}>
              <span className="muted" style={{ fontSize: 12 }}>کیفیت سیگنال دکل:</span>
              <p className="mono" style={{ fontWeight: 700, marginTop: 4, color: 'var(--primary)' }}>-62 dBm (عالی)</p>
            </div>
          </div>
        </Card>

        <Card title="فرمان‌های کنترلی سنسور" subtitle="تنظیمات ارسال داده‌های ECU کامیون">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--surface)', borderRadius: 'var(--radius)' }}>
              <span>کالیبراسیون خودکار سنسور بار (Loadcell)</span>
              <Button size="sm" variant="ghost" onClick={() => showToast('کالیبراسیون لودسل با موفقیت اجرا شد', 'success')}>
                کالیبره
              </Button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--surface)', borderRadius: 'var(--radius)' }}>
              <span>تست پینگ سنسور ارتعاش سنج</span>
              <Button size="sm" variant="ghost" onClick={() => showToast('پاسخ سنسور ارتعاش در ۱۲ میلی‌ثانیه دریافت شد', 'success')}>
                ارسال پینگ
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
