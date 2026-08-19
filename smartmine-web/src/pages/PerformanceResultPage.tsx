import { Download, Printer, Sparkles } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { CircularScore } from '../components/ui/CircularScore'
import { PageHeader } from '../components/ui/PageHeader'
import { routes } from '../constants/routes'
import { useAppState } from '../context/AppStateContext'
import { performanceTrend } from '../data/mockData'

export const PerformanceResultPage = () => {
  const { performanceResult } = useAppState()

  if (!performanceResult) {
    return <Navigate to={routes.performance} replace />
  }

  return (
    <div className="page-grid">
      <PageHeader title="امتیاز عملکرد" subtitle="تحلیل هوشمند عملکرد" />

      <Card className="result-hero">
        <CircularScore score={performanceResult.overallScore} />
        <div>
          <h3>{performanceResult.overallScore >= 80 ? 'عملکرد خوب' : 'نیازمند بهبود'}</h3>
          <p>تحلیل عددی با الگوریتم وزن‌دهی تولید، بهره‌وری، ایمنی و سوخت انجام شده است.</p>
        </div>
      </Card>

      <div className="kpi-grid">
        <Card title="تولید">{performanceResult.productionScore}</Card>
        <Card title="بهره‌وری">{performanceResult.efficiencyScore}</Card>
        <Card title="ایمنی">{performanceResult.safetyScore}</Card>
        <Card title="مصرف سوخت">{performanceResult.fuelScore}</Card>
      </div>

      <div className="two-col-grid">
        <Card title="عوامل مؤثر بر امتیاز">
          <h4>نکات مثبت</h4>
          <ul>
            {performanceResult.positiveFactors.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
          <h4>فرصت‌های بهبود</h4>
          <ul>
            {performanceResult.improvementFactors.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </Card>

        <Card title="تحلیل هوشمند عملکرد" actions={<Sparkles size={16} />}>
          <p>
            عملکرد کلی شما در این شیفت مطلوب است. بیشترین فرصت بهبود مربوط به کاهش زمان چرخه و مدیریت
            زمان‌های توقف است.
          </p>
        </Card>
      </div>

      <Card title="عملکرد 7 روز اخیر">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={performanceTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="day" stroke="var(--text-secondary)" />
            <YAxis stroke="var(--text-secondary)" />
            <Tooltip />
            <Bar dataKey="score" fill="var(--primary)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="actions-row">
        <Button icon={<Sparkles size={16} />}>دریافت پیشنهادهای بهبود</Button>
        <Button variant="ghost" icon={<Download size={16} />}>اشتراک گزارش</Button>
        <Button variant="ghost" icon={<Printer size={16} />}>چاپ گزارش</Button>
      </div>
    </div>
  )
}
