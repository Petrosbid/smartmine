import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { LoadingState } from '../components/ui/LoadingState'
import { PageHeader } from '../components/ui/PageHeader'
import { defaultSimulationConfig } from '../data/mockData'
import { ApiError } from '../services/api/client'
import { smartmineApi } from '../services/api/smartmineApi'
import type { SimulationConfig, SimulationResult } from '../types/domain'

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
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'اجرای شبیه‌سازی انجام نشد.'
      setError(message)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="page-grid">
      <PageHeader title="شبیه‌سازی عملیات معدن" subtitle="داده‌های نمونه شبیه‌سازی‌شده" />

      <Card title="تنظیمات شبیه‌سازی">
        <div className="form-grid four-col">
          <label>
            تعداد کامیون‌ها
            <select
              value={config.trucks}
              onChange={(event) =>
                setConfig((prev) => ({ ...prev, trucks: Number(event.target.value) as 30 | 40 | 50 }))
              }
            >
              <option value={30}>30</option>
              <option value={40}>40</option>
              <option value={50}>50</option>
            </select>
          </label>
          <label>
            تعداد شاول
            <input
              type="number"
              value={config.shovels}
              onChange={(event) =>
                setConfig((prev) => ({ ...prev, shovels: Number(event.target.value) }))
              }
            />
          </label>
          <label>
            نقاط تخلیه
            <input
              type="number"
              value={config.dumpPoints}
              onChange={(event) =>
                setConfig((prev) => ({ ...prev, dumpPoints: Number(event.target.value) }))
              }
            />
          </label>
          <label>
            مدت شبیه‌سازی
            <select
              value={config.durationHours}
              onChange={(event) =>
                setConfig((prev) => ({
                  ...prev,
                  durationHours: Number(event.target.value) as 1 | 4 | 8,
                }))
              }
            >
              <option value={1}>1 ساعت</option>
              <option value={4}>4 ساعت</option>
              <option value={8}>8 ساعت</option>
            </select>
          </label>
        </div>
        <Button onClick={() => void run()}>اجرای شبیه‌سازی</Button>
      </Card>

      {running && <LoadingState message="در حال اجرای شبیه‌سازی..." />}
      {error && <div className="error-box">{error}</div>}

      {result && (
        <Card title="نتایج شبیه‌سازی">
          <div className="kpi-grid">
            <div className="stat-card"><div className="stat-card__label">تناژ تولید</div><strong className="stat-card__value">{result.producedTon} ton</strong></div>
            <div className="stat-card"><div className="stat-card__label">میانگین زمان صف</div><strong className="stat-card__value">{result.avgQueueMin} min</strong></div>
            <div className="stat-card"><div className="stat-card__label">میانگین زمان چرخه</div><strong className="stat-card__value">{result.avgCycleMin} min</strong></div>
            <div className="stat-card"><div className="stat-card__label">زمان بیکاری</div><strong className="stat-card__value">{result.idleMin} min</strong></div>
            <div className="stat-card"><div className="stat-card__label">مصرف سوخت</div><strong className="stat-card__value">{result.fuelLiters} L</strong></div>
            <div className="stat-card"><div className="stat-card__label">بهره‌وری</div><strong className="stat-card__value">{result.efficiencyPercent}%</strong></div>
          </div>
        </Card>
      )}
    </div>
  )
}
