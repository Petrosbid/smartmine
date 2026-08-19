import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { routes } from '../constants/routes'
import { useAppState } from '../context/AppStateContext'
import { AIAssistantPage } from '../pages/AIAssistantPage'
import { ComparisonPage } from '../pages/ComparisonPage'
import { DashboardPage } from '../pages/DashboardPage'
import { DispatchPage } from '../pages/DispatchPage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { NotificationsPage } from '../pages/NotificationsPage'
import { PerformancePage } from '../pages/PerformancePage'
import { PerformanceResultPage } from '../pages/PerformanceResultPage'
import { ProfilePage } from '../pages/ProfilePage'
import { SimulationPage } from '../pages/SimulationPage'
import { TelemetryPage } from '../pages/TelemetryPage'
import { VehicleHealthPage } from '../pages/VehicleHealthPage'

const Protected = ({ children }: { children: ReactNode }) => {
  const { session } = useAppState()
  if (!session.isAuthenticated) {
    return <Navigate to={routes.login} replace />
  }
  return children
}

export const AppRouter = () => {
  const { session } = useAppState()

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            to={session.isAuthenticated ? routes.dashboard : routes.login}
            replace
          />
        }
      />
      <Route path={routes.login} element={<LoginPage />} />

      <Route
        path="/"
        element={
          <Protected>
            <AppShell />
          </Protected>
        }
      >
        <Route path={routes.dashboard.slice(1)} element={<DashboardPage />} />
        <Route path={routes.performance.slice(1)} element={<PerformancePage />} />
        <Route path={routes.performanceResult.slice(1)} element={<PerformanceResultPage />} />
        <Route path={routes.dispatch.slice(1)} element={<DispatchPage />} />
        <Route path={routes.vehicleHealth.slice(1)} element={<VehicleHealthPage />} />
        <Route path={routes.telemetry.slice(1)} element={<TelemetryPage />} />
        <Route path={routes.aiAssistant.slice(1)} element={<AIAssistantPage />} />
        <Route path={routes.simulation.slice(1)} element={<SimulationPage />} />
        <Route path={routes.comparison.slice(1)} element={<ComparisonPage />} />
        <Route path={routes.notifications.slice(1)} element={<NotificationsPage />} />
        <Route path={routes.profile.slice(1)} element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
