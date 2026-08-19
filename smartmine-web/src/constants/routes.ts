export const routes = {
  login: '/login',
  dashboard: '/dashboard',
  performance: '/performance',
  performanceResult: '/performance/result',
  dispatch: '/dispatch',
  vehicleHealth: '/vehicle-health',
  telemetry: '/telemetry',
  aiAssistant: '/ai-assistant',
  simulation: '/simulation',
  comparison: '/comparison',
  notifications: '/notifications',
  profile: '/profile',
} as const

export type AppRoute = (typeof routes)[keyof typeof routes]

export const protectedRoutes: AppRoute[] = [
  routes.dashboard,
  routes.performance,
  routes.performanceResult,
  routes.dispatch,
  routes.vehicleHealth,
  routes.telemetry,
  routes.aiAssistant,
  routes.simulation,
  routes.comparison,
  routes.notifications,
  routes.profile,
]
