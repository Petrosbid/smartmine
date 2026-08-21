export interface LoginRequestDto {
  driver_id: string
  truck_id: string
  shift: 'morning' | 'evening' | 'night'
}

export interface DriverDto {
  id: string
  name: string
  shift: 'morning' | 'evening' | 'night'
  status: 'active' | 'resting' | 'off_duty'
  truck_id: string | null
}

export interface TruckDto {
  id: string
  model: string
  status: 'available' | 'in_mission' | 'offline' | 'maintenance'
  driver_id: string | null
  capacity_ton: number
  fuel_level: number
  speed: number
  latitude: number
  longitude: number
  health_score: number
}

export interface LoginResponseDto {
  access_token: string
  token_type: 'bearer'
  driver: DriverDto
  truck: TruckDto
}

export interface TelemetryDto {
  timestamp: string
  speed: number | null
  rpm: number | null
  engine_temperature: number | null
  oil_pressure: number | null
  fuel_level: number | null
  payload: number | null
  tire_pressure: number | null
  vibration: number | null
  latitude: number | null
  longitude: number | null
}

export interface MissionDto {
  mission_id: number
  truck_id: string
  shovel_id: string
  crusher_id: string
  distance_km: number
  eta_min: number
  cycle_time_min: number
  status: string
  created_at: string
}

export interface DashboardResponseDto {
  driver: DriverDto
  truck: TruckDto
  current_mission: MissionDto | null
  telemetry: TelemetryDto | null
  performance: {
    overall_score: number
    production_score: number
    efficiency_score: number
  }
  fleet: {
    total: number
    available: number
    in_mission: number
    offline: number
  }
  alerts: Array<{
    id: number
    title: string
    severity: 'info' | 'warning' | 'critical'
    type: 'safety' | 'vehicle' | 'mission' | 'system'
    read: boolean
  }>
  recent_performance: Array<{
    created_at: string
    overall_score: number
    cycle_count: number
    payload_ton: number
  }>
  ai_recommendation: {
    message: string
  }
}

export interface VehicleHealthDto {
  overall_score: number
  engine_score: number
  transmission_score: number
  tires_score: number
  brakes_score: number
  components: Record<string, number>
  warnings: string[]
  predictive_maintenance: {
    risk_level: 'low' | 'medium' | 'high'
    risk_score: number
    reason: string
    recommendation: string
  }
}

export interface DispatchRecommendationDto {
  recommended_shovel: string
  estimated_cycle_time: number
  estimated_improvement: number
  reason: string
  score_breakdown: Record<string, number>
}

export interface DispatchStateDto {
  trucks: Array<{ id: string; status: string }>
  shovels: Array<{ id: string; queue: number; status: string }>
  crushers: Array<{ id: string; status: string }>
  routes: Array<{ from: string; to: string; distance_km: number }>
  queues: Array<{ shovel: string; trucks: number }>
  missions: Array<{ truck_id: string; shovel_id: string; eta_min: number; status: string }>
}

export interface NotificationDto {
  id: number
  title: string
  message: string
  type: 'safety' | 'vehicle' | 'mission' | 'system'
  severity: 'info' | 'warning' | 'critical'
  read: boolean
  created_at: string
}

export interface PerformanceAnalyzeRequestDto {
  driver_id: string
  truck_id: string
  shift: 'morning' | 'evening' | 'night'
  cycle_count: number
  payload_ton: number
  average_cycle_time: number
  waiting_time: number
  idle_time: number
  fuel_consumption: number
  speeding_events: number
  harsh_braking_events: number
  safety_events: number
  notes?: string
}

export interface PerformanceAnalyzeResponseDto {
  overall_score: number
  production_score: number
  efficiency_score: number
  safety_score: number
  fuel_score: number
  positive_factors: string[]
  improvement_factors: string[]
  ai_analysis: string
}

export interface SimulationRunRequestDto {
  truck_count: number
  shovel_count: number
  dump_points: number
  duration_hours: number
}

export interface SimulationRunResponseDto {
  production: number
  average_queue_time: number
  average_cycle_time: number
  idle_time: number
  fuel_consumption: number
  efficiency: number
  truck_utilization: number
  note: string
}

export interface ComparisonResponseDto {
  traditional: Record<string, number>
  smart: Record<string, number>
  improvement: Record<string, number>
}

export interface AIChatResponseDto {
  message: string
  sources: string[]
  context: Record<string, unknown>
}

export interface ProfileDto {
  id: string
  name: string
  shift: 'morning' | 'evening' | 'night'
  status: 'active' | 'resting' | 'off_duty'
  truck_id: string | null
  average_performance: number
  mission_count: number
  payload_total_ton: number
  safety_index: number
}
