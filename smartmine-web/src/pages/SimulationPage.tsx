import { useState } from 'react'
import {
  Activity,
  AlertCircle,
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
import { StatCard } from '../components/ui/StatCard'
import { defaultSimulationConfig } from '../data/mockData'
import { smartmineApi } from '../services/api/smartmineApi'
import type { SimulationConfig, SimulationResult } from '../types/domain'

const presets = [
  { label: 'ناوگان استاندارد (۴۰ کامیون)', config: defaultSimulationConfig },
  {
    label: 'شیفت سنگین (۵۰ کامیون، ۶ شاول)',
    config: { trucks: 50 as const, shovels: 6, dumpPoints: 4, durationHours: 8 as const },
  },
  {
    label: 'عملیات بهینه (۳۰ کامیون، ۴ شاول)',
    config: { trucks: 30 as const, shovels: 4, dumpPoints: 3, durationHours: 4 as const },
  },
]

export const SimulationPage = () => {
  const [config, setConfig] = useState<SimulationConfig>(defaultSimulationConfig)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [error, setError] = useState('')

  const run = async (): Promise<void> => {
    setRunning(true)
    setError('')

    try {
      const response = await smartmineApi.runSimulation(config)
      setResult(response)
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
      <Card title="سناریوهای از پیش تعریف‌شده">
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {presets.map((p) => (
            <Button
              key={p.label}
              size="sm"
              variant="ghost"
              icon={<Sparkles size={14} />}
              onClick={() => setConfig(p.config)}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </Card>

      {/* Simulation Configuration Form */}
      <Card
        title="پارامترهای ورودی شبیه‌سازی"
        subtitle="تنظیم ظرفیت تجهیزات، زمان‌بندی و مقاصد تخلیه"
        actions={<Activity size={18} style={{ color: 'var(--primary)' }} />}
      >
        <div className="form-grid four-col">
          <label>
            تعداد دامپ‌تراک‌های فعال
            <select
              value={config.trucks}
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
            {running ? 'در حال اجرای موتور شبیه‌سازی...' : 'اجرای شبیه‌سازی عملیات'}
          </Button>

          <Button
            size="lg"
            variant="ghost"
            icon={<RotateCcw size={16} />}
            onClick={() => {
              setConfig(defaultSimulationConfig)
              setResult(null)
            }}
          >
            بازنشانی
          </Button>
        </div>
      </Card>

      {error && (
        <div className="error-box">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Simulation Results */}
      {result && (
        <Card
          title="نتایج پیش‌بینی‌شده شبیه‌سازی"
          subtitle={`برآورد خروجی عملیات برای بازه ${config.durationHours} ساعته با ${config.trucks} کامیون`}
          actions={<TrendingUp size={20} className="success-text" />}
        >
          <div className="kpi-grid">
            <StatCard
              label="تولید کل تخمینی"
              value={`${result.producedTon.toLocaleString('fa-IR')} تن`}
              icon={<Weight size={18} />}
              trend={{ value: 'مطلوب', direction: 'up' }}
              hint="سنگ استخراجی"
            />
            <StatCard
              label="میانگین زمان صف"
              value={`${result.avgQueueMin} دقیقه`}
              icon={<Clock size={18} />}
              hint="پشت شاول‌ها"
            />
            <StatCard
              label="میانگین زمان چرخه"
              value={`${result.avgCycleMin} دقیقه`}
              icon={<Gauge size={18} />}
              hint="رفت و برگشت"
            />
            <StatCard
              label="زمان کل بیکاری"
              value={`${result.idleMin} دقیقه`}
              icon={<Layers size={18} />}
              hint="مجموع ناوگان"
            />
            <StatCard
              label="مصرف سوخت کل"
              value={`${result.fuelLiters.toLocaleString('fa-IR')} لیتر`}
              icon={<Flame size={18} />}
              hint="گازوئیل مصرفی"
            />
            <StatCard
              label="بهره‌وری ناوگان"
              value={`${result.efficiencyPercent}٪`}
              icon={<Zap size={18} />}
              trend={{ value: '+۱۲٪', direction: 'up' }}
              hint="شاخص OEE"
            />
          </div>
        </Card>
      )}
    </div>
  )
}
