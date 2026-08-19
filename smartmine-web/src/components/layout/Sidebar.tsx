import {
  Activity,
  Bell,
  Bot,
  Gauge,
  GitCompareArrows,
  HeartPulse,
  LayoutDashboard,
  Route,
  User,
  Waves,
  Wrench,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { routes } from '../../constants/routes'
import { DEMO_MODE } from '../../data/mockData'

interface SidebarProps {
  collapsed: boolean
  closeMobile: () => void
}

const navItems = [
  { to: routes.dashboard, label: 'داشبورد', icon: LayoutDashboard },
  { to: routes.performance, label: 'عملکرد من', icon: Gauge },
  { to: routes.dispatch, label: 'مأموریت هوشمند', icon: Route },
  { to: routes.vehicleHealth, label: 'سلامت کامیون', icon: HeartPulse },
  { to: routes.telemetry, label: 'داده‌های لحظه‌ای', icon: Waves },
  { to: routes.aiAssistant, label: 'دستیار هوشمند', icon: Bot },
  { to: routes.simulation, label: 'شبیه‌سازی عملیات', icon: Activity },
  { to: routes.comparison, label: 'مقایسه عملکرد', icon: GitCompareArrows },
  { to: routes.notifications, label: 'هشدارها', icon: Bell },
  { to: routes.profile, label: 'پروفایل', icon: User },
]

export const Sidebar = ({ collapsed, closeMobile }: SidebarProps) => {
  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar__brand">
        <div className="sidebar__logo" aria-hidden="true">
          <Wrench size={16} />
        </div>
        {!collapsed && (
          <div>
            <strong>SmartMine</strong>
            <p>سامانه هوشمند مدیریت ناوگان معدن</p>
          </div>
        )}
      </div>

      <nav aria-label="منوی اصلی" className="sidebar__nav">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={closeMobile}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
            >
              <Icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>

      {!collapsed && (
        <footer className="sidebar__footer">
          <div>
            <p>وضعیت سامانه</p>
            <span className="status-text status-text--success">● متصل</span>
          </div>
          <div>
            <p>حالت Demo</p>
            <span className="status-text">{DEMO_MODE ? 'فعال' : 'غیرفعال'}</span>
          </div>
        </footer>
      )}
    </aside>
  )
}
