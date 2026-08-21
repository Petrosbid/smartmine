import { useEffect, useState } from 'react'
import { AlertCircle, Cpu, LogIn, Pickaxe, Radio, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { routes } from '../constants/routes'
import { demoDriver } from '../data/mockData'
import { useAppState } from '../context/AppStateContext'

const demoProfiles = [
  { id: 'D-102', truck: 'T-27', shift: 'صبح' as const, label: 'راننده شیفت صبح (D-102)' },
  { id: 'D-105', truck: 'T-22', shift: 'عصر' as const, label: 'راننده شیفت عصر (D-105)' },
  { id: 'D-110', truck: 'T-21', shift: 'شب' as const, label: 'راننده شیفت شب (D-110)' },
]

export const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAppState()
  const [driverId, setDriverId] = useState(demoDriver.id)
  const [truckId, setTruckId] = useState(demoDriver.truckId)
  const [shift, setShift] = useState<'صبح' | 'عصر' | 'شب'>(demoDriver.shift)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      )
    }
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [])

  const applyPreset = (profile: (typeof demoProfiles)[0]) => {
    setDriverId(profile.id)
    setTruckId(profile.truck)
    setShift(profile.shift)
    setError('')
  }

  const handleLogin = async (e?: React.FormEvent): Promise<void> => {
    if (e) e.preventDefault()
    if (!driverId.trim() || !truckId.trim() || !shift.trim()) {
      setError('لطفاً تمامی فیلدهای ورود را تکمیل نمایید.')
      return
    }

    setError('')
    setLoading(true)

    try {
      await login({
        driverId: driverId.trim(),
        truckId: truckId.trim(),
        shift,
      })
      navigate(routes.dashboard)
    } catch {
      setError('ورود به سامانه با خطا مواجه شد. اتصال خود را بررسی کنید.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-bg" aria-hidden="true" />
      <Card className="login-card">
        <div className="login-head">
          <div className="login-head__icon">
            <Pickaxe size={26} />
          </div>
          <h1>سامانه هوشمند SmartMine</h1>
          <p>مرکز مدیریت و هدایت ناوگان ماشین‌آلات معدنی</p>
        </div>

        <div className="quick-presets">
          <p>پروفایل‌های پیش‌فرض تست و دمو:</p>
          <div className="quick-presets__row">
            {demoProfiles.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`preset-chip ${driverId === p.id ? 'preset-chip--active' : ''}`}
                onClick={() => applyPreset(p)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleLogin} className="form-grid">
          <label>
            شناسه راننده
            <input
              type="text"
              value={driverId}
              placeholder="مثال: D-102"
              onChange={(event) => setDriverId(event.target.value)}
              required
            />
          </label>

          <label>
            شناسه کامیون
            <input
              type="text"
              value={truckId}
              placeholder="مثال: T-27"
              onChange={(event) => setTruckId(event.target.value)}
              required
            />
          </label>

          <label>
            شیفت کاری
            <select
              value={shift}
              onChange={(event) => setShift(event.target.value as 'صبح' | 'عصر' | 'شب')}
            >
              <option value="صبح">شیفت صبح (۰۶:۰۰ الی ۱۴:۰۰)</option>
              <option value="عصر">شیفت عصر (۱۴:۰۰ الی ۲۲:۰۰)</option>
              <option value="شب">شیفت شب (۲۲:۰۰ الی ۰۶:۰۰)</option>
            </select>
          </label>

          {error && (
            <div className="error-box">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            block
            size="lg"
            icon={<LogIn size={18} />}
            loading={loading}
          >
            {loading ? 'در حال احراز هویت...' : 'ورود به سامانه'}
          </Button>
        </form>

        <div className="login-status">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Radio size={14} className="success-text" />
            شبکه IIoT فعال
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Cpu size={14} style={{ color: 'var(--primary)' }} />
            موتور AI آنلاین
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={14} style={{ color: '#38bdf8' }} />
            ساعت: {currentTime || '...'}
          </span>
        </div>
      </Card>
    </div>
  )
}
