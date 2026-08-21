import { FileQuestion, Home } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { routes } from '../constants/routes'

export const NotFoundPage = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        background: 'var(--bg-deep)',
      }}
    >
      <Card
        style={{
          maxWidth: 480,
          textAlign: 'center',
          padding: '36px 28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 'var(--radius-lg)',
            background: 'var(--primary-bg)',
            color: 'var(--primary)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <FileQuestion size={36} />
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>صفحه مورد نظر یافت نشد</h1>
        <p className="muted" style={{ fontSize: '0.94rem', lineHeight: 1.6 }}>
          آدرسی که وارد کرده‌اید در سامانه مدیریت هوشمند SmartMine وجود ندارد یا ممکن است منتقل شده باشد.
        </p>

        <Link to={routes.dashboard} style={{ marginTop: 8 }}>
          <Button size="lg" icon={<Home size={18} />}>
            بازگشت به داشبورد عملیاتی
          </Button>
        </Link>
      </Card>
    </div>
  )
}
