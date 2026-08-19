import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'
import {
  demoDriver,
  fleetStatus as initialFleetStatus,
  initialDashboardKpi,
  initialMission,
  initialNotifications,
  initialTelemetry,
  vehicleHealthData,
} from '../data/mockData'
import { mapDashboardKpi, mapFleet } from '../services/api/mappers'
import { smartmineApi } from '../services/api/smartmineApi'
import type {
  AIMessage,
  DashboardKpi,
  Driver,
  FleetVehicle,
  Mission,
  NotificationItem,
  PerformanceScoreResult,
  Telemetry,
  VehicleHealth,
} from '../types/domain'

interface SessionState {
  isAuthenticated: boolean
  driver: Driver
  token: string | null
}

interface ToastState {
  message: string
  tone: 'success' | 'warning' | 'danger' | 'neutral'
}

interface LoginPayload {
  driverId: string
  truckId: string
  shift: 'صبح' | 'عصر' | 'شب'
}

interface AppStateContextValue {
  session: SessionState
  login: (payload: LoginPayload) => Promise<void>
  logout: () => void
  telemetry: Telemetry
  setTelemetry: (telemetry: Telemetry) => void
  mission: Mission
  setMission: (mission: Mission) => void
  dashboardKpi: DashboardKpi
  setDashboardKpi: Dispatch<SetStateAction<DashboardKpi>>
  performanceResult: PerformanceScoreResult | null
  setPerformanceResult: (result: PerformanceScoreResult | null) => void
  vehicleHealth: VehicleHealth
  setVehicleHealth: (health: VehicleHealth) => void
  fleetStatus: FleetVehicle[]
  notifications: NotificationItem[]
  setNotifications: Dispatch<SetStateAction<NotificationItem[]>>
  aiMessages: AIMessage[]
  setAiMessages: Dispatch<SetStateAction<AIMessage[]>>
  presentationMode: boolean
  togglePresentationMode: () => void
  toast: ToastState | null
  showToast: (message: string, tone?: ToastState['tone']) => void
  clearToast: () => void
}

const STORAGE_KEY = 'smartmine-auth-v1'

const AppStateContext = createContext<AppStateContextValue | null>(null)

const readStoredSession = (): SessionState => {
  if (typeof window === 'undefined') {
    return {
      isAuthenticated: false,
      driver: demoDriver,
      token: null,
    }
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return {
      isAuthenticated: false,
      driver: demoDriver,
      token: null,
    }
  }

  try {
    const parsed = JSON.parse(raw) as { token: string; driver: Driver }
    return {
      isAuthenticated: true,
      driver: parsed.driver,
      token: parsed.token,
    }
  } catch {
    return {
      isAuthenticated: false,
      driver: demoDriver,
      token: null,
    }
  }
}

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<SessionState>(readStoredSession)
  const [telemetry, setTelemetryState] = useState<Telemetry>(initialTelemetry)
  const [mission, setMission] = useState<Mission>(initialMission)
  const [dashboardKpi, setDashboardKpi] = useState<DashboardKpi>(initialDashboardKpi)
  const [performanceResult, setPerformanceResult] = useState<PerformanceScoreResult | null>(null)
  const [vehicleHealth, setVehicleHealth] = useState<VehicleHealth>(vehicleHealthData)
  const [fleetStatus, setFleetStatus] = useState<FleetVehicle[]>(initialFleetStatus)
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications)
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([])
  const [presentationMode, setPresentationMode] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await smartmineApi.login(payload)
    const mappedDriver = smartmineApi.mapDriver(response.driver)

    const nextSession: SessionState = {
      isAuthenticated: true,
      driver: {
        ...mappedDriver,
        truckId: response.truck.id,
      },
      token: response.access_token,
    }

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          token: response.access_token,
          driver: nextSession.driver,
        }),
      )
    }

    setSession(nextSession)
  }, [])

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY)
    }
    setSession({
      isAuthenticated: false,
      driver: demoDriver,
      token: null,
    })
  }, [])

  const setTelemetry = useCallback((next: Telemetry) => {
    setTelemetryState(next)
  }, [])

  const togglePresentationMode = useCallback(() => {
    setPresentationMode((prev) => !prev)
  }, [])

  const showToast = useCallback((message: string, tone: ToastState['tone'] = 'neutral') => {
    setToast({ message, tone })
  }, [])

  const clearToast = useCallback(() => {
    setToast(null)
  }, [])

  useEffect(() => {
    if (!session.isAuthenticated) return

    const load = async (): Promise<void> => {
      try {
        const [dashboard, health, notificationsResponse] = await Promise.all([
          smartmineApi.getDashboard(session.driver.id),
          smartmineApi.getVehicleHealth(session.driver.truckId),
          smartmineApi.getNotifications(),
        ])

        setSession((prev) => ({
          ...prev,
          driver: {
            ...smartmineApi.mapDriver(dashboard.driver),
            truckId: dashboard.truck.id,
          },
        }))

        if (dashboard.telemetry) {
          setTelemetryState(smartmineApi.mapTelemetry(dashboard.telemetry))
        }

        if (dashboard.current_mission) {
          setMission(smartmineApi.mapMission(dashboard.current_mission))
        }

        setDashboardKpi(mapDashboardKpi(dashboard.performance.overall_score, dashboard.current_mission ? smartmineApi.mapMission(dashboard.current_mission) : null))
        setFleetStatus(mapFleet(dashboard.fleet))
        setVehicleHealth(health)
        setNotifications(notificationsResponse)
      } catch {
        // Keep UI functional with existing state if backend load fails.
      }
    }

    void load()
  }, [session.driver.id, session.driver.truckId, session.isAuthenticated])

  const value = useMemo<AppStateContextValue>(
    () => ({
      session,
      login,
      logout,
      telemetry,
      setTelemetry,
      mission,
      setMission,
      dashboardKpi,
      setDashboardKpi,
      performanceResult,
      setPerformanceResult,
      vehicleHealth,
      setVehicleHealth,
      fleetStatus,
      notifications,
      setNotifications,
      aiMessages,
      setAiMessages,
      presentationMode,
      togglePresentationMode,
      toast,
      showToast,
      clearToast,
    }),
    [
      aiMessages,
      clearToast,
      dashboardKpi,
      fleetStatus,
      login,
      logout,
      mission,
      notifications,
      performanceResult,
      presentationMode,
      session,
      setTelemetry,
      showToast,
      telemetry,
      toast,
      togglePresentationMode,
      vehicleHealth,
    ],
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export const useAppState = (): AppStateContextValue => {
  const context = useContext(AppStateContext)

  if (!context) {
    throw new Error('useAppState must be used inside AppStateProvider')
  }

  return context
}


