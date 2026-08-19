import { Bell, LogOut, Menu, Monitor, User } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Button } from '../ui/Button'
import { useAppState } from '../../context/AppStateContext'

const titleMap: Record<string, string> = {
  '/dashboard': 'داشبورد',
  '/performance': 'ثبت عملکرد شیفت',
  '/performance/result': 'نتیجه عملکرد',
  '/dispatch': 'مأموریت هوشمند',
  '/vehicle-health': 'سلامت کامیون',
  '/telemetry': 'داده‌های لحظه‌ای IoT',
  '/ai-assistant': 'SmartMine AI',
  '/simulation': 'شبیه‌سازی عملیات معدن',
  '/comparison': 'ارزیابی سامانه',
  '/notifications': 'هشدارها و رویدادها',
  '/profile': 'پروفایل راننده',
}

interface AppHeaderProps {
  onMenuClick: () => void
}

export const AppHeader = ({ onMenuClick }: AppHeaderProps) => {
  const location = useLocation()
  const { session, logout, presentationMode, togglePresentationMode } = useAppState()

  return (
    <header className="top-header">
      <div className="top-header__main">
        <button type="button" className="icon-btn mobile-only" onClick={onMenuClick} aria-label="باز کردن منو">
          <Menu size={18} />
        </button>
        <div>
          <p className="top-header__crumb">SmartMine / {titleMap[location.pathname] ?? 'صفحه'}</p>
          <h2>{titleMap[location.pathname] ?? 'داشبورد'}</h2>
        </div>
      </div>

      <div className="top-header__meta">
        <div className="meta-chip">
          <span>{session.driver.name}</span>
          <small>{session.driver.id}</small>
        </div>
        <div className="meta-chip">
          <span>کامیون {session.driver.truckId}</span>
          <small>شیفت {session.driver.shift}</small>
        </div>
        <div className="meta-chip">
          <span className="status-text status-text--success">● متصل</span>
          <small>وضعیت شبکه</small>
        </div>
        <button className="icon-btn" type="button" aria-label="اعلان‌ها">
          <Bell size={18} />
        </button>
        <Button
          type="button"
          variant="ghost"
          onClick={togglePresentationMode}
          icon={<Monitor size={16} />}
        >
          {presentationMode ? 'حالت عادی' : 'Presentation'}
        </Button>
        <button className="icon-btn" type="button" aria-label="پروفایل">
          <User size={18} />
        </button>
        <button className="icon-btn" type="button" onClick={logout} aria-label="خروج">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
