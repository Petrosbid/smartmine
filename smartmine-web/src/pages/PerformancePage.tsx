import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { LoadingState } from '../components/ui/LoadingState'
import { PageHeader } from '../components/ui/PageHeader'
import { routes } from '../constants/routes'
import { useAppState } from '../context/AppStateContext'
import { ApiError } from '../services/api/client'
import { smartmineApi } from '../services/api/smartmineApi'
import type { PerformanceInput } from '../types/domain'

const initialForm: PerformanceInput = {
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

export const PerformancePage = () => {
  const navigate = useNavigate()
  const { session, setPerformanceResult, setDashboardKpi, showToast } = useAppState()
  const [form, setForm] = useState<PerformanceInput>(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const updateField = (key: keyof PerformanceInput, value: number | string): void => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const submit = async (): Promise<void> => {
    if (form.cycleCount <= 0 || form.hauledTon <= 0 || form.routeCompliance > 100) {
      setError('لطفاً مقادیر فرم را به‌صورت معتبر تکمیل کنید.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const { result, aiAnalysis } = await smartmineApi.analyzePerformance({
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
      showToast(aiAnalysis, 'neutral')
      navigate(routes.performanceResult)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'تحلیل عملکرد انجام نشد.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-grid">
      <PageHeader
        title="ثبت عملکرد شیفت"
        subtitle="اطلاعات عملکرد خود را برای ارزیابی و تحلیل ثبت کنید."
      />

      <Card title="Production">
        <div className="form-grid three-col">
          <label>تعداد چرخه<input type="number" value={form.cycleCount} onChange={(event) => updateField('cycleCount', Number(event.target.value))} /></label>
          <label>تناژ حمل‌شده<input type="number" value={form.hauledTon} onChange={(event) => updateField('hauledTon', Number(event.target.value))} /></label>
          <label>میانگین زمان چرخه<input type="number" value={form.averageCycleTime} onChange={(event) => updateField('averageCycleTime', Number(event.target.value))} /></label>
        </div>
      </Card>

      <Card title="Efficiency">
        <div className="form-grid three-col">
          <label>زمان انتظار<input type="number" value={form.waitTime} onChange={(event) => updateField('waitTime', Number(event.target.value))} /></label>
          <label>زمان بیکاری<input type="number" value={form.idleTime} onChange={(event) => updateField('idleTime', Number(event.target.value))} /></label>
          <label>مصرف سوخت<input type="number" value={form.fuelConsumption} onChange={(event) => updateField('fuelConsumption', Number(event.target.value))} /></label>
        </div>
      </Card>

      <Card title="Safety">
        <div className="form-grid four-col">
          <label>سرعت غیرمجاز<input type="number" value={form.overspeedEvents} onChange={(event) => updateField('overspeedEvents', Number(event.target.value))} /></label>
          <label>ترمز شدید<input type="number" value={form.hardBrakeEvents} onChange={(event) => updateField('hardBrakeEvents', Number(event.target.value))} /></label>
          <label>رویدادهای ایمنی<input type="number" value={form.safetyEvents} onChange={(event) => updateField('safetyEvents', Number(event.target.value))} /></label>
          <label>رعایت مسیر<input type="number" value={form.routeCompliance} onChange={(event) => updateField('routeCompliance', Number(event.target.value))} /></label>
        </div>
      </Card>

      <Card title="Driver Notes">
        <label>
          توضیحات یا رویدادهای مهم شیفت...
          <textarea rows={4} value={form.notes} onChange={(event) => updateField('notes', event.target.value)} />
        </label>
      </Card>

      {error && <div className="error-box">{error}</div>}

      {loading ? (
        <LoadingState message="در حال تحلیل داده‌ها..." />
      ) : (
        <Button onClick={submit}>تحلیل عملکرد</Button>
      )}
    </div>
  )
}
