import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Layers,
  MapPin,
  Play,
  Sparkles,
  WandSparkles,
} from 'lucide-react'

import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { ProgressBar } from '../components/ui/ProgressBar'
import { StatusBadge } from '../components/ui/StatusBadge'
import { useAppState } from '../context/AppStateContext'
import { mineMapNodes, shovelQueues as fallbackQueues } from '../data/mockData'
import { smartmineApi } from '../services/api/smartmineApi'
import type { DispatchNode, DispatchRecommendation } from '../types/domain'

interface MissionPhaseItem {
  key: string
  label: string
  icon: string
}

const MISSION_PHASES: MissionPhaseItem[] = [
  { key: 'assigned', label: 'تخصیص اولیه', icon: '📋' },
  { key: 'en_route_to_shovel', label: 'حرکت به شاول', icon: '🚛' },
  { key: 'waiting_for_loading', label: 'صف بارگیری', icon: '⏳' },
  { key: 'loading', label: 'بارگیری مواد', icon: '⛏️' },
  { key: 'hauling', label: 'حمل به سنگ‌شکن', icon: '🚚' },
  { key: 'waiting_for_dump', label: 'صف تخلیه', icon: '⏱️' },
  { key: 'dumping', label: 'تخلیه سنگ‌شکن', icon: '🏭' },
  { key: 'completed', label: 'تکمیل چرخه', icon: '✅' },
]

export const DispatchPage = () => {
  const { mission, setMission, showToast } = useAppState()
  const [loading, setLoading] = useState(false)
  const [applying, setApplying] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
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

  // Dynamic congestion detection from real queues
  const congestedShovels = queues.filter((q) => q.trucks >= 5)

  // Current Mission Phase indexing
  const currentStatusCode = mission.statusCode || 'en_route_to_shovel'
  const currentPhaseIndex = Math.max(
    0,
    MISSION_PHASES.findIndex((p) => p.key === currentStatusCode || p.label === mission.status),
  )

  const advanceMissionPhase = async (): Promise<void> => {
    const nextIndex = (currentPhaseIndex + 1) % MISSION_PHASES.length
    const nextPhase = MISSION_PHASES[nextIndex]
    setTransitioning(true)

    try {
      if (mission.missionId) {
        const updated = await smartmineApi.transitionMission(mission.missionId, nextPhase.key)
        setMission(updated)
      } else {
        setMission({
          ...mission,
          status: nextPhase.label,
          statusCode: nextPhase.key,
        })
      }
      showToast(`فاز مأموریت تغییر یافت: ${nextPhase.label}`, 'success')
    } catch {
      setMission({
        ...mission,
        status: nextPhase.label,
        statusCode: nextPhase.key,
      })
      showToast(`فاز مأموریت تغییر یافت: ${nextPhase.label}`, 'neutral')
    } finally {
      setTransitioning(false)
    }

  }

  const getNodeClass = (node: DispatchNode): string => {
    if (node.id === mission.truckId) return 'map-node map-node--active-truck'
    const isCongested = queues.some((q) => q.shovel === node.id && q.trucks >= 5)
    if (isCongested) return 'map-node map-node--shovel map-node--congested'
    return `map-node map-node--${node.type}`
  }

  return (
    <div className="page-grid">
      <PageHeader
        title="مأموریت هوشمند و دیسپچ پویا"
        subtitle="مدیریت لحظه‌ای جریان ترافیک ناوگان، پایش صف شاول‌ها و تخصیص بهینه مسیر با هوش مصنوعی"
        label="سامانه دیسپچ IIoT"
      />

      {/* Dynamic Pit Congestion Alert Banner */}
      {congestedShovels.length > 0 && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 'var(--radius)',
            background: 'var(--warning-bg)',
            border: '1px solid var(--warning-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertTriangle size={22} className="warning-text" />
            <div>
              <strong style={{ color: 'var(--text-primary)', fontSize: 14 }}>
                هشدار ازدحام در جبهه بارگیری معدن:
              </strong>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
                {congestedShovels.map((s) => `${s.shovel} (${s.trucks} کامیون در صف)`).join(' و ')}{' '}
                دارای ترافیک سنگین و معطلی بالای ۱۵ دقیقه هستند.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            icon={<WandSparkles size={14} />}
            loading={loading}
            onClick={() => void getRecommendation()}
          >
            پیشنهاد مسیر جایگزین
          </Button>
        </div>
      )}

      {/* Interactive Tactical Mine Map */}
      <Card
        title="نقشه تاکتیکی پیت معدن و موقعیت لحظه‌ای ناوگان"
        subtitle="موقعیت جغرافیایی شاول‌ها، سنگ‌شکن‌ها، دپوها و کامیون‌های فعال با به‌روزرسانی IIoT"
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
              <path d="M 15,25 Q 25,20 35,15" fill="none" />
              <path d="M 35,15 Q 55,30 75,45" fill="none" />
              <path d="M 30,45 L 75,45" fill="none" />
              <path d="M 45,65 Q 60,55 75,45" fill="none" />
              <path d="M 20,70 L 45,65" fill="none" />
              <path d="M 75,45 Q 80,30 85,20" fill="none" />
              <path d="M 75,45 Q 82,60 88,70" fill="none" />

              {/* Active Animated Route */}
              <line x1="55" y1="48" x2="30" y2="45" className="active-route" />
              <line x1="30" y1="45" x2="75" y2="45" className="active-route" />
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
                        backgroundColor: queueCount >= 5 ? 'var(--danger)' : 'rgba(255,255,255,0.2)',
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

      {/* Selected Node Details Card (if selected) */}
      {selectedNode && (
        <Card
          title={`جزئیات نود جغرافیایی: ${selectedNode.id}`}
          subtitle={`نوع تجهیز: ${selectedNode.type === 'shovel' ? 'شاول بارگیری سنگ' : selectedNode.type === 'crusher' ? 'سنگ‌شکن فکی' : 'دپوی مواد معدنی'}`}
          actions={
            <Button size="sm" variant="ghost" onClick={() => setSelectedNode(null)}>
              بستن
            </Button>
          }
        >
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ background: 'var(--surface)', padding: '10px 16px', borderRadius: 'var(--radius-sm)' }}>
              <span className="muted" style={{ fontSize: 12 }}>مختصات نقشه:</span>
              <div className="mono" style={{ fontWeight: 700, marginTop: 2 }}>
                X: {selectedNode.x}% | Y: {selectedNode.y}%
              </div>
            </div>
            {queues.find((q) => q.shovel === selectedNode.id) && (
              <div style={{ background: 'var(--surface)', padding: '10px 16px', borderRadius: 'var(--radius-sm)' }}>
                <span className="muted" style={{ fontSize: 12 }}>تعداد کامیون در صف:</span>
                <div className="mono" style={{ fontWeight: 700, marginTop: 2, color: 'var(--primary)' }}>
                  {queues.find((q) => q.shovel === selectedNode.id)?.trucks} دستگاه
                </div>
              </div>
            )}
            <div style={{ background: 'var(--surface)', padding: '10px 16px', borderRadius: 'var(--radius-sm)' }}>
              <span className="muted" style={{ fontSize: 12 }}>وضعیت اتصال IIoT:</span>
              <div className="success-text" style={{ fontWeight: 700, marginTop: 2 }}>
                ● آنلاین و متصل
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Mission Lifecycle State Machine & Timeline */}
      <Card
        title="فازهای چرخه عملیات باربری (Mission State Machine)"
        subtitle="پایش گام‌به‌گام چرخه ترابری از تخصیص اولیه تا تخلیه نهایی در سنگ‌شکن"
        actions={
          <Button
            size="sm"
            variant="ghost"
            icon={<Play size={14} />}
            loading={transitioning}
            onClick={() => void advanceMissionPhase()}
          >
            گام بعدی عملیات
          </Button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
              gap: 8,
            }}
          >
            {MISSION_PHASES.map((phase, idx) => {
              const isPast = idx < currentPhaseIndex
              const isCurrent = idx === currentPhaseIndex

              return (
                <div
                  key={phase.key}
                  style={{
                    padding: '10px 8px',
                    borderRadius: 'var(--radius-sm)',
                    textAlign: 'center',
                    background: isCurrent
                      ? 'var(--primary-bg)'
                      : isPast
                        ? 'rgba(34, 197, 94, 0.1)'
                        : 'var(--surface)',
                    border: isCurrent
                      ? '2px solid var(--primary)'
                      : isPast
                        ? '1px solid rgba(34, 197, 94, 0.4)'
                        : '1px solid var(--border)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ fontSize: 18, marginBottom: 4 }}>
                    {isPast ? '✅' : phase.icon}
                  </div>
                  <strong
                    style={{
                      fontSize: 12,
                      display: 'block',
                      color: isCurrent
                        ? 'var(--primary)'
                        : isPast
                          ? 'var(--success)'
                          : 'var(--text-secondary)',
                    }}
                  >
                    {phase.label}
                  </strong>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                    گام {idx + 1} از ۸
                  </span>
                </div>
              )
            })}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 14px',
              background: 'var(--surface)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 13,
            }}
          >
            <span className="muted">
              وضعیت فعال: <strong style={{ color: 'var(--primary)' }}>{mission.status}</strong>
            </span>
            <span className="muted">
              پیشرفت چرخه: <strong className="mono">{Math.round(((currentPhaseIndex + 1) / 8) * 100)}٪</strong>
            </span>
          </div>
        </div>
      </Card>

      {/* Shovel Queues & Current Mission Status */}
      <div className="two-col-grid">
        <Card title="وضعیت ترافیک و صف شاول‌ها" subtitle="تعداد کامیون‌های منتظر بارگیری در هر نقطه">
          <ul className="fleet-list">
            {queues.map((item) => {
              const isCongested = item.trucks >= 5
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
                <div className="mono" style={{ fontWeight: 700, marginTop: 2, color: 'var(--primary)' }}>
                  {mission.etaMin} دقیقه
                </div>
              </div>
              <div style={{ background: 'var(--surface)', padding: 10, borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <span className="muted" style={{ fontSize: 11 }}>زمان کل چرخه:</span>
                <div className="mono" style={{ fontWeight: 700, marginTop: 2 }}>
                  {mission.cycleTimeMin} دقیقه
                </div>
              </div>
              <div style={{ background: 'var(--surface)', padding: 10, borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <span className="muted" style={{ fontSize: 11 }}>پایش سرعت:</span>
                <div className="mono success-text" style={{ fontWeight: 700, marginTop: 2 }}>
                  استاندارد
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* AI Recommendation Result Box & Multi-Criteria Score Breakdown */}
      {recommendation && (
        <Card
          title="پیشنهاد بهینه‌سازی مسیر دیسپچ هوشمند"
          subtitle={recommendation.label}
          actions={<Sparkles size={20} style={{ color: 'var(--primary)' }} />}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                <span className="muted" style={{ fontSize: 12 }}>صرفه‌جویی زمان چرخه:</span>
                <p className="success-text mono" style={{ fontWeight: 800, fontSize: '1.1rem', marginTop: 4 }}>
                  +{recommendation.estimatedImprovement}٪ سریع‌تر
                </p>
              </div>
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
              <strong>تحلیل الگوریتم بهینه‌سازی:</strong> {recommendation.reason}
            </p>

            {/* Algorithm Score Breakdown Visualizer */}
            {recommendation.scoreBreakdown && (
              <div
                style={{
                  background: 'var(--surface)',
                  padding: 14,
                  borderRadius: 'var(--radius)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <strong style={{ fontSize: 13 }}>تفکیک امتیاز ۵ عاملی الگوریتم دیسپچ:</strong>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
                      <span className="muted">مؤلفه طول صف (۳۰٪):</span>
                      <span className="mono">{recommendation.scoreBreakdown.queue_weight ?? 85}%</span>
                    </div>
                    <ProgressBar value={recommendation.scoreBreakdown.queue_weight ?? 85} tone="primary" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
                      <span className="muted">مؤلفه فاصله مکانی (۲۰٪):</span>
                      <span className="mono">{recommendation.scoreBreakdown.distance_weight ?? 90}%</span>
                    </div>
                    <ProgressBar value={recommendation.scoreBreakdown.distance_weight ?? 90} tone="success" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
                      <span className="muted">مؤلفه زمان سفر (۲۰٪):</span>
                      <span className="mono">{recommendation.scoreBreakdown.travel_time_weight ?? 88}%</span>
                    </div>
                    <ProgressBar value={recommendation.scoreBreakdown.travel_time_weight ?? 88} tone="success" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
                      <span className="muted">وضعیت شاول (۱۵٪):</span>
                      <span className="mono">{recommendation.scoreBreakdown.availability_weight ?? 100}%</span>
                    </div>
                    <ProgressBar value={recommendation.scoreBreakdown.availability_weight ?? 100} tone="primary" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
                      <span className="muted">سلامت فنی خودرو (۱۵٪):</span>
                      <span className="mono">{recommendation.scoreBreakdown.health_weight ?? 84}%</span>
                    </div>
                    <ProgressBar value={recommendation.scoreBreakdown.health_weight ?? 84} tone="primary" />
                  </div>
                </div>
              </div>
            )}

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

