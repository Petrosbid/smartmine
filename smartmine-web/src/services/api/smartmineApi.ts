import type {
  ComparisonMetric,
  Mission,
  PerformanceInput,
  PerformanceScoreResult,
  SimulationConfig,
  SimulationResult,
  Telemetry,
  VehicleHealth,
} from '../../types/domain'
import {
  comparisonMetrics,
  demoDriver,
  fleetStatus,
  initialDashboardKpi,
  initialMission,
  initialNotifications,
  initialTelemetry,
  performanceTrend,
  shovelQueues,
  vehicleHealthData,
} from '../../data/mockData'
import { mockAIService } from '../mock/aiService'
import { mockDispatchService } from '../mock/dispatchService'
import { mockPerformanceService } from '../mock/performanceService'
import { mockSimulationService } from '../mock/simulationService'
import { mockTelemetryService } from '../mock/telemetryService'
import { mockVehicleHealthService } from '../mock/vehicleHealthService'
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
  DispatchStateDto,
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

let cachedTelemetry: Telemetry = { ...initialTelemetry }
let cachedHealth: VehicleHealth = { ...vehicleHealthData }
let cachedMission: Mission = { ...initialMission }

export const smartmineApi = {
  login: async (payload: { driverId: string; truckId: string; shift: 'صبح' | 'عصر' | 'شب' }): Promise<LoginResponseDto> => {
    try {
      return await apiRequest<LoginResponseDto>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          driver_id: payload.driverId,
          truck_id: payload.truckId,
          shift: toApiShift(payload.shift),
        }),
      })
    } catch {
      // Graceful fallback for Demo mode
      return {
        access_token: `demo-token-${Date.now()}`,
        token_type: 'bearer',
        driver: {
          id: payload.driverId,
          name: `راننده ${payload.driverId}`,
          shift: toApiShift(payload.shift),
          status: 'active',
          truck_id: payload.truckId,
        },
        truck: {
          id: payload.truckId,
          model: 'CAT 777G',
          status: 'available',
          driver_id: payload.driverId,
          capacity_ton: 35,
          fuel_level: 68,
          speed: 27,
          latitude: 35.25,
          longitude: 58.99,
          health_score: 84,
        },
      }
    }
  },

  getDashboard: async (driverId: string): Promise<DashboardResponseDto> => {
    try {
      return await apiRequest<DashboardResponseDto>('/dashboard', undefined, { driver_id: driverId })
    } catch {
      return {
        driver: {
          id: driverId || demoDriver.id,
          name: demoDriver.name,
          shift: toApiShift(demoDriver.shift),
          status: 'active',
          truck_id: demoDriver.truckId,
        },
        truck: {
          id: demoDriver.truckId,
          model: 'CAT 777G',
          status: 'available',
          driver_id: driverId || demoDriver.id,
          capacity_ton: 35,
          fuel_level: cachedTelemetry.fuelPercent,
          speed: cachedTelemetry.speed,
          latitude: 35.25,
          longitude: 58.99,
          health_score: cachedHealth.overallScore,
        },
        telemetry: {
          timestamp: new Date(cachedTelemetry.updatedAt).toISOString(),
          speed: cachedTelemetry.speed,
          rpm: cachedTelemetry.rpm,
          engine_temperature: cachedTelemetry.engineTemp,
          oil_pressure: 54,
          fuel_level: cachedTelemetry.fuelPercent,
          payload: cachedTelemetry.payloadTon,
          tire_pressure: cachedTelemetry.tirePressure,
          vibration: cachedTelemetry.vibration,
          latitude: 35.25,
          longitude: 58.99,
        },
        current_mission: {
          mission_id: 101,
          truck_id: cachedMission.truckId,
          shovel_id: cachedMission.fromShovel,
          crusher_id: cachedMission.toCrusher,
          distance_km: cachedMission.distanceKm,
          eta_min: cachedMission.etaMin,
          cycle_time_min: cachedMission.cycleTimeMin,
          status: cachedMission.status,
          created_at: new Date().toISOString(),
        },
        performance: {
          overall_score: initialDashboardKpi.performanceScore,
          production_score: 88,
          efficiency_score: 82,
        },
        fleet: {
          total: 40,
          available: 34,
          in_mission: 5,
          offline: 1,
        },
        alerts: initialNotifications.map((n, idx) => ({
          id: idx + 1,
          title: n.title,
          severity: n.level === 'danger' ? 'critical' : n.level === 'warning' ? 'warning' : 'info',
          type: n.category as 'safety' | 'vehicle' | 'mission' | 'system',
          read: n.read,
        })),
        recent_performance: performanceTrend.map((p, idx) => ({
          created_at: `روز ${idx + 1}`,
          overall_score: p.score,
          cycle_count: p.cycle,
          payload_ton: p.ton,
        })),
        ai_recommendation: {
          message:
            'با توجه به بار سنگین شاول 02، هدایت کامیون به سمت شاول 03 زمان انتظار را تا 24٪ کاهش می‌دهد.',
        },
      }
    }
  },

  getVehicleHealth: async (truckId: string): Promise<VehicleHealth> => {
    try {
      const result = await apiRequest<VehicleHealthDto>(`/trucks/${truckId}/health`)
      return mapVehicleHealth(truckId, result)
    } catch {
      return cachedHealth
    }
  },

  getTelemetryHistory: async (truckId: string, limit = 1): Promise<Telemetry[]> => {
    try {
      const samples = await apiRequest<TelemetryDto[]>(`/trucks/${truckId}/telemetry`, undefined, { limit })
      return samples.map(mapTelemetry)
    } catch {
      return [cachedTelemetry]
    }
  },

  simulateTelemetry: async (truckId: string): Promise<Telemetry> => {
    try {
      const sample = await apiRequest<TelemetryDto>('/telemetry/simulate', {
        method: 'POST',
        body: JSON.stringify({ truck_id: truckId }),
      })
      cachedTelemetry = mapTelemetry(sample)
      return cachedTelemetry
    } catch {
      cachedTelemetry = mockTelemetryService.nextSample(cachedTelemetry)
      cachedHealth = mockVehicleHealthService.updateFromTelemetry(cachedHealth, cachedTelemetry)
      return cachedTelemetry
    }
  },

  getDispatchRecommendation: async (truckId: string) => {
    try {
      const recommendation = await apiRequest<DispatchRecommendationDto>('/dispatch/recommend', {
        method: 'POST',
        body: JSON.stringify({ truck_id: truckId }),
      })
      return mapDispatchRecommendation(recommendation)
    } catch {
      return await mockDispatchService.getRecommendation({
        mission: cachedMission,
        fleet: fleetStatus,
        vehicleHealth: cachedHealth,
      })
    }
  },

  getDispatchState: async (): Promise<DispatchStateDto> => {
    try {
      return await apiRequest<DispatchStateDto>('/dispatch/state')
    } catch {
      return {
        trucks: [
          { id: 'T-21', status: 'available' },
          { id: 'T-22', status: 'in_mission' },
          { id: 'T-23', status: 'available' },
          { id: 'T-27', status: 'in_mission' },
        ],
        shovels: shovelQueues.map((q) => ({ id: q.shovel, queue: q.trucks, status: 'active' })),
        crushers: [{ id: 'Crusher 01', status: 'active' }],
        routes: [{ from: 'Shovel 03', to: 'Crusher 01', distance_km: 2.4 }],
        queues: shovelQueues,
        missions: [{ truck_id: 'T-27', shovel_id: 'Shovel 03', eta_min: 8, status: 'in_transit' }],
      }
    }
  },

  applyDispatchRecommendation: async (truckId: string, shovelId: string): Promise<Mission> => {
    try {
      const mission = await apiRequest<MissionDto>('/dispatch/apply', {
        method: 'POST',
        body: JSON.stringify({
          truck_id: truckId,
          shovel_id: shovelId,
        }),
      })
      cachedMission = mapMission(mission)
      return cachedMission
    } catch {
      cachedMission = {
        ...cachedMission,
        fromShovel: shovelId,
        cycleTimeMin: 24,
        etaMin: 6,
        status: 'در حال حرکت',
      }
      return cachedMission
    }
  },

  analyzePerformance: async (payload: {
    driverId: string
    truckId: string
    shift: 'صبح' | 'عصر' | 'شب'
    form: PerformanceInput
  }): Promise<{ result: PerformanceScoreResult; aiAnalysis: string }> => {
    try {
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
    } catch {
      const result = await mockPerformanceService.analyze(payload.form)
      return {
        result,
        aiAnalysis:
          result.overallScore >= 80
            ? 'عملکرد شیفت بسیار مطلوب ارزیابی شد. رعایت استانداردهای ایمنی و زمان چرخه بهینه بوده است.'
            : 'عملکرد نیازمند پایش زمان توقفات و کاهش دورهای غیرضروری است.',
      }
    }
  },

  askAi: async (message: string, driverId: string, truckId: string): Promise<string> => {
    try {
      const response = await apiRequest<AIChatResponseDto>('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message,
          driver_id: driverId,
          truck_id: truckId,
        }),
      })
      return response.message
    } catch {
      const response = await mockAIService.ask(message, {
        mission: cachedMission,
        telemetry: cachedTelemetry,
        vehicleHealth: cachedHealth,
        performance: null,
        kpi: initialDashboardKpi,
      })
      return response.content
    }
  },

  runSimulation: async (config: SimulationConfig): Promise<SimulationResult> => {
    try {
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
    } catch {
      return await mockSimulationService.run(config)
    }
  },

  getComparison: async (): Promise<ComparisonMetric[]> => {
    try {
      const response = await apiRequest<ComparisonResponseDto>('/comparison')
      return mapComparison(response)
    } catch {
      return comparisonMetrics
    }
  },

  getNotifications: async () => {
    try {
      const notifications = await apiRequest<NotificationDto[]>('/notifications')
      return mapNotifications(notifications)
    } catch {
      return initialNotifications
    }
  },

  markNotificationRead: async (notificationId: string) => {
    try {
      const response = await apiRequest<NotificationDto>(`/notifications/${notificationId}/read`, {
        method: 'PATCH',
      })
      return mapNotifications([response])[0]
    } catch {
      const target = initialNotifications.find((n) => n.id === notificationId)
      return target ? { ...target, read: true } : initialNotifications[0]
    }
  },

  getProfile: async (driverId: string): Promise<ProfileDto> => {
    try {
      return await apiRequest<ProfileDto>('/profile', undefined, { driver_id: driverId })
    } catch {
      return {
        id: driverId || demoDriver.id,
        name: demoDriver.name,
        shift: 'morning',
        status: 'active',
        truck_id: demoDriver.truckId,
        average_performance: 86.4,
        mission_count: 142,
        payload_total_ton: 5120,
        safety_index: 96,
      }
    }
  },

  mapDriver,
  mapTelemetry,
  mapMission,
}
