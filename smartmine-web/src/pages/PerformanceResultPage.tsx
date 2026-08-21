import {
  CheckCircle2,
  Copy,
  Download,
  Flame,
  Package,
  Printer,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ChartTooltip } from '../components/ui/ChartTooltip'
import { CircularScore } from '../components/ui/CircularScore'
import { PageHeader } from '../components/ui/PageHeader'
import { ProgressBar } from '../components/ui/ProgressBar'
import { routes } from '../constants/routes'
import { useAppState } from '../context/AppStateContext'
import { performanceTrend } from '../data/mockData'
import type { PerformanceScoreResult } from '../types/domain'

const sampleResult: PerformanceScoreResult = {
  overallScore: 88,
  productionScore: 90,
  efficiencyScore: 84,
  safetyScore: 92,
  fuelScore: 82,
  positiveFactors: [
    'تعداد چرخه‌های موفق بالاتر از میانگین شیفت',
    'پایبندی ۱۰۰٪ به محدوده سرعت و دستورالعمل ایمنی',
    'بارگیری کامل با تناژ بهینه',
  ],
  improvementFactors: [
    'کاهش زمان انتظار با انتخاب شاول‌های کم‌تراکم',
    'مدیریت دور آرام موتور در زمان توقف جهت کاهش سوخت',
  ],
}

export const PerformanceResultPage = () => {
  const navigate = useNavigate()
  const { performanceResult, session, showToast } = useAppState()
  const result = performanceResult ?? sampleResult

  const handlePrint = (): void => {
    window.print()
  }

  const handleShare = async (): Promise<void> => {
    const reportText = `📊 کارنامه عملکرد هوشمند SmartMine
راننده: ${session.driver.name} (${session.driver.id})
کامیون: ${session.driver.truckId} | شیفت: ${session.driver.shift}
------------------------------
🏆 امتیاز کل: ${result.overallScore} از ۱۰۰
📦 نمره تولید: ${result.productionScore}
⚡ نمره راندمان: ${result.efficiencyScore}
🛡️ نمره ایمنی: ${result.safetyScore}
⛽ نمره مصرف سوخت: ${result.fuelScore}
------------------------------
تحلیل شده توسط موتور هوش مصنوعی SmartMine IIoT`

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(reportText)
        showToast('خلاصه گزارش در کلیپ‌بورد کپی شد', 'success')
      } else {
        showToast('امکان دسترسی به کلیپ‌بورد وجود ندارد', 'warning')
      }
    } catch {
      showToast('خطا در کپی متن گزارش', 'danger')
    }
  }

  return (
    <div className="page-grid">
      <PageHeader
        title="کارنامه و نتیجه ارزیابی عملکرد"
        subtitle={`تحلیل جامع شیفت ${session.driver.shift} — راننده ${session.driver.name}`}
        label="گزارش رسمی شیفت"
      />

      {/* Hero Result Banner */}
      <Card className="result-hero" style={{ padding: '24px 30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <CircularScore score={result.overallScore} size={150} strokeWidth={12} />
          <div style={{ flex: 1, minWidth: 240 }}>
            <span
              style={{
                display: 'inline-block',
                padding: '3px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: 12,
                fontWeight: 700,
                background: result.overallScore >= 80 ? 'var(--success-bg)' : 'var(--warning-bg)',
                color: result.overallScore >= 80 ? 'var(--success-text)' : 'var(--warning-text)',
                marginBottom: 8,
              }}
            >
              {result.overallScore >= 85
                ? 'سطح عملکرد: عالی (رتبه ممتاز)'
                : result.overallScore >= 70
                  ? 'سطح عملکرد: استاندارد و مطلوب'
                  : 'سطح عملکرد: نیازمند بهینه‌سازی'}
            </span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px' }}>
              {result.overallScore >= 80
                ? 'عملکرد بسیار شایسته در این شیفت'
                : 'عملکرد قابل قبول با پتانسیل بهبود'}
            </h2>
            <p className="muted" style={{ fontSize: '0.94rem', lineHeight: 1.6 }}>
              ارزیابی بر اساس الگوریتم وزن‌دهی IIoT با احتساب ۳۰٪ تولید، ۳۰٪ ایمنی، ۲۵٪ راندمان زمانی و
              ۱۵٪ مصرف انرژی محاسبه شده است.
            </p>
          </div>
        </div>
      </Card>

      {/* Breakdown Scores */}
      <div className="four-col">
        <Card title="شاخص تولید" actions={<Package size={18} style={{ color: 'var(--primary)' }} />}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span className="muted">امتیاز:</span>
            <strong className="mono" style={{ fontSize: '1.4rem' }}>
              {result.productionScore} / ۱۰۰
            </strong>
          </div>
          <ProgressBar value={result.productionScore} tone="primary" />
        </Card>

        <Card title="بهره‌وری زمانی" actions={<Zap size={18} style={{ color: 'var(--info-text)' }} />}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span className="muted">امتیاز:</span>
            <strong className="mono" style={{ fontSize: '1.4rem' }}>
              {result.efficiencyScore} / ۱۰۰
            </strong>
          </div>
          <ProgressBar value={result.efficiencyScore} tone="success" />
        </Card>

        <Card title="شاخص ایمنی" actions={<Shield size={18} style={{ color: 'var(--success-text)' }} />}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span className="muted">امتیاز:</span>
            <strong className="mono" style={{ fontSize: '1.4rem' }}>
              {result.safetyScore} / ۱۰۰
            </strong>
          </div>
          <ProgressBar value={result.safetyScore} tone="success" />
        </Card>

        <Card title="مدیریت سوخت" actions={<Flame size={18} style={{ color: 'var(--warning-text)' }} />}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span className="muted">امتیاز:</span>
            <strong className="mono" style={{ fontSize: '1.4rem' }}>
              {result.fuelScore} / ۱۰۰
            </strong>
          </div>
          <ProgressBar value={result.fuelScore} tone="warning" />
        </Card>
      </div>

      {/* Factors & AI Analysis */}
      <div className="two-col-grid">
        <Card title="عوامل مؤثر بر امتیاز نهایی" subtitle="تحلیل نقاط قوت و فرصت‌های ارتقا">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <h4 style={{ color: 'var(--success-text)', fontSize: '0.95rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={16} /> نقاط قوت شیفت جاری:
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {result.positiveFactors.map((item) => (
                  <li
                    key={item}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--success-bg)',
                      border: '1px solid var(--success-border)',
                      fontSize: 13,
                    }}
                  >
                    ✓ {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 style={{ color: 'var(--warning-text)', fontSize: '0.95rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={16} /> فرصت‌های بهبود برای شیفت‌های آتی:
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {result.improvementFactors.map((item) => (
                  <li
                    key={item}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--warning-bg)',
                      border: '1px solid var(--warning-border)',
                      fontSize: 13,
                    }}
                  >
                    ⚡ {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        <Card
          title="تحلیل و توصیه‌های هوش مصنوعی"
          subtitle="SmartMine AI Operational Insight"
          actions={<Sparkles size={18} style={{ color: 'var(--primary)' }} />}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ lineHeight: 1.8, fontSize: '0.95rem' }}>
              راننده گرامی، عملکرد کلی شما در رعایت ایمنی و سرعت استاندارد تحسین‌برانگیز است. برای افزایش
              نمره بهره‌وری در شیفت بعد، پیشنهاد می‌شود پیش از ورود به محل بارگیری، وضعیت صف شاول‌ها را در
              بخش <strong>مأموریت هوشمند</strong> بررسی فرمایید.
            </p>
            <div style={{ padding: 12, borderRadius: 'var(--radius)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <span className="muted" style={{ fontSize: 12 }}>توصیه فنی شیفت بعد:</span>
              <p style={{ fontWeight: 600, fontSize: 13, marginTop: 4 }}>
                استفاده از ترمز کمکی هیدرودینامیک (Retarder) در شیب‌های تند جاده خروجی معدن جهت کاهش استهلاک
                لنت‌ها و حفظ دمای ایمن ترمزها.
              </p>
            </div>
            <Button
              size="sm"
              icon={<Sparkles size={15} />}
              onClick={() => navigate(routes.aiAssistant)}
            >
              گفتگو با دستیار هوشمند در مورد این گزارش
            </Button>
          </div>
        </Card>
      </div>

      {/* 7-Day Trend Chart */}
      <Card title="روند مقایسه‌ای عملکرد ۷ روز اخیر" subtitle="سوابق امتیازات شیفت‌های قبلی شما">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={performanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
            <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} />
            <YAxis stroke="var(--text-muted)" domain={[60, 100]} fontSize={11} />
            <Tooltip content={<ChartTooltip unit="از ۱۰۰" />} />
            <Bar dataKey="score" name="امتیاز" fill="var(--primary)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Action Buttons */}
      <div className="actions-row" style={{ marginTop: 8 }}>
        <Button
          size="md"
          icon={<Printer size={16} />}
          onClick={handlePrint}
        >
          چاپ کارنامه عملکرد
        </Button>
        <Button
          size="md"
          variant="ghost"
          icon={<Copy size={16} />}
          onClick={() => void handleShare()}
        >
          کپی و اشتراک گزارش
        </Button>
        <Button
          size="md"
          variant="ghost"
          icon={<Download size={16} />}
          onClick={handlePrint}
        >
          دانلود نسخه PDF
        </Button>
      </div>
    </div>
  )
}
