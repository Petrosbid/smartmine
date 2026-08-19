import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, WandSparkles } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { LoadingState } from '../components/ui/LoadingState'
import { PageHeader } from '../components/ui/PageHeader'
import { useAppState } from '../context/AppStateContext'
import { mineMapNodes, shovelQueues } from '../data/mockData'
import { ApiError } from '../services/api/client'
import { smartmineApi } from '../services/api/smartmineApi'
import type { DispatchRecommendation } from '../types/domain'

export const DispatchPage = () => {
  const { mission, setMission, showToast } = useAppState()
  const [loading, setLoading] = useState(false)
  const [applying, setApplying] = useState(false)
  const [recommendation, setRecommendation] = useState<DispatchRecommendation | null>(null)

  const nodeClass = (type: string, id: string): string => {
    if (id === 'Shovel 02') return 'map-node map-node--warning'
    return `map-node map-node--${type}`
  }

  const activeRoute = useMemo(
    () => ({ from: mission.fromShovel, to: mission.toCrusher, truck: mission.truckId }),
    [mission],
  )

  const getRecommendation = async (): Promise<void> => {
    setLoading(true)

    try {
      const result = await smartmineApi.getDispatchRecommendation(mission.truckId)
      setRecommendation(result)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'دریافت پیشنهاد مأموریت انجام نشد.'
      showToast(message, 'danger')
    } finally {
      setLoading(false)
    }
  }

  const applyRecommendation = async (): Promise<void> => {
    if (!recommendation) return
    setApplying(true)

    try {
      const updated = await smartmineApi.applyDispatchRecommendation(mission.truckId, recommendation.recommendedShovel)
      setMission(updated)
      showToast('مأموریت پیشنهادی با موفقیت اعمال شد', 'success')
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'اعمال مأموریت پیشنهادی انجام نشد.'
      showToast(message, 'danger')
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className="page-grid">
      <PageHeader title="مأموریت هوشمند" subtitle="تخصیص پویا بر اساس وضعیت لحظه‌ای ناوگان" />

      <Card title="نقشه ساده معدن" subtitle="الگوریتم شبیه‌سازی‌شده">
        <div className="mine-map">
          <svg viewBox="0 0 100 100" className="map-lines" aria-hidden="true">
            <line x1="30" y1="45" x2="75" y2="45" />
            <line x1="35" y1="15" x2="75" y2="45" />
            <line x1="55" y1="48" x2="30" y2="45" />
          </svg>
          {mineMapNodes.map((node) => (
            <div
              key={node.id}
              className={nodeClass(node.type, node.id)}
              style={{ insetInlineStart: `${node.x}%`, top: `${node.y}%` }}
            >
              {node.id}
            </div>
          ))}
        </div>
        <p className="map-route">
          مسیر فعال: {activeRoute.truck} → {activeRoute.from} → {activeRoute.to}
        </p>
      </Card>

      <Card title="وضعیت صف شاول‌ها">
        <ul className="fleet-list">
          {shovelQueues.map((item) => (
            <li key={item.shovel}>
              <span>{item.shovel}</span>
              <span className={item.shovel === 'Shovel 02' ? 'danger-text' : ''}>{item.trucks} کامیون</span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="actions-row">
        <Button onClick={() => void getRecommendation()} icon={<WandSparkles size={16} />}>
          محاسبه مأموریت پیشنهادی
        </Button>
      </div>

      {loading && <LoadingState message="در حال محاسبه مأموریت..." />}

      {recommendation && (
        <Card title="پیشنهاد هوشمند" subtitle={recommendation.label}>
          <div className="recommendation-box">
            <p className="warning-text">
              <AlertTriangle size={16} /> ازدحام در شاول 02
            </p>
            <p>
              مأموریت پیشنهادی: T-27 → {recommendation.recommendedShovel} → Crusher 01
            </p>
            <p>زمان فعلی چرخه: {mission.cycleTimeMin} دقیقه</p>
            <p>زمان پیش‌بینی‌شده: {recommendation.estimatedCycleTime} دقیقه</p>
            <p>بهبود احتمالی: {recommendation.estimatedImprovement}%</p>
            <p className="muted">دلیل انتخاب: {recommendation.reason}</p>

            <Button onClick={() => void applyRecommendation()} disabled={applying} icon={<CheckCircle2 size={16} />}>
              {applying ? 'در حال اعمال...' : 'اعمال مأموریت پیشنهادی'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
