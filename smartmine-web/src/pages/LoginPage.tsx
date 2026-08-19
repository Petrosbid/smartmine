import { LogIn } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { routes } from '../constants/routes'
import { DEMO_MODE, demoDriver } from '../data/mockData'
import { ApiError } from '../services/api/client'
import { useAppState } from '../context/AppStateContext'

export const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAppState()
  const [driverId, setDriverId] = useState(demoDriver.id)
  const [truckId, setTruckId] = useState(demoDriver.truckId)
  const [shift, setShift] = useState<'صبح' | 'عصر' | 'شب'>(demoDriver.shift)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (): Promise<void> => {
    if (!driverId.trim() || !truckId.trim() || !shift.trim()) return

    setError('')
    setLoading(true)

    try {
      await login({
        driverId: driverId.trim(),
        truckId: truckId.trim(),
        shift,
      })
      navigate(routes.dashboard)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('ورود انجام نشد. اتصال به سرور را بررسی کنید.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-bg" aria-hidden="true" />
      <Card className="login-card">
        <div className="login-head">
          <h1>ورود به SmartMine</h1>
          <p>سامانه هوشمند مدیریت ناوگان معدن</p>
        </div>
        <div className="form-grid">
          <label>
            شناسه راننده
            <input value={driverId} onChange={(event) => setDriverId(event.target.value)} />
          </label>
          <label>
            شناسه کامیون
            <input value={truckId} onChange={(event) => setTruckId(event.target.value)} />
          </label>
          <label>
            شیفت کاری
            <select value={shift} onChange={(event) => setShift(event.target.value as 'صبح' | 'عصر' | 'شب')}>
              <option value="صبح">صبح</option>
              <option value="عصر">عصر</option>
              <option value="شب">شب</option>
            </select>
          </label>
        </div>

        {error && <div className="error-box">{error}</div>}

        <Button block onClick={() => void handleLogin()} icon={<LogIn size={16} />} disabled={loading}>
          {loading ? 'در حال ورود...' : 'ورود به سامانه'}
        </Button>

        <div className="login-status">
          <span>سامانه ● فعال</span>
          <span>شبکه IIoT ● متصل</span>
          <span>حالت Demo: {DEMO_MODE ? 'فعال' : 'غیرفعال'}</span>
        </div>
      </Card>
    </div>
  )
}
