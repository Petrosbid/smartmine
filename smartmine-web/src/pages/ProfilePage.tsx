import { useEffect, useState } from 'react'
import {
  Award,
  CheckCircle2,
  Clock,
  Medal,
  Shield,
  ShieldCheck,
  Star,
  Truck,
  User,
  Weight,
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { LoadingState } from '../components/ui/LoadingState'
import { PageHeader } from '../components/ui/PageHeader'
import { StatCard } from '../components/ui/StatCard'
import { useAppState } from '../context/AppStateContext'
import { smartmineApi } from '../services/api/smartmineApi'

interface ProfileStats {
  averagePerformance: number
  missionCount: number
  payloadTon: number
  safetyIndex: number
}

const initialStats: ProfileStats = {
  averagePerformance: 88,
  missionCount: 142,
  payloadTon: 5120,
  safetyIndex: 96,
}

export const ProfilePage = () => {
  const { session } = useAppState()
  const [stats, setStats] = useState<ProfileStats>(initialStats)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async (): Promise<void> => {
      try {
        const profile = await smartmineApi.getProfile(session.driver.id)
        setStats({
          averagePerformance: Math.round(profile.average_performance),
          missionCount: profile.mission_count,
          payloadTon: Math.round(profile.payload_total_ton),
          safetyIndex: Math.round(profile.safety_index),
        })
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [session.driver.id])

  return (
    <div className="page-grid">
      <PageHeader
        title="پروفایل و کارنامه راننده"
        subtitle="اطلاعات شغلی، سوابق مأموریت‌ها و رتبه‌بندی عملکرد در مجتمع معدنی"
        label="پروفایل کاربری"
      />

      {/* Driver Identity Hero Card */}
      <Card className="result-hero">
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', width: '100%' }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, rgba(229, 169, 60, 0.3), rgba(229, 169, 60, 0.1))',
              border: '1px solid var(--border-glow)',
              color: 'var(--primary)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <User size={44} />
          </div>

          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{session.driver.name}</h2>
              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--primary-bg)',
                  color: 'var(--primary)',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                کد راننده: {session.driver.id}
              </span>
            </div>

            <p className="muted" style={{ fontSize: '0.94rem', margin: '4px 0 10px' }}>
              {session.driver.role} — بخش استخراج پیت مرکزی
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 13 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Truck size={15} style={{ color: 'var(--primary)' }} />
                کامیون تخصیص‌یافته: <strong>{session.driver.truckId}</strong>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Clock size={15} style={{ color: 'var(--info-text)' }} />
                شیفت کاری فعال: <strong>شیفت {session.driver.shift}</strong>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={15} className="success-text" />
                وضعیت گواهینامه: <strong>فعال (سطح یک معدنی)</strong>
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Aggregate Stats */}
      {loading ? (
        <LoadingState message="در حال دریافت آمار عملکردی راننده..." />
      ) : (
        <section className="kpi-grid">
          <StatCard
            label="میانگین امتیاز عملکرد"
            value={`${stats.averagePerformance} / ۱۰۰`}
            icon={<Award size={18} />}
            trend={{ value: 'رتبه برتر', direction: 'up' }}
            hint="محاسبه میانگین ۳۰ روزه"
          />
          <StatCard
            label="تعداد کل مأموریت‌های موفق"
            value={`${stats.missionCount} مأموریت`}
            icon={<CheckCircle2 size={18} />}
            hint="نرخ تکمیل: ۹۹.۲٪"
          />
          <StatCard
            label="مجموع تناژ استخراجی حمل‌شده"
            value={`${stats.payloadTon.toLocaleString('fa-IR')} تن`}
            icon={<Weight size={18} />}
            hint="سنگ آهن و باطله"
          />
          <StatCard
            label="شاخص ایمنی و انضباط"
            value={`${stats.safetyIndex}٪`}
            icon={<Shield size={18} />}
            trend={{ value: 'بدون حادثه', direction: 'up' }}
            hint="صفر خطای پرخطر"
          />
        </section>
      )}

      {/* Badges and Certifications */}
      <div className="two-col-grid">
        <Card title="نشان‌ها و دستاوردهای کاری" subtitle="تقدیرنامه‌های هوشمند ثبت‌شده در سامانه">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                background: 'var(--surface)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
              }}
            >
              <Medal size={24} style={{ color: 'var(--primary)' }} />
              <div>
                <strong style={{ fontSize: '0.95rem' }}>راننده برتر شیفت صبح (مهر ۱۴۰۳)</strong>
                <p className="muted" style={{ fontSize: 12 }}>کسب بالاترین امتیاز بهره‌وری و تناژ</p>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                background: 'var(--surface)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
              }}
            >
              <ShieldCheck size={24} className="success-text" />
              <div>
                <strong style={{ fontSize: '0.95rem' }}>نشان زرین ایمنی (۱۰۰ شیفت بدون حادثه)</strong>
                <p className="muted" style={{ fontSize: 12 }}>پایبندی کامل به سرعت مجاز و حریم شاول‌ها</p>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                background: 'var(--surface)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
              }}
            >
              <Star size={24} style={{ color: '#38bdf8' }} />
              <div>
                <strong style={{ fontSize: '0.95rem' }}>رانندگی اقتصادی و بهینه سوخت</strong>
                <p className="muted" style={{ fontSize: 12 }}>کاهش ۱۲٪ مصرف گازوئیل با مدیریت دور آرام موتور</p>
              </div>
            </div>
          </div>
        </Card>

        <Card title="اطلاعات استخدامی و دوره‌ها" subtitle="مدیریت منابع انسانی مجتمع معدنی">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
              <span className="muted">تاریخ شروع همکاری:</span>
              <strong className="mono">۱۴۰۱/۰۲/۱۵</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
              <span className="muted">آخرین دوره بازآموزی ایمنی:</span>
              <span>دوره الزامات تردد در پیت معدن (تأیید شده)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
              <span className="muted">پایش سلامت دوره‌ای:</span>
              <span className="success-text">تأییدیه طب کار معتبر</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="muted">مسئول دیسپچ ناظر:</span>
              <strong>مهندس رضایی (مرکز کنترل مرکزی)</strong>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
