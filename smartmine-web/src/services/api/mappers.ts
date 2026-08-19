import type {
  AIMessage,
  ComparisonMetric,
  DashboardKpi,
  Driver,
  FleetVehicle,
  Mission,
  NotificationItem,
  PerformanceScoreResult,
  Telemetry,
  VehicleHealth,
} from '../../types/domain'
import type {
  ComparisonResponseDto,
  DispatchRecommendationDto,
  DriverDto,
  MissionDto,
  NotificationDto,
  PerformanceAnalyzeResponseDto,
  TelemetryDto,
  VehicleHealthDto,
} from './types'

const shiftMap: Record<DriverDto['shift'], Driver['shift']> = {
  morning: 'صبح',
  evening: 'عصر',
  night: 'شب',
}

export const toApiShift = (shift: Driver['shift']): DriverDto['shift'] => {
  if (shift === 'صبح') return 'morning'
  if (shift === 'عصر') return 'evening'
  return 'night'
}

const missionStatusMap: Record<string, Mission['status']> = {
  in_progress: 'در حال حرکت',
  waiting: 'منتظر',
  ready: 'آماده',
  completed: 'آماده',
}

const formatRelativeTime = (iso: string): string => {
  const now = Date.now()
  const created = new Date(iso).getTime()
  const diffMinutes = Math.max(0, Math.floor((now - created) / 60000))

  if (diffMinutes < 1) return 'لحظاتی قبل'
  if (diffMinutes < 60) return `${diffMinutes} دقیقه قبل`

  const hours = Math.floor(diffMinutes / 60)
  if (hours < 24) return `${hours} ساعت قبل`

  const days = Math.floor(hours / 24)
  return `${days} روز قبل`
}

const toStatusLevel = (severity: NotificationDto['severity']): 'neutral' | 'warning' | 'danger' => {
  if (severity === 'critical') return 'danger'
  if (severity === 'warning') return 'warning'
  return 'neutral'
}

const toPredictiveLevel = (riskLevel: VehicleHealthDto['predictive_maintenance']['risk_level']): 'success' | 'warning' | 'danger' => {
  if (riskLevel === 'high') return 'danger'
  if (riskLevel === 'medium') return 'warning'
  return 'success'
}

const componentTone = (score: number): 'success' | 'warning' | 'danger' => {
  if (score < 70) return 'danger'
  if (score < 82) return 'warning'
  return 'success'
}

const componentText = (score: number): string => {
  if (score < 70) return 'بحرانی'
  if (score < 82) return 'نیازمند پایش'
  return 'عادی'
}

export const mapDriver = (driver: DriverDto): Driver => ({
  id: driver.id,
  name: driver.name,
  role: 'راننده کامیون معدنی',
  shift: shiftMap[driver.shift],
  truckId: driver.truck_id ?? '-',
})

export const mapTelemetry = (telemetry: TelemetryDto): Telemetry => ({
  gps: `${(telemetry.latitude ?? 0).toFixed(3)}, ${(telemetry.longitude ?? 0).toFixed(3)}`,
  speed: Math.round(telemetry.speed ?? 0),
  rpm: Math.round(telemetry.rpm ?? 0),
  engineTemp: Math.round(telemetry.engine_temperature ?? 0),
  oilPressure:
    (telemetry.oil_pressure ?? 0) < 45
      ? 'Low'
      : (telemetry.oil_pressure ?? 0) > 65
        ? 'High'
        : 'Normal',
  tirePressure: Math.round(telemetry.tire_pressure ?? 0),
  vibration: Number((telemetry.vibration ?? 0).toFixed(2)),
  payloadTon: Number((telemetry.payload ?? 0).toFixed(1)),
  fuelPercent: Math.round(telemetry.fuel_level ?? 0),
  updatedAt: new Date(telemetry.timestamp).getTime(),
})

export const mapMission = (mission: MissionDto): Mission => ({
  truckId: mission.truck_id,
  fromShovel: mission.shovel_id,
  toCrusher: mission.crusher_id,
  distanceKm: Number(mission.distance_km.toFixed(1)),
  etaMin: mission.eta_min,
  status: missionStatusMap[mission.status] ?? 'آماده',
  cycleTimeMin: Number(mission.cycle_time_min.toFixed(1)),
})

export const mapPerformanceResult = (
  performance: PerformanceAnalyzeResponseDto,
): PerformanceScoreResult => ({
  overallScore: Math.round(performance.overall_score),
  productionScore: Math.round(performance.production_score),
  efficiencyScore: Math.round(performance.efficiency_score),
  safetyScore: Math.round(performance.safety_score),
  fuelScore: Math.round(performance.fuel_score),
  positiveFactors: performance.positive_factors,
  improvementFactors: performance.improvement_factors,
})

export const mapDashboardKpi = (overallScore: number, mission?: Mission | null): DashboardKpi => ({
  performanceScore: Math.round(overallScore),
  hauledTon: 0,
  cycleCount: 0,
  productiveHours: mission ? `${Math.max(1, Math.round(8 - mission.etaMin / 60))}h` : '0h',
})

export const mapVehicleHealth = (truckId: string, health: VehicleHealthDto): VehicleHealth => {
  const components = [
    { name: 'موتور', score: health.engine_score },
    { name: 'گیربکس', score: health.transmission_score },
    { name: 'لاستیک‌ها', score: health.tires_score },
    { name: 'ترمز', score: health.brakes_score },
  ]

  return {
    truckId,
    overallScore: Math.round(health.overall_score),
    components: components.map((component) => ({
      name: component.name,
      score: Math.round(component.score),
      statusText: componentText(component.score),
      statusLevel: componentTone(component.score),
    })),
    predictiveNote: `${health.predictive_maintenance.reason} — ${health.predictive_maintenance.recommendation}`,
    predictiveLevel: toPredictiveLevel(health.predictive_maintenance.risk_level),
  }
}

export const mapNotifications = (items: NotificationDto[]): NotificationItem[] =>
  items.map((item) => ({
    id: String(item.id),
    title: item.title,
    timeAgo: formatRelativeTime(item.created_at),
    category: item.type,
    level: toStatusLevel(item.severity),
    read: item.read,
  }))

export const mapFleet = (fleet: {
  total: number
  available: number
  in_mission: number
  offline: number
}): FleetVehicle[] => {
  const result: FleetVehicle[] = []

  for (let i = 0; i < fleet.available; i += 1) {
    result.push({ id: `Available-${i + 1}`, status: 'Online' })
  }
  for (let i = 0; i < fleet.in_mission; i += 1) {
    result.push({ id: `Mission-${i + 1}`, status: 'Online' })
  }
  for (let i = 0; i < fleet.offline; i += 1) {
    result.push({ id: `Offline-${i + 1}`, status: 'Offline' })
  }

  while (result.length < fleet.total) {
    result.push({ id: `Truck-${result.length + 1}`, status: 'Warning' })
  }

  return result
}

export const mapDispatchRecommendation = (
  recommendation: DispatchRecommendationDto,
): {
  recommendedShovel: string
  estimatedCycleTime: number
  estimatedImprovement: number
  reason: string
  label: string
} => ({
  recommendedShovel: recommendation.recommended_shovel,
  estimatedCycleTime: Number(recommendation.estimated_cycle_time.toFixed(1)),
  estimatedImprovement: Number(recommendation.estimated_improvement.toFixed(1)),
  reason: recommendation.reason,
  label: 'پیشنهاد مبتنی بر داده واقعی',
})

export const mapComparison = (comparison: ComparisonResponseDto): ComparisonMetric[] => [
  {
    label: 'تناژ تولید',
    traditional: Number((comparison.traditional.production ?? 0).toFixed(1)),
    smart: Number((comparison.smart.production ?? 0).toFixed(1)),
    unit: 'ton',
  },
  {
    label: 'زمان چرخه',
    traditional: Number((comparison.traditional.average_cycle_time ?? 0).toFixed(1)),
    smart: Number((comparison.smart.average_cycle_time ?? 0).toFixed(1)),
    unit: 'min',
  },
  {
    label: 'زمان انتظار',
    traditional: Number((comparison.traditional.average_queue_time ?? 0).toFixed(1)),
    smart: Number((comparison.smart.average_queue_time ?? 0).toFixed(1)),
    unit: 'min',
  },
  {
    label: 'زمان بیکاری',
    traditional: Number((comparison.traditional.idle_time ?? 0).toFixed(1)),
    smart: Number((comparison.smart.idle_time ?? 0).toFixed(1)),
    unit: 'min',
  },
  {
    label: 'مصرف سوخت',
    traditional: Number((comparison.traditional.fuel_consumption ?? 0).toFixed(1)),
    smart: Number((comparison.smart.fuel_consumption ?? 0).toFixed(1)),
    unit: 'L',
  },
  {
    label: 'بهره‌وری',
    traditional: Number((comparison.traditional.efficiency ?? 0).toFixed(1)),
    smart: Number((comparison.smart.efficiency ?? 0).toFixed(1)),
    unit: '%',
  },
]

export const mapAiMessage = (content: string): AIMessage => ({
  id: `ai-${Date.now()}`,
  role: 'assistant',
  content,
  createdAt: Date.now(),
})
