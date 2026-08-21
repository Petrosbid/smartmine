import { useState } from 'react'
import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Clock,
  Flame,

  Gauge,
  Layers,
  Play,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Weight,
  Zap,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { ProgressBar } from '../components/ui/ProgressBar'
import { StatCard } from '../components/ui/StatCard'
import { defaultSimulationConfig } from '../data/mockData'
import { smartmineApi } from '../services/api/smartmineApi'
import type { SimulationConfig, SimulationResult, SimulationStep } from '../types/domain'

const presets = [
  { label: 'ناوگان استاندارد (۴۰ کامیون، ۵ شاول)', config: defaultSimulationConfig },
  {
    label: 'شیفت سنگین (۵۰ کامیون، ۶ شاول)',
    config: { trucks: 50 as const, shovels: 6, dumpPoints: 4, durationHours: 8 as const },
  },
  {
    label: 'عملیات سبک (۳۰ کامیون، ۴ شاول)',
    config: { trucks: 30 as const, shovels: 4, dumpPoints: 3, durationHours: 4 as const },
  },
]

export const SimulationPage = () => {
  const [config, setConfig] = useState<SimulationConfig>(defaultSimulationConfig)
  const [running, setRunning] = useState(false)
  const [progressPercent, setProgressPercent] = useState(0)
  const [currentStepMessage, setCurrentStepMessage] = useState('')
  const [visibleEvents, setVisibleEvents] = useState<string[]>([])
  const [liveMetrics, setLiveMetrics] = useState<{
    tonnage: number
    fuel: number
    queue: number
    cycle: number
    efficiency: number
  } | null>(null)
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [error, setError] = useState('')

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const run = async (): Promise<void> => {
    setRunning(true)
    setError('')
    setResult(null)
    setProgressPercent(5)
    setCurrentStepMessage('راه‌اندازی موتور شبیه‌سازی دیجیتال تویین و بارگذاری توپولوژی معدن...')
    setVisibleEvents(['⏱ شروع: مقداردهی اولیه سنسورهای IIoT و تخصیص ناوگان به جبهه‌های کاری'])
    setLiveMetrics({ tonnage: 0, fuel: 0, queue: 0, cycle: 0, efficiency: 50 })

    try {
      // 1. Fetch simulation model data from backend
      const response = await smartmineApi.runSimulation(config)
      const steps = response.steps || []
      const totalSteps = steps.length > 0 ? steps.length : config.durationHours

      // 2. Play realistic chronological simulation progression
      for (let i = 0; i < totalSteps; i += 1) {
        const step: SimulationStep | undefined = steps[i]
        const hour = step ? step.stepHour : i + 1
        const pct = Math.round(((i + 1) / totalSteps) * 100)

        setProgressPercent(pct)

        if (step) {
          setCurrentStepMessage(step.eventMessage)
          setVisibleEvents((prev) => [...prev, `⏱ ${step.eventMessage}`])
          setLiveMetrics({
            tonnage: step.producedTon,
            fuel: step.fuelLiters,
            queue: step.queueTime,
            cycle: response.avgCycleMin,
            efficiency: Math.min(100, Math.round(75 + (i / totalSteps) * (response.efficiencyPercent - 75))),
          })
        } else {
          const stepMsg = `ساعت ${hour}: در حال شبیه‌سازی باربری در رمپ‌ها و تخلیه در سنگ‌شکن (پیشرفت ${pct}٪)`
          setCurrentStepMessage(stepMsg)
          setVisibleEvents((prev) => [...prev, `⏱ ${stepMsg}`])
          setLiveMetrics({
            tonnage: Math.round((response.producedTon * (i + 1)) / totalSteps),
            fuel: Math.round((response.fuelLiters * (i + 1)) / totalSteps),
            queue: response.avgQueueMin,
            cycle: response.avgCycleMin,
            efficiency: Math.round(75 + (i / totalSteps) * (response.efficiencyPercent - 75)),
          })
        }

        // Realistic delay between simulation steps
        await sleep(550)
      }

      await sleep(200)
      setResult(response)
      setCurrentStepMessage('شبیه‌سازی کامل شد — نتایج و تحلیل شاخص‌های بهره‌وری آماده است.')
    } catch {
      setError('اجرای شبیه‌سازی با خطا مواجه شد.')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="page-grid">
      <PageHeader
        title="شبیه‌سازی و پیش‌بینی عملیات معدن"
        subtitle="مدل‌سازی پویای بار ترافیکی، محاسبه گلوگاه‌های صف و پیش‌بینی تناژ تولید با تغییر تعداد ناوگان"
        label="موتور شبیه‌سازی دیجیتال تویین"
      />

      {/* Scenario Presets */}
      <Card title="سناریوهای از پیش تعریف‌شده عملیاتی">
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {presets.map((p) => (
            <Button
              key={p.label}
              size="sm"
              variant="ghost"
              disabled={running}
              icon={<Sparkles size={14} />}
              onClick={() => {
                setConfig(p.config)
                setResult(null)
                setLiveMetrics(null)
                setVisibleEvents([])
              }}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </Card>

      {/* Simulation Configuration Form */}
      <Card
        title="پارامترهای ورودی مدل‌سازی"
        subtitle="تنظیم ظرفیت تجهیزات، زمان‌بندی و مقاصد تخلیه"
        actions={<Activity size={18} style={{ color: 'var(--primary)' }} />}
      >
        <div className="form-grid four-col">
          <label>
            تعداد دامپ‌تراک‌های فعال
            <select
              value={config.trucks}
              disabled={running}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, trucks: Number(e.target.value) as 30 | 40 | 50 }))
              }
            >
              <option value={30}>۳۰ دستگاه کامیون</option>
              <option value={40}>۴۰ دستگاه کامیون (استاندارد)</option>
              <option value={50}>۵۰ دستگاه کامیون (حداکثر ظرفیت)</option>
            </select>
          </label>

          <label>
            تعداد شاول‌های بارگیری
            <div className="input-with-unit">
              <input
                type="number"
                min={2}
                max={10}
                disabled={running}
                value={config.shovels}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, shovels: Number(e.target.value) }))
                }
              />
              <span className="input-unit">دستگاه</span>
            </div>
          </label>

          <label>
            تعداد نقاط تخلیه (سنگ‌شکن و دپو)
            <div className="input-with-unit">
              <input
                type="number"
                min={1}
                max={8}
                disabled={running}
                value={config.dumpPoints}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, dumpPoints: Number(e.target.value) }))
                }
              />
              <span className="input-unit">نقطه</span>
            </div>
          </label>

          <label>
            بازه زمانی شبیه‌سازی
            <select
              value={config.durationHours}
              disabled={running}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  durationHours: Number(e.target.value) as 1 | 4 | 8,
                }))
              }
            >
              <option value={1}>۱ ساعت (تست سریع)</option>
              <option value={4}>۴ ساعت (نیم‌شیفت)</option>
              <option value={8}>۸ ساعت (شیفت کامل)</option>
            </select>
          </label>
        </div>

        <div className="actions-row" style={{ marginTop: 16 }}>
          <Button
            size="lg"
            icon={<Play size={18} />}
            loading={running}
            onClick={() => void run()}
          >
            {running ? 'در حال اجرای گام‌به‌گام شبیه‌سازی...' : 'اجرای شبیه‌سازی عملیات معدن'}
          </Button>

          <Button
            size="lg"
            variant="ghost"
            disabled={running}
            icon={<RotateCcw size={16} />}
            onClick={() => {
              setConfig(defaultSimulationConfig)
              setResult(null)
              setLiveMetrics(null)
              setVisibleEvents([])
            }}
          >
            بازنشانی
          </Button>
        </div>
      </Card>

      {/* Realistic Simulation Progress & Live Status Box */}
      {(running || (result && visibleEvents.length > 0)) && (
        <Card
          title="فرآیند محاسباتی و لاگ زنده رویدادهای شبیه‌سازی"
          subtitle={`مدل‌سازی پیوسته ناوگان در بازه زمانی ${config.durationHours} ساعته`}
          actions={
            running ? (
              <span className="success-text" style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="pulse-dot" />
                در حال پردازش گام‌ها ({progressPercent}٪)
              </span>
            ) : (
              <span className="success-text" style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={16} />
                تکمیل شد
              </span>
            )
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{currentStepMessage}</span>
                <span className="mono" style={{ fontWeight: 700, color: 'var(--primary)' }}>
                  {progressPercent}٪
                </span>
              </div>
              <ProgressBar value={progressPercent} tone="primary" />
            </div>

            {/* Live Animated Metric Gauges during progress */}
            {liveMetrics && (
              <div className="four-col" style={{ gap: 8 }}>
                <div style={{ background: 'var(--surface)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                  <span className="muted" style={{ fontSize: 11 }}>تولید تجمعی:</span>
                  <div className="mono" style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)', marginTop: 2 }}>
                    {liveMetrics.tonnage.toLocaleString('fa-IR')} تن
                  </div>
                </div>
                <div style={{ background: 'var(--surface)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                  <span className="muted" style={{ fontSize: 11 }}>مصرف گازوئیل:</span>
                  <div className="mono" style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--warning-text)', marginTop: 2 }}>
                    {liveMetrics.fuel.toLocaleString('fa-IR')} لیتر
                  </div>
                </div>
                <div style={{ background: 'var(--surface)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                  <span className="muted" style={{ fontSize: 11 }}>میانگین صف شاول:</span>
                  <div className="mono" style={{ fontWeight: 800, fontSize: '1.1rem', marginTop: 2 }}>
                    {liveMetrics.queue} دقیقه
                  </div>
                </div>
                <div style={{ background: 'var(--surface)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                  <span className="muted" style={{ fontSize: 11 }}>بهره‌وری ناوگان (OEE):</span>
                  <div className="mono success-text" style={{ fontWeight: 800, fontSize: '1.1rem', marginTop: 2 }}>
                    {liveMetrics.efficiency}٪
                  </div>
                </div>
              </div>
            )}

            {/* Chronological Event Log Stream */}
            <div
              style={{
                background: 'var(--bg-deep)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
                maxHeight: 180,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                fontSize: 12,
                lineHeight: 1.5,
              }}
            >
              {visibleEvents.map((evt, idx) => (
                <div key={idx} style={{ color: idx === visibleEvents.length - 1 ? 'var(--primary)' : 'var(--text-secondary)' }}>
                  {evt}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {error && (
        <div className="error-box">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Final Simulation Results */}
      {result && (
        <Card
          title="نتایج نهایی پیش‌بینی‌شده شبیه‌سازی"
          subtitle={`برآورد خروجی عملیات برای شیفت ${config.durationHours} ساعته با ${config.trucks} کامیون و ${config.shovels} شاول`}
          actions={<TrendingUp size={20} className="success-text" />}
        >
          <div className="kpi-grid">
            <StatCard
              label="تولید کل تخمینی"
              value={`${result.producedTon.toLocaleString('fa-IR')} تن`}
              icon={<Weight size={18} />}
              trend={{ value: 'مطلوب', direction: 'up' }}
              hint="سنگ استخراجی تحویلی"
            />
            <StatCard
              label="میانگین زمان صف"
              value={`${result.avgQueueMin} دقیقه`}
              icon={<Clock size={18} />}
              hint="معطلی پشت شاول‌ها"
            />
            <StatCard
              label="میانگین زمان چرخه"
              value={`${result.avgCycleMin} دقیقه`}
              icon={<Gauge size={18} />}
              hint="رفت، بارگیری، تخلیه، بازگشت"
            />
            <StatCard
              label="زمان کل بیکاری ناوگان"
              value={`${result.idleMin} دقیقه`}
              icon={<Layers size={18} />}
              hint="مجموع توقف غیرمفید"
            />
            <StatCard
              label="مصرف سوخت کل"
              value={`${result.fuelLiters.toLocaleString('fa-IR')} لیتر`}
              icon={<Flame size={18} />}
              hint="گازوئیل مصرفی ناوگان"
            />
            <StatCard
              label="بهره‌وری کل ناوگان"
              value={`${result.efficiencyPercent}٪`}
              icon={<Zap size={18} />}
              trend={{ value: '+۱۲٪ هوشمند', direction: 'up' }}
              hint="شاخص راندمان OEE"
            />
          </div>

          {/* Traditional vs Smart Comparison Insight Box */}
          <div
            style={{
              marginTop: 18,
              padding: 16,
              borderRadius: 'var(--radius)',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <strong style={{ fontSize: 14, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart3 size={18} />
              تحلیل اثر به‌کارگیری دیسپچینگ هوشمند SmartMine بر این سناریو:
            </strong>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              در صورت استفاده از روش سنتی تخصیص ثابت، زمان انتظار صف شاول‌ها به <strong>{(result.avgQueueMin * 1.5).toFixed(1)} دقیقه</strong> و تولید کل به <strong>{Math.round(result.producedTon * 0.89).toLocaleString('fa-IR')} تن</strong> محدود می‌شد. الگوریتم هوشمند IIoT با توزیع یکنواخت تراک‌ها، زمان صف را تا <strong>۳۳٪ کاهش</strong> و حجم تولید را تا <strong>۱۱٪ افزایش</strong> داده است.
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}

