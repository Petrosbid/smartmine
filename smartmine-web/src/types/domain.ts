export type ShiftType = 'صبح' | 'عصر' | 'شب'

export type StatusLevel = 'success' | 'warning' | 'danger' | 'neutral'

export interface Driver {
  id: string
  name: string
  role: string
  shift: ShiftType
  truckId: string
}

export interface Telemetry {
  gps: string
  speed: number
  rpm: number
  engineTemp: number
  oilPressure: 'Normal' | 'Low' | 'High'
  tirePressure: number
  vibration: number
  payloadTon: number
  fuelPercent: number
  updatedAt: number
}

export interface Mission {
  truckId: string
  fromShovel: string
  toCrusher: string
  distanceKm: number
  etaMin: number
  status: 'در حال حرکت' | 'منتظر' | 'آماده'
  cycleTimeMin: number
}

export interface FleetVehicle {
  id: string
  status: 'Online' | 'Offline' | 'Warning'
}

export interface DashboardKpi {
  performanceScore: number
  hauledTon: number
  cycleCount: number
  productiveHours: string
}

export interface PerformanceInput {
  cycleCount: number
  hauledTon: number
  averageCycleTime: number
  waitTime: number
  idleTime: number
  fuelConsumption: number
  overspeedEvents: number
  hardBrakeEvents: number
  safetyEvents: number
  routeCompliance: number
  notes: string
}

export interface PerformanceScoreResult {
  productionScore: number
  efficiencyScore: number
  safetyScore: number
  fuelScore: number
  overallScore: number
  positiveFactors: string[]
  improvementFactors: string[]
}

export interface DispatchRecommendation {
  recommendedShovel: string
  estimatedCycleTime: number
  estimatedImprovement: number
  reason: string
  label: string
}

export interface VehicleComponentHealth {
  name: string
  score: number
  statusText: string
  statusLevel: StatusLevel
}

export interface VehicleHealth {
  truckId: string
  overallScore: number
  components: VehicleComponentHealth[]
  predictiveNote: string
  predictiveLevel: StatusLevel
}

export type NotificationCategory = 'all' | 'safety' | 'vehicle' | 'mission' | 'system'

export interface NotificationItem {
  id: string
  title: string
  timeAgo: string
  category: Exclude<NotificationCategory, 'all'>
  level: StatusLevel
  read: boolean
}

export interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: number
}

export interface SimulationConfig {
  trucks: 30 | 40 | 50
  shovels: number
  dumpPoints: number
  durationHours: 1 | 4 | 8
}

export interface SimulationResult {
  producedTon: number
  avgQueueMin: number
  avgCycleMin: number
  idleMin: number
  fuelLiters: number
  efficiencyPercent: number
}

export interface ComparisonMetric {
  label: string
  traditional: number
  smart: number
  unit: string
}

export interface DispatchNode {
  id: string
  type: 'shovel' | 'crusher' | 'dump' | 'truck'
  x: number
  y: number
}
