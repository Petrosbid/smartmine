import type { ComparisonMetric, PerformanceInput, SimulationConfig, SimulationResult } from '../../types/domain'
import { apiRequest } from './client'
import {
  mapComparison,
  mapDispatchRecommendation,
  mapDriver,
  mapMission,
  mapNotifications,
  mapPerformanceResult,
  mapTelemetry,
  mapVehicleHealth,
  toApiShift,
} from './mappers'
import type {
  AIChatResponseDto,
  ComparisonResponseDto,
  DashboardResponseDto,
  DispatchRecommendationDto,
  LoginResponseDto,
  MissionDto,
  NotificationDto,
  PerformanceAnalyzeRequestDto,
  PerformanceAnalyzeResponseDto,
  ProfileDto,
  SimulationRunResponseDto,
  TelemetryDto,
  VehicleHealthDto,
} from './types'

export const smartmineApi = {
  login: (payload: { driverId: string; truckId: string; shift: 'صبح' | 'عصر' | 'شب' }) =>
    apiRequest<LoginResponseDto>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        driver_id: payload.driverId,
        truck_id: payload.truckId,
        shift: toApiShift(payload.shift),
      }),
    }),

  getDashboard: (driverId: string) =>
    apiRequest<DashboardResponseDto>('/dashboard', undefined, { driver_id: driverId }),

  getVehicleHealth: async (truckId: string) => {
    const result = await apiRequest<VehicleHealthDto>(`/trucks/${truckId}/health`)
    return mapVehicleHealth(truckId, result)
  },

  getTelemetryHistory: async (truckId: string, limit = 1) => {
    const samples = await apiRequest<TelemetryDto[]>(`/trucks/${truckId}/telemetry`, undefined, { limit })
    return samples.map(mapTelemetry)
  },

  simulateTelemetry: async (truckId: string) => {
    const sample = await apiRequest<TelemetryDto>('/telemetry/simulate', {
      method: 'POST',
      body: JSON.stringify({ truck_id: truckId }),
    })
    return mapTelemetry(sample)
  },

  getDispatchRecommendation: async (truckId: string) => {
    const recommendation = await apiRequest<DispatchRecommendationDto>('/dispatch/recommend', {
      method: 'POST',
      body: JSON.stringify({ truck_id: truckId }),
    })

    return mapDispatchRecommendation(recommendation)
  },

  applyDispatchRecommendation: async (truckId: string, shovelId: string) => {
    const mission = await apiRequest<MissionDto>('/dispatch/apply', {
      method: 'POST',
      body: JSON.stringify({
        truck_id: truckId,
        shovel_id: shovelId,
      }),
    })

    return mapMission(mission)
  },

  analyzePerformance: async (payload: {
    driverId: string
    truckId: string
    shift: 'صبح' | 'عصر' | 'شب'
    form: PerformanceInput
  }) => {
    const body: PerformanceAnalyzeRequestDto = {
      driver_id: payload.driverId,
      truck_id: payload.truckId,
      shift: toApiShift(payload.shift),
      cycle_count: payload.form.cycleCount,
      payload_ton: payload.form.hauledTon,
      average_cycle_time: payload.form.averageCycleTime,
      waiting_time: payload.form.waitTime,
      idle_time: payload.form.idleTime,
      fuel_consumption: payload.form.fuelConsumption,
      speeding_events: payload.form.overspeedEvents,
      harsh_braking_events: payload.form.hardBrakeEvents,
      safety_events: payload.form.safetyEvents,
      notes: payload.form.notes,
    }

    const response = await apiRequest<PerformanceAnalyzeResponseDto>('/performance/analyze', {
      method: 'POST',
      body: JSON.stringify(body),
    })

    return {
      result: mapPerformanceResult(response),
      aiAnalysis: response.ai_analysis,
    }
  },

  askAi: async (message: string, driverId: string, truckId: string) => {
    const response = await apiRequest<AIChatResponseDto>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        driver_id: driverId,
        truck_id: truckId,
      }),
    })
    return response.message
  },

  runSimulation: async (config: SimulationConfig): Promise<SimulationResult> => {
    const response = await apiRequest<SimulationRunResponseDto>('/simulation/run', {
      method: 'POST',
      body: JSON.stringify({
        truck_count: config.trucks,
        shovel_count: config.shovels,
        dump_points: config.dumpPoints,
        duration_hours: config.durationHours,
      }),
    })

    return {
      producedTon: Math.round(response.production),
      avgQueueMin: Number(response.average_queue_time.toFixed(1)),
      avgCycleMin: Number(response.average_cycle_time.toFixed(1)),
      idleMin: Math.round(response.idle_time),
      fuelLiters: Math.round(response.fuel_consumption),
      efficiencyPercent: Math.round(response.efficiency),
    }
  },

  getComparison: async (): Promise<ComparisonMetric[]> => {
    const response = await apiRequest<ComparisonResponseDto>('/comparison')
    return mapComparison(response)
  },

  getNotifications: async () => {
    const notifications = await apiRequest<NotificationDto[]>('/notifications')
    return mapNotifications(notifications)
  },

  markNotificationRead: async (notificationId: string) => {
    const response = await apiRequest<NotificationDto>(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    })
    return mapNotifications([response])[0]
  },

  getProfile: (driverId: string) => apiRequest<ProfileDto>('/profile', undefined, { driver_id: driverId }),

  mapDriver,
  mapTelemetry,
  mapMission,
}
