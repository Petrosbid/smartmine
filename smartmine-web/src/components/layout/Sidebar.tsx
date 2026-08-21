import {
  Activity,
  Bell,
  Bot,
  ChevronLeft,
  ChevronRight,
  Gauge,
  GitCompareArrows,
  HeartPulse,
  LayoutDashboard,
  Pickaxe,
  Route,
  User,
  Waves,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { routes } from '../../constants/routes'
import { DEMO_MODE } from '../../data/mockData'
import { useAppState } from '../../context/AppStateContext'

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  closeMobile: () => void
}

const navItems = [
  { to: routes.dashboard, label: 'داشبورد', icon: LayoutDashboard },
  { to: routes.performance, label: 'عملکرد من', icon: Gauge },
  { to: routes.dispatch, label: 'مأموریت هوشمند', icon: Route },
  { to: routes.vehicleHealth, label: 'سلامت کامیون', icon: HeartPulse },
  { to: routes.telemetry, label: 'داده‌های لحظه‌ای', icon: Waves },
  { to: routes.aiAssistant, label: 'دستیار هوشمند AI', icon: Bot },
  { to: routes.simulation, label: 'شبیه‌سازی عملیات', icon: Activity },
  { to: routes.comparison, label: 'ارزیابی سامانه', icon: GitCompareArrows },
  { to: routes.notifications, label: 'هشدارها', icon: Bell, hasBadge: true },
  { to: routes.profile, label: 'پروفایل', icon: User },
]

export const Sidebar = ({ collapsed, onToggleCollapse, closeMobile }: SidebarProps) => {
  const { notifications } = useAppState()
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar__header">
        <div className="sidebar__brand">
          <div className="sidebar__logo" aria-hidden="true">
            <Pickaxe size={20} />
          </div>
          {!collapsed && (
            <div className="sidebar__brand-info">
              <strong>SmartMine</strong>
              <p>مدیریت ناوگان معدن</p>
            </div>
          )}
        </div>

        <button
          type="button"
          className="sidebar__toggle-btn"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'گسترش منو' : 'جمع کردن منو'}
          title={collapsed ? 'گسترش منو' : 'جمع کردن منو'}
        >
          {collapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      <nav aria-label="منوی اصلی" className="sidebar__nav">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={closeMobile}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
            >
              <Icon size={19} />
              {!collapsed && <span>{item.label}</span>}
              {item.hasBadge && unreadCount > 0 && (
                <span className="sidebar__link-badge">{unreadCount}</span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {!collapsed && (
        <footer className="sidebar__footer">
          <div className="sidebar__footer-item">
            <span>وضعیت سامانه</span>
            <span className="success-text" style={{ fontSize: 12 }}>
              <span className="pulse-dot" style={{ width: 6, height: 6 }} /> متصل
            </span>
          </div>
          <div className="sidebar__footer-item">
            <span>حالت Demo</span>
            <span className="mono" style={{ color: 'var(--primary)' }}>
              {DEMO_MODE ? 'فعال' : 'غیرفعال'}
            </span>
          </div>
        </footer>
      )}
    </aside>
  )
}
