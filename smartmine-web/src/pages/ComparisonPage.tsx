import { useEffect, useMemo, useState } from 'react'
import {
  BarChart3,
  CheckCircle2,
  Leaf,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '../components/ui/Card'
import { ChartTooltip } from '../components/ui/ChartTooltip'
import { LoadingState } from '../components/ui/LoadingState'
import { PageHeader } from '../components/ui/PageHeader'
import { comparisonMetrics as fallbackComparison } from '../data/mockData'
import { smartmineApi } from '../services/api/smartmineApi'
import type { ComparisonMetric } from '../types/domain'

export const ComparisonPage = () => {
  const [metrics, setMetrics] = useState<ComparisonMetric[]>(fallbackComparison)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async (): Promise<void> => {
      try {
        const response = await smartmineApi.getComparison()
        if (response && response.length > 0) {
          setMetrics(response)
        }
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const chartData = useMemo(
    () =>
      metrics.map((item) => ({
        name: item.label,
        سنتی: item.traditional,
        هوشمند: item.smart,
      })),
    [metrics],
  )

  return (
    <div className="page-grid">
      <PageHeader
        title="ارزیابی سامانه و مقایسه عملکرد"
        subtitle="تحلیل تطبیقی شاخص‌های کلیدی عملیات معدن در روش سنتی و سامانه هوشمند مبتنی بر IIoT"
        label="گزارش بازده سرمایه‌گذاری (ROI)"
      />

      {loading ? (
        <LoadingState message="در حال استخراج داده‌های مقایسه‌ای..." />
      ) : (
        <>
          {/* Key Value Add Metric Badges */}
          <div className="four-col">
            <Card title="افزایش تناژ استخراج">
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <strong className="mono success-text" style={{ fontSize: '1.6rem', fontWeight: 800 }}>
                  +۱۱.۴٪
                </strong>
                <span className="muted" style={{ fontSize: 12 }}>۹,۳۸۰ vs ۸,۴۲۰ تن</span>
              </div>
              <p className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                به دلیل حذف توقف‌های غیرضروری و ترافیک
              </p>
            </Card>

            <Card title="کاهش زمان انتظار در صف">
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <strong className="mono success-text" style={{ fontSize: '1.6rem', fontWeight: 800 }}>
                  -۳۳.۷٪
                </strong>
                <span className="muted" style={{ fontSize: 12 }}>۶.۱ vs ۹.۲ دقیقه</span>
              </div>
              <p className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                با توزیع هوشمند و یکنواخت کامیون‌ها
              </p>
            </Card>

            <Card title="کاهش زمان بیکاری ناوگان">
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <strong className="mono success-text" style={{ fontSize: '1.6rem', fontWeight: 800 }}>
                  -۴۰.۴٪
                </strong>
                <span className="muted" style={{ fontSize: 12 }}>۳۱ vs ۵۲ دقیقه</span>
              </div>
              <p className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                بهبود راندمان زمانی شیفت رانندگان
              </p>
            </Card>

            <Card title="صرفه‌جویی در مصرف سوخت">
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <strong className="mono success-text" style={{ fontSize: '1.6rem', fontWeight: 800 }}>
                  -۱۱.۰٪
                </strong>
                <span className="muted" style={{ fontSize: 12 }}>۳۶۵ vs ۴۱۰ لیتر</span>
              </div>
              <p className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                کاهش درجا کارکردن و بهینه‌سازی سرعت
              </p>
            </Card>
          </div>

          {/* Comparison Bar Chart */}
          <Card
            title="نمودار مقایسه شاخص‌های عملیاتی"
            subtitle="مقایسه مستقیم مقادیر عددی روش سنتی و سامانه هوشمند"
            actions={<BarChart3 size={18} style={{ color: 'var(--primary)' }} />}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 15, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={11} />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 10, direction: 'rtl' }}
                  formatter={(value) => <span style={{ color: 'var(--text-primary)', fontSize: 12 }}>{value}</span>}
                />
                <Bar dataKey="سنتی" name="روش سنتی" fill="#94a3b8" radius={[6, 6, 0, 0]} />
                <Bar dataKey="هوشمند" name="روش هوشمند SmartMine" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Detailed Metric Lists */}
          <div className="two-col-grid">
            <Card
              title="سامانه سنتی (پیش از استقرار IIoT)"
              subtitle="مبتنی بر بیسیم و تصمیم‌گیری دستی"
            >
              <ul className="metric-list">
                {metrics.map((metric) => (
                  <li key={metric.label}>
                    <span className="muted">{metric.label}</span>
                    <strong className="mono" style={{ color: 'var(--text-secondary)' }}>
                      {metric.traditional} {metric.unit}
                    </strong>
                  </li>
                ))}
              </ul>
            </Card>

            <Card
              title="سامانه هوشمند SmartMine"
              subtitle="مبتنی بر اینترنت اشیا، دیسپچ پویا و هوش مصنوعی"
              actions={<CheckCircle2 size={18} className="success-text" />}
            >
              <ul className="metric-list">
                {metrics.map((metric) => (
                  <li key={metric.label} style={{ borderInlineStart: '3px solid var(--success)' }}>
                    <span>{metric.label}</span>
                    <strong className="mono success-text">
                      {metric.smart} {metric.unit}
                    </strong>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Business & Environmental Value */}
          <Card
            title="ارزش افزوده اقتصادی و زیست‌محیطی"
            subtitle="دستاوردهای ملموس استقرار هوش مصنوعی در مجتمع معدنی"
            actions={<Leaf size={18} className="success-text" />}
          >
            <div className="three-col">
              <div style={{ background: 'var(--surface)', padding: 14, borderRadius: 'var(--radius)' }}>
                <span className="muted" style={{ fontSize: 12 }}>کاهش آلایندگی کربن:</span>
                <p className="success-text" style={{ fontWeight: 700, fontSize: '1.05rem', marginTop: 4 }}>
                  ۱۲۴ تن کاهش CO₂ سالانه
                </p>
              </div>

              <div style={{ background: 'var(--surface)', padding: 14, borderRadius: 'var(--radius)' }}>
                <span className="muted" style={{ fontSize: 12 }}>کاهش استهلاک لاستیک و ترمز:</span>
                <p className="success-text" style={{ fontWeight: 700, fontSize: '1.05rem', marginTop: 4 }}>
                  +۲۲٪ افزایش طول عمر قطعات
                </p>
              </div>

              <div style={{ background: 'var(--surface)', padding: 14, borderRadius: 'var(--radius)' }}>
                <span className="muted" style={{ fontSize: 12 }}>صرفه‌جویی مالی مستقیم:</span>
                <p className="success-text mono" style={{ fontWeight: 800, fontSize: '1.05rem', marginTop: 4 }}>
                  ~۳.۸ میلیارد تومان در سال
                </p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
