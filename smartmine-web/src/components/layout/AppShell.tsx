import { useState, type ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { AppHeader } from './AppHeader'
import { Sidebar } from './Sidebar'

export const AppShell = ({ children }: { children?: ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleCollapse = (): void => {
    setCollapsed((prev) => !prev)
  }

  const closeMobile = (): void => {
    setMobileOpen(false)
  }

  return (
    <div className="app-shell">
      <div className={`app-shell__sidebar-wrap ${mobileOpen ? 'open' : ''}`}>
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={toggleCollapse}
          closeMobile={closeMobile}
        />
      </div>

      {mobileOpen && (
        <button
          aria-label="بستن منو"
          className="app-shell__backdrop"
          type="button"
          onClick={closeMobile}
        />
      )}

      <div className="app-shell__content">
        <AppHeader onMenuClick={() => setMobileOpen(true)} />
        <main>{children ?? <Outlet />}</main>
      </div>
    </div>
  )
}
