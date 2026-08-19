import { useEffect, useState } from 'react'
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { StatCard } from '../components/ui/StatCard'
import { useAppState } from '../context/AppStateContext'
import { useTelemetrySimulation } from '../hooks/useTelemetrySimulation'

export const TelemetryPage = () => {
  const { session, telemetry, setTelemetry, setVehicleHealth } = useAppState()
  const [liveMode, setLiveMode] = useState(true)
  const [trend, setTrend] = useState<Array<{ idx: number; speed: number; temp: number; rpm: number }>>([])

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
      }
      return [...prev.slice(-14), next]
    })
  }, [liveMode, telemetry.engineTemp, telemetry.rpm, telemetry.speed])

  return (
    <div className="page-grid">
      <PageHeader title="داده‌های لحظه‌ای IoT" subtitle="داده شبیه‌سازی‌شده" />

      <div className="actions-row">
        <Button variant={liveMode ? 'primary' : 'ghost'} onClick={() => setLiveMode((prev) => !prev)}>
          شبیه‌سازی داده زنده: {liveMode ? 'فعال' : 'غیرفعال'}
        </Button>
      </div>

      <section className="telemetry-grid">
        <StatCard label="GPS" value={telemetry.gps} />
        <StatCard label="سرعت" value={`${telemetry.speed} km/h`} />
        <StatCard label="RPM" value={telemetry.rpm} />
        <StatCard label="دمای موتور" value={`${telemetry.engineTemp}°C`} />
        <StatCard label="فشار روغن" value={telemetry.oilPressure} />
        <StatCard label="فشار تایر" value={`${telemetry.tirePressure} PSI`} />
        <StatCard label="لرزش" value={`${telemetry.vibration} g`} />
        <StatCard label="بار" value={`${telemetry.payloadTon} ton`} />
      </section>

      <Card title="روند لحظه‌ای سنسورها">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="idx" stroke="var(--text-secondary)" />
            <YAxis stroke="var(--text-secondary)" />
            <Tooltip />
            <Line type="monotone" dataKey="speed" stroke="var(--primary)" strokeWidth={2} />
            <Line type="monotone" dataKey="temp" stroke="var(--warning)" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card title="وضعیت شبکه">
        <p className="status-text status-text--success">● Online</p>
        <p>آخرین دریافت داده: 1 ثانیه قبل</p>
      </Card>
    </div>
  )
}
