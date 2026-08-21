import { useState } from 'react'
import {
  AlertCircle,
  Clock,
  FileText,
  Package,
  RotateCcw,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { routes } from '../constants/routes'
import { useAppState } from '../context/AppStateContext'
import { smartmineApi } from '../services/api/smartmineApi'
import type { PerformanceInput } from '../types/domain'

const defaultForm: PerformanceInput = {
  cycleCount: 12,
  hauledTon: 384,
  averageCycleTime: 31,
  waitTime: 12,
  idleTime: 18,
  fuelConsumption: 33,
  overspeedEvents: 1,
  hardBrakeEvents: 1,
  safetyEvents: 0,
  routeCompliance: 94,
  notes: '',
}

const excellentPreset: PerformanceInput = {
  cycleCount: 15,
  hauledTon: 465,
  averageCycleTime: 27,
  waitTime: 6,
  idleTime: 10,
  fuelConsumption: 29,
  overspeedEvents: 0,
  hardBrakeEvents: 0,
  safetyEvents: 0,
  routeCompliance: 98,
  notes: 'شیفت با حداکثر بهره‌وری و بدون هیچ‌گونه توقف یا حادثه به اتمام رسید.',
}

const congestedPreset: PerformanceInput = {
  cycleCount: 10,
  hauledTon: 320,
  averageCycleTime: 38,
  waitTime: 22,
  idleTime: 28,
  fuelConsumption: 37,
  overspeedEvents: 2,
  hardBrakeEvents: 2,
  safetyEvents: 1,
  routeCompliance: 86,
  notes: 'ترافیک شدید در شاول شماره ۲ باعث افزایش زمان صف و مصرف سوخت شد.',
}

export const PerformancePage = () => {
  const navigate = useNavigate()
  const { session, setPerformanceResult, setDashboardKpi, showToast } = useAppState()
  const [form, setForm] = useState<PerformanceInput>(defaultForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const updateField = (key: keyof PerformanceInput, value: number | string): void => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const submit = async (): Promise<void> => {
    if (form.cycleCount <= 0 || form.hauledTon <= 0 || form.routeCompliance > 100) {
      setError('لطفاً مقادیر فرم را به‌صورت معتبر تکمیل نمایید.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const { result } = await smartmineApi.analyzePerformance({
        driverId: session.driver.id,
        truckId: session.driver.truckId,
        shift: session.driver.shift,
        form,
      })

      setPerformanceResult(result)
      setDashboardKpi((prev) => ({
        ...prev,
        performanceScore: result.overallScore,
        cycleCount: form.cycleCount,
        hauledTon: form.hauledTon,
      }))
      showToast('تحلیل عملکرد شیفت با موفقیت انجام شد', 'success')
      navigate(routes.performanceResult)
    } catch {
      setError('تحلیل عملکرد با خطا مواجه شد.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-grid">
      <PageHeader
        title="ثبت عملکرد شیفت کاری"
        subtitle="اطلاعات تولید، راندمان زمانی و شاخص‌های ایمنی شیفت خود را برای ارزیابی و تحلیل هوشمند وارد کنید."
        label="ارزیابی مبتنی بر هوش مصنوعی"
      />

      {/* Preset Quick Selectors */}
      <Card title="تنظیم سریع مقادیر نمونه">
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button
            size="sm"
            variant="ghost"
            icon={<Sparkles size={14} />}
            onClick={() => setForm(excellentPreset)}
          >
            بارگذاری شیفت عالی (امتیاز ۹۴+)
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={<Clock size={14} />}
            onClick={() => setForm(congestedPreset)}
          >
            بارگذاری شیفت پرترافیک (امتیاز ۷۶)
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={<RotateCcw size={14} />}
            onClick={() => setForm(defaultForm)}
          >
            بازنشانی به حالت پیش‌فرض
          </Button>
        </div>
      </Card>

      {/* Production Section */}
      <Card
        title="شاخص‌های تولید و بارگیری"
        subtitle="حجم بار حمل‌شده و چرخه‌های تکمیل‌شده"
        actions={<Package size={18} style={{ color: 'var(--primary)' }} />}
      >
        <div className="form-grid three-col">
          <label>
            تعداد چرخه‌های موفق (بارگیری و تخلیه)
            <div className="input-with-unit">
              <input
                type="number"
                min={1}
                max={50}
                value={form.cycleCount}
                onChange={(e) => updateField('cycleCount', Number(e.target.value))}
              />
              <span className="input-unit">بار</span>
            </div>
          </label>

          <label>
            مجموع تناژ سنگ حمل‌شده
            <div className="input-with-unit">
              <input
                type="number"
                min={10}
                max={1500}
                value={form.hauledTon}
                onChange={(e) => updateField('hauledTon', Number(e.target.value))}
              />
              <span className="input-unit">تن</span>
            </div>
          </label>

          <label>
            میانگین زمان هر چرخه
            <div className="input-with-unit">
              <input
                type="number"
                min={10}
                max={120}
                value={form.averageCycleTime}
                onChange={(e) => updateField('averageCycleTime', Number(e.target.value))}
              />
              <span className="input-unit">دقیقه</span>
            </div>
          </label>
        </div>
      </Card>

      {/* Efficiency Section */}
      <Card
        title="راندمان زمانی و مصرف انرژی"
        subtitle="زمان‌های توقف، صف و مصرف سوخت گازوئیل"
        actions={<Zap size={18} style={{ color: 'var(--warning-text)' }} />}
      >
        <div className="form-grid three-col">
          <label>
            زمان انتظار در صف شاول و سنگ‌شکن
            <div className="input-with-unit">
              <input
                type="number"
                min={0}
                max={180}
                value={form.waitTime}
                onChange={(e) => updateField('waitTime', Number(e.target.value))}
              />
              <span className="input-unit">دقیقه</span>
            </div>
          </label>

          <label>
            زمان بیکاری و توقف غیرمفید
            <div className="input-with-unit">
              <input
                type="number"
                min={0}
                max={180}
                value={form.idleTime}
                onChange={(e) => updateField('idleTime', Number(e.target.value))}
              />
              <span className="input-unit">دقیقه</span>
            </div>
          </label>

          <label>
            مصرف سوخت گازوئیل
            <div className="input-with-unit">
              <input
                type="number"
                min={10}
                max={100}
                value={form.fuelConsumption}
                onChange={(e) => updateField('fuelConsumption', Number(e.target.value))}
              />
              <span className="input-unit">L/h</span>
            </div>
          </label>
        </div>
      </Card>

      {/* Safety Section */}
      <Card
        title="ایمنی و انطباق با قوانین معدن"
        subtitle="ثبت هشدارهای سنسوری و پایبندی به مسیر مصوب"
        actions={<Shield size={18} style={{ color: 'var(--success-text)' }} />}
      >
        <div className="form-grid four-col">
          <label>
            خطای سرعت غیرمجاز
            <div className="input-with-unit">
              <input
                type="number"
                min={0}
                max={20}
                value={form.overspeedEvents}
                onChange={(e) => updateField('overspeedEvents', Number(e.target.value))}
              />
              <span className="input-unit">مورد</span>
            </div>
          </label>

          <label>
            ترمزهای شدید ناگهانی
            <div className="input-with-unit">
              <input
                type="number"
                min={0}
                max={20}
                value={form.hardBrakeEvents}
                onChange={(e) => updateField('hardBrakeEvents', Number(e.target.value))}
              />
              <span className="input-unit">مورد</span>
            </div>
          </label>

          <label>
            رویدادهای بحرانی ایمنی
            <div className="input-with-unit">
              <input
                type="number"
                min={0}
                max={10}
                value={form.safetyEvents}
                onChange={(e) => updateField('safetyEvents', Number(e.target.value))}
              />
              <span className="input-unit">مورد</span>
            </div>
          </label>

          <label>
            درصد پایبندی به مسیر استاندارد
            <div className="input-with-unit">
              <input
                type="number"
                min={50}
                max={100}
                value={form.routeCompliance}
                onChange={(e) => updateField('routeCompliance', Number(e.target.value))}
              />
              <span className="input-unit">٪</span>
            </div>
          </label>
        </div>
      </Card>

      {/* Notes Section */}
      <Card
        title="یادداشت‌های راننده و رویدادهای شیفت"
        subtitle="توضیحات اختیاری در خصوص شرایط جوی، وضعیت جاده یا عیوب فنی"
        actions={<FileText size={18} className="muted" />}
      >
        <textarea
          rows={3}
          value={form.notes}
          placeholder="مثال: شیفت با گرد و غبار شدید در جاده منتهی به دپو همراه بود..."
          onChange={(event) => updateField('notes', event.target.value)}
        />
      </Card>

      {error && (
        <div className="error-box">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="actions-row" style={{ marginTop: 8 }}>
        <Button
          size="lg"
          icon={<Sparkles size={18} />}
          loading={loading}
          onClick={() => void submit()}
        >
          {loading ? 'در حال تحلیل داده‌های شیفت...' : 'محاسبه و تحلیل هوشمند عملکرد'}
        </Button>
      </div>
    </div>
  )
}
