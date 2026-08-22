import { Bell, LogOut, Menu, User } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { routes } from '../../constants/routes'
import { useAppState } from '../../context/AppStateContext'

const titleMap: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'داشبورد عملیاتی', subtitle: 'نمای کلی و شاخص‌های کلیدی' },
  '/performance': { title: 'ثبت عملکرد شیفت', subtitle: 'ثبت و ارزیابی داده‌های تولید و ایمنی' },
  '/performance/result': { title: 'نتیجه ارزیابی عملکرد', subtitle: 'تحلیل هوشمند و امتیازدهی' },
  '/dispatch': { title: 'مأموریت هوشمند', subtitle: 'تخصیص پویا و نقشه تاکتیکی معدن' },
  '/vehicle-health': { title: 'سلامت کامیون', subtitle: 'پایش وضعیت و نگهداری پیش‌بینانه' },
  '/telemetry': { title: 'داده‌های لحظه‌ای IoT', subtitle: 'جریان زنده سنسورها و وضعیت شبکه' },
  '/ai-assistant': { title: 'دستیار هوشمند SmartMine AI', subtitle: 'تحلیل و راهنمایی هوشمند عملیاتی' },
  '/simulation': { title: 'شبیه‌سازی عملیات معدن', subtitle: 'مدل‌سازی پارامترهای ناوگان و تولید' },
  '/comparison': { title: 'ارزیابی سامانه', subtitle: 'مقایسه عملکرد سنتی در برابر هوشمند' },
  '/notifications': { title: 'هشدارها و رویدادها', subtitle: 'گزارش وقایع و هشدارهای ایمنی' },
  '/profile': { title: 'پروفایل راننده', subtitle: 'اطلاعات فردی، سوابق و رتبه عملکرد' },
}

interface AppHeaderProps {
  onMenuClick: () => void
}

export const AppHeader = ({ onMenuClick }: AppHeaderProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { session, logout, notifications } = useAppState()
  const pageInfo = titleMap[location.pathname] ?? { title: 'داشبورد', subtitle: 'SmartMine' }
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <header className="top-header">
      <div className="top-header__main">
        <button
          type="button"
          className="icon-btn mobile-only"
          onClick={onMenuClick}
          aria-label="باز کردن منوی ناوبری"
        >
          <Menu size={18} />
        </button>
        <div>
          <p className="top-header__crumb">SmartMine / {pageInfo.title}</p>
          <h2>{pageInfo.title}</h2>
        </div>
      </div>

      <div className="top-header__meta">
        <div className="meta-chip">
          <span>{session.driver.name}</span>
          <small>شناسه: {session.driver.id}</small>
        </div>

        <div className="meta-chip">
          <span>کامیون {session.driver.truckId}</span>
          <small>شیفت {session.driver.shift}</small>
        </div>

        <div className="meta-chip meta-chip--pulse">
          <span className="pulse-dot" />
          <span className="success-text" style={{ fontSize: 13, fontWeight: 700 }}>
            IIoT آنلاین
          </span>
        </div>

        <button
          className={`icon-btn ${location.pathname === routes.notifications ? 'icon-btn--active' : ''}`}
          type="button"
          aria-label="اعلان‌ها"
          title="اعلان‌ها"
          onClick={() => navigate(routes.notifications)}
        >
          <Bell size={18} />
          {unreadCount > 0 && <span className="icon-btn__badge">{unreadCount}</span>}
        </button>


        <button
          className={`icon-btn ${location.pathname === routes.profile ? 'icon-btn--active' : ''}`}
          type="button"
          aria-label="پروفایل راننده"
          title="پروفایل راننده"
          onClick={() => navigate(routes.profile)}
        >
          <User size={18} />
        </button>

        <button
          className="icon-btn"
          type="button"
          onClick={logout}
          aria-label="خروج از سامانه"
          title="خروج از حساب کاربری"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
