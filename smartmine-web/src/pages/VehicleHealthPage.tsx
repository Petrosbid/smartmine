import { useState } from 'react'
import {
  Activity,
  AlertTriangle,
  Cog,
  Disc,
  Droplet,
  Flame,
  HeartPulse,
  RotateCw,
  Sparkles,
  Wrench,
} from 'lucide-react'
import {
  Area,
  AreaChart,
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
import { ProgressBar } from '../components/ui/ProgressBar'
import { StatusBadge } from '../components/ui/StatusBadge'
import { useAppState } from '../context/AppStateContext'
import { healthTrend } from '../data/mockData'

const componentIcons: Record<string, typeof HeartPulse> = {
  موتور: Flame,
  گیربکس: Cog,
  'لاستیک‌ها': Disc,
  ترمز: Disc,
  ارتعاش: Activity,
  روغن: Droplet,
}

export const VehicleHealthPage = () => {
  const { vehicleHealth, showToast } = useAppState()
  const [activeChart, setActiveChart] = useState<'temp' | 'vibration' | 'oil' | 'tire'>('temp')

  const handleRequestService = (): void => {
    showToast('درخواست بازبینی فنی برای کامیون در سامانه نگهداری و تعمیرات (نت) ثبت شد', 'success')
  }

  return (
    <div className="page-grid">
      <PageHeader
        title={`سلامت فنی کامیون ${vehicleHealth.truckId}`}
        subtitle={`پایش پیوسته وضعیت سنسورها و سامانه عیب‌یابی پیش‌بینانه (Predictive Maintenance)`}
        label="پایش آنلاین سیستم‌های مکانیکی"
      />

      {/* Overall Health Score Card */}
      <Card className="result-hero">
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', width: '100%' }}>
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: 'var(--radius-lg)',
              background: 'var(--success-bg)',
              border: '1px solid var(--success-border)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--success-text)',
            }}
          >
            <strong className="mono" style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>
              {vehicleHealth.overallScore}٪
            </strong>
            <span style={{ fontSize: 11, marginTop: 4 }}>سلامت کلی</span>
          </div>

          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>وضعیت فنی ناوگان: مطلوب و آماده به کار</h3>
              <StatusBadge
                label={vehicleHealth.overallScore >= 80 ? 'سطح عادی' : 'نیازمند سرویس'}
                tone={vehicleHealth.overallScore >= 80 ? 'success' : 'warning'}
              />
            </div>
            <p className="muted" style={{ fontSize: '0.9rem', margin: '4px 0 10px' }}>
              کلیه سیستم‌های حیاتی شامل ترمزها، گیربکس و فشار هیدرولیک در محدوده سبز قرار دارند.
            </p>
            <ProgressBar value={vehicleHealth.overallScore} tone="success" />
          </div>
        </div>
      </Card>

      {/* Components Health Matrix */}
      <Card
        title="وضعیت اجزای حیاتی و سنسورها"
        subtitle="ارزیابی زنده عملکرد قطعات بر اساس آستانه مجاز استهلاک"
      >
        <div className="three-col">
          {vehicleHealth.components.map((component) => {
            const Icon = componentIcons[component.name] ?? Wrench

            return (
              <div
                key={component.name}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  transition: 'transform var(--transition-fast)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 'var(--radius-sm)',
                        background:
                          component.statusLevel === 'warning'
                            ? 'var(--warning-bg)'
                            : component.statusLevel === 'danger'
                              ? 'var(--danger-bg)'
                              : 'var(--primary-bg)',
                        color:
                          component.statusLevel === 'warning'
                            ? 'var(--warning-text)'
                            : component.statusLevel === 'danger'
                              ? 'var(--danger-text)'
                              : 'var(--primary)',
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      <Icon size={18} />
                    </div>
                    <strong style={{ fontSize: '0.95rem' }}>{component.name}</strong>
                  </div>
                  <StatusBadge label={component.statusText} tone={component.statusLevel} />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span className="muted">شاخص سلامت:</span>
                    <strong className="mono">{component.score}٪</strong>
                  </div>
                  <ProgressBar
                    value={component.score}
                    tone={
                      component.score >= 80
                        ? 'success'
                        : component.score >= 70
                          ? 'warning'
                          : 'danger'
                    }
                  />
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Sensor Trend Charts with Switcher */}
      <Card
        title="روند تغییرات پارامترهای سنسوری"
        subtitle="تاریخچه ۱۰ چرخه اخیر جهت عیب‌یابی رفتاری"
        actions={
          <div style={{ display: 'flex', gap: 6 }}>
            <Button
              size="sm"
              variant={activeChart === 'temp' ? 'primary' : 'ghost'}
              onClick={() => setActiveChart('temp')}
            >
              دمای موتور
            </Button>
            <Button
              size="sm"
              variant={activeChart === 'vibration' ? 'primary' : 'ghost'}
              onClick={() => setActiveChart('vibration')}
            >
              ارتعاش
            </Button>
            <Button
              size="sm"
              variant={activeChart === 'oil' ? 'primary' : 'ghost'}
              onClick={() => setActiveChart('oil')}
            >
              فشار روغن
            </Button>
            <Button
              size="sm"
              variant={activeChart === 'tire' ? 'primary' : 'ghost'}
              onClick={() => setActiveChart('tire')}
            >
              فشار تایر
            </Button>
          </div>
        }
      >
        <ResponsiveContainer width="100%" height={240}>
          {activeChart === 'temp' ? (
            <LineChart data={healthTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="idx" name="چرخه" stroke="var(--text-muted)" fontSize={11} />
              <YAxis domain={[75, 95]} stroke="var(--text-muted)" fontSize={11} />
              <Tooltip content={<ChartTooltip unit="°C" />} />
              <Line
                type="monotone"
                dataKey="engineTemp"
                name="دمای موتور"
                stroke="var(--warning)"
                strokeWidth={2.5}
                dot={{ r: 4, fill: 'var(--warning)' }}
              />
            </LineChart>
          ) : activeChart === 'vibration' ? (
            <AreaChart data={healthTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="idx" name="چرخه" stroke="var(--text-muted)" fontSize={11} />
              <YAxis domain={[0.1, 0.6]} stroke="var(--text-muted)" fontSize={11} />
              <Tooltip content={<ChartTooltip unit="g" />} />
              <Area
                type="monotone"
                dataKey="vibration"
                name="ارتعاش"
                stroke="var(--danger)"
                fill="var(--danger-bg)"
                strokeWidth={2}
              />
            </AreaChart>
          ) : activeChart === 'oil' ? (
            <LineChart data={healthTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="idx" name="چرخه" stroke="var(--text-muted)" fontSize={11} />
              <YAxis domain={[40, 65]} stroke="var(--text-muted)" fontSize={11} />
              <Tooltip content={<ChartTooltip unit="PSI" />} />
              <Line
                type="monotone"
                dataKey="oilPressure"
                name="فشار روغن"
                stroke="#38bdf8"
                strokeWidth={2.5}
              />
            </LineChart>
          ) : (
            <LineChart data={healthTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="idx" name="چرخه" stroke="var(--text-muted)" fontSize={11} />
              <YAxis domain={[100, 115]} stroke="var(--text-muted)" fontSize={11} />
              <Tooltip content={<ChartTooltip unit="PSI" />} />
              <Line
                type="monotone"
                dataKey="tirePressure"
                name="فشار تایر"
                stroke="var(--success)"
                strokeWidth={2.5}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </Card>

      {/* Predictive Maintenance Action Card */}
      <Card
        title="سامانه نگهداری پیش‌بینانه (PdM)"
        subtitle="پیش‌بینی عیوب احتمالی پیش از رخداد توقف ناخواسته"
        actions={<Sparkles size={18} style={{ color: 'var(--warning-text)' }} />}
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
              gap: 12,
            }}
          >
            <AlertTriangle size={22} className="warning-text" />
            <div>
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>هشدار زودهنگام ارتعاش موتور</span>
              <p style={{ fontSize: 13, marginTop: 3, color: 'var(--text-secondary)' }}>
                {vehicleHealth.predictiveNote}
              </p>
            </div>
          </div>

          <div className="actions-row">
            <Button
              size="md"
              icon={<Wrench size={16} />}
              onClick={handleRequestService}
            >
              ثبت درخواست بازرسی فنی در پنجره تعمیرات
            </Button>
            <Button
              size="md"
              variant="ghost"
              icon={<RotateCw size={16} />}
              onClick={() => showToast('داده‌های سلامت خودرو بازخوانی شد', 'neutral')}
            >
              به‌روزرسانی داده‌های سنسوری
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
