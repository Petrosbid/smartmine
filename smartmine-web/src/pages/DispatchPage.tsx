import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Layers,
  MapPin,
  Sparkles,
  WandSparkles,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { StatusBadge } from '../components/ui/StatusBadge'
import { useAppState } from '../context/AppStateContext'
import { mineMapNodes, shovelQueues as fallbackQueues } from '../data/mockData'
import { smartmineApi } from '../services/api/smartmineApi'
import type { DispatchNode, DispatchRecommendation } from '../types/domain'

export const DispatchPage = () => {
  const { mission, setMission, showToast } = useAppState()
  const [loading, setLoading] = useState(false)
  const [applying, setApplying] = useState(false)
  const [recommendation, setRecommendation] = useState<DispatchRecommendation | null>(null)
  const [queues, setQueues] = useState<Array<{ shovel: string; trucks: number }>>(fallbackQueues)
  const [selectedNode, setSelectedNode] = useState<DispatchNode | null>(null)

  useEffect(() => {
    const loadDispatch = async (): Promise<void> => {
      try {
        const state = await smartmineApi.getDispatchState()
        if (state.queues && state.queues.length > 0) {
          setQueues(state.queues)
        }
      } catch {
        setQueues(fallbackQueues)
      }
    }
    void loadDispatch()
  }, [])

  const getRecommendation = async (): Promise<void> => {
    setLoading(true)
    try {
      const result = await smartmineApi.getDispatchRecommendation(mission.truckId)
      setRecommendation(result)
      showToast('پیشنهاد بهینه‌سازی مسیر با موفقیت محاسبه شد', 'success')
    } catch {
      showToast('خطا در محاسبه مأموریت پیشنهادی', 'danger')
    } finally {
      setLoading(false)
    }
  }

  const applyRecommendation = async (): Promise<void> => {
    if (!recommendation) return
    setApplying(true)

    try {
      const updated = await smartmineApi.applyDispatchRecommendation(
        mission.truckId,
        recommendation.recommendedShovel,
      )
      setMission(updated)
      showToast(
        `مأموریت با موفقیت به‌روزرسانی شد. مسیر جدید: ${recommendation.recommendedShovel}`,
        'success',
      )
    } catch {
      showToast('اعمال مأموریت با خطا مواجه شد.', 'danger')
    } finally {
      setApplying(false)
    }
  }

  const getNodeClass = (node: DispatchNode): string => {
    if (node.id === mission.truckId) return 'map-node map-node--active-truck'
    if (node.id === 'Shovel 02') return 'map-node map-node--shovel map-node--congested'
    return `map-node map-node--${node.type}`
  }

  return (
    <div className="page-grid">
      <PageHeader
        title="مأموریت هوشمند و دیسپچ پویا"
        subtitle="مدیریت لحظه‌ای جریان ترافیک ناوگان، پایش صف شاول‌ها و تخصیص بهینه مسیر با هوش مصنوعی"
        label="سامانه دیسپچ IIoT"
      />

      {/* Tactical Interactive Mine Map */}
      <Card
        title="نقشه تاکتیکی پیت معدن و موقعیت ناوگان"
        subtitle="موقعیت لحظه‌ای شاول‌ها، سنگ‌شکن‌ها، دپوها و کامیون‌های فعال"
        actions={
          <Button
            size="sm"
            icon={<WandSparkles size={15} />}
            loading={loading}
            onClick={() => void getRecommendation()}
          >
            محاسبه بهینه‌ترین مأموریت
          </Button>
        }
      >
        <div className="mine-map-container">
          <div className="mine-map">
            <div className="map-grid-bg" />

            {/* SVG Tactical Route Lines */}
            <svg viewBox="0 0 100 100" className="map-lines" aria-hidden="true">
              {/* Mine Haul Road Network */}
              <path d="M 15,25 Q 25,20 35,15" fill="none" />
              <path d="M 35,15 Q 55,30 75,45" fill="none" />
              <path d="M 30,45 L 75,45" fill="none" />
              <path d="M 45,65 Q 60,55 75,45" fill="none" />
              <path d="M 20,70 L 45,65" fill="none" />
              <path d="M 75,45 Q 80,30 85,20" fill="none" />
              <path d="M 75,45 Q 82,60 88,70" fill="none" />

              {/* Active Animated Route */}
              <line
                x1="55"
                y1="48"
                x2="30"
                y2="45"
                className="active-route"
              />
              <line
                x1="30"
                y1="45"
                x2="75"
                y2="45"
                className="active-route"
              />
            </svg>

            {/* Interactive Nodes */}
            {mineMapNodes.map((node) => {
              const queueCount = queues.find((q) => q.shovel === node.id)?.trucks
              const isSelected = selectedNode?.id === node.id

              return (
                <div
                  key={node.id}
                  className={`${getNodeClass(node)} ${isSelected ? 'map-node--selected' : ''}`}
                  style={{
                    insetInlineStart: `${node.x}%`,
                    top: `${node.y}%`,
                    borderWidth: isSelected ? 2 : 1,
                  }}
                  onClick={() => setSelectedNode(node)}
                >
                  <MapPin size={12} />
                  <span>{node.id}</span>
                  {queueCount !== undefined && (
                    <span
                      className="map-node-badge"
                      style={{
                        backgroundColor: queueCount > 5 ? 'var(--danger)' : 'rgba(255,255,255,0.2)',
                      }}
                    >
                      {queueCount} صف
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Map Legend */}
          <div className="map-legend">
            <div className="map-legend-item">
              <span className="pulse-dot" style={{ background: 'var(--primary)', width: 8, height: 8 }} />
              <span>کامیون شما ({mission.truckId})</span>
            </div>
            <div className="map-legend-item">
              <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--primary-dark)' }} />
              <span>شاول استخراج</span>
            </div>
            <div className="map-legend-item">
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#38bdf8' }} />
              <span>سنگ‌شکن مرکزی</span>
            </div>
            <div className="map-legend-item">
              <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--success)' }} />
              <span>دپوی باطله / مواد</span>
            </div>
            <div className="map-legend-item">
              <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--danger)' }} />
              <span>شاول پرترافیک (ازدحام صف)</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Shovel Queues & Current Mission Status */}
      <div className="two-col-grid">
        <Card title="وضعیت ترافیک و صف شاول‌ها" subtitle="تعداد کامیون‌های منتظر بارگیری در هر نقطه">
          <ul className="fleet-list">
            {queues.map((item) => {
              const isCongested = item.trucks >= 6
              const isAssigned = mission.fromShovel === item.shovel

              return (
                <li
                  key={item.shovel}
                  style={{
                    borderInlineStart: isAssigned
                      ? '4px solid var(--primary)'
                      : isCongested
                        ? '4px solid var(--danger)'
                        : '1px solid var(--border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Layers size={16} className="muted" />
                    <strong>{item.shovel}</strong>
                    {isAssigned && (
                      <span
                        style={{
                          fontSize: 11,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--primary-bg)',
                          color: 'var(--primary)',
                          fontWeight: 700,
                        }}
                      >
                        مأموریت شما
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="mono" style={{ fontWeight: 700 }}>
                      {item.trucks} کامیون
                    </span>
                    <StatusBadge
                      label={isCongested ? 'ترافیک سنگین' : item.trucks <= 2 ? 'روان و سریع' : 'متوسط'}
                      tone={isCongested ? 'danger' : item.trucks <= 2 ? 'success' : 'warning'}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>

        <Card title="اطلاعات مأموریت جاری" subtitle={`کامیون ${mission.truckId} در مسیر عملیات`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
              <div>
                <span className="muted" style={{ fontSize: 12 }}>مسیر تخصیص‌یافته:</span>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{mission.fromShovel}</span>
                  <ArrowRight size={16} className="muted" />
                  <span>{mission.toCrusher}</span>
                </div>
              </div>
              <StatusBadge label={mission.status} tone="success" />
            </div>

            <div className="four-col" style={{ gap: 8 }}>
              <div style={{ background: 'var(--surface)', padding: 10, borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <span className="muted" style={{ fontSize: 11 }}>فاصله:</span>
                <div className="mono" style={{ fontWeight: 700, marginTop: 2 }}>{mission.distanceKm} km</div>
              </div>
              <div style={{ background: 'var(--surface)', padding: 10, borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <span className="muted" style={{ fontSize: 11 }}>زمان تا مقصد:</span>
                <div className="mono" style={{ fontWeight: 700, marginTop: 2, color: 'var(--primary)' }}>{mission.etaMin} دقیقه</div>
              </div>
              <div style={{ background: 'var(--surface)', padding: 10, borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <span className="muted" style={{ fontSize: 11 }}>زمان کل چرخه:</span>
                <div className="mono" style={{ fontWeight: 700, marginTop: 2 }}>{mission.cycleTimeMin} دقیقه</div>
              </div>
              <div style={{ background: 'var(--surface)', padding: 10, borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <span className="muted" style={{ fontSize: 11 }}>پایش سرعت:</span>
                <div className="mono success-text" style={{ fontWeight: 700, marginTop: 2 }}>استاندارد</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* AI Recommendation Result Box */}
      {recommendation && (
        <Card
          title="پیشنهاد بهینه‌سازی مسیر دیسپچ هوشمند"
          subtitle={recommendation.label}
          actions={<Sparkles size={20} style={{ color: 'var(--primary)' }} />}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius)',
                background: 'var(--warning-bg)',
                border: '1px solid var(--warning-border)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <AlertTriangle size={20} className="warning-text" />
              <span style={{ fontWeight: 600, fontSize: 13 }}>
                هشدار ازدحام: در Shovel 02 تعداد ۸ کامیون در صف انتظار هستند (زمان انتظار تقریبی: ۱۸ دقیقه).
              </span>
            </div>

            <div className="three-col">
              <div style={{ background: 'var(--surface)', padding: 14, borderRadius: 'var(--radius)' }}>
                <span className="muted" style={{ fontSize: 12 }}>مسیر بهینه پیشنهادی:</span>
                <p style={{ fontWeight: 800, fontSize: '1.1rem', marginTop: 4, color: 'var(--primary)' }}>
                  {mission.truckId} → {recommendation.recommendedShovel} → {mission.toCrusher}
                </p>
              </div>

              <div style={{ background: 'var(--surface)', padding: 14, borderRadius: 'var(--radius)' }}>
                <span className="muted" style={{ fontSize: 12 }}>زمان چرخه جدید:</span>
                <p className="mono" style={{ fontWeight: 800, fontSize: '1.1rem', marginTop: 4 }}>
                  {recommendation.estimatedCycleTime} دقیقه{' '}
                  <span className="muted" style={{ fontSize: 12, textDecoration: 'line-through' }}>
                    ({mission.cycleTimeMin} دقیقه)
                  </span>
                </p>
              </div>

              <div style={{ background: 'var(--surface)', padding: 14, borderRadius: 'var(--radius)' }}>
                <span className="muted" style={{ fontSize: 12 }}>بهبود و صرفه‌جویی زمان:</span>
                <p className="success-text mono" style={{ fontWeight: 800, fontSize: '1.1rem', marginTop: 4 }}>
                  +{recommendation.estimatedImprovement}٪ سریع‌تر
                </p>
              </div>
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              <strong>دلیل الگوریتم هوشمند:</strong> {recommendation.reason}
            </p>

            <div className="actions-row">
              <Button
                size="md"
                loading={applying}
                icon={<CheckCircle2 size={18} />}
                onClick={() => void applyRecommendation()}
              >
                {applying ? 'در حال ارسال فرمان دیسپچ...' : 'تأیید و اعمال مأموریت جدید در ناوبری'}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
