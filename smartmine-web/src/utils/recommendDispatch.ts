import type { DispatchRecommendation, FleetVehicle, Mission, VehicleHealth } from '../types/domain'

interface RecommendDispatchInput {
  mission: Mission
  queues: Array<{ shovel: string; trucks: number }>
  fleet: FleetVehicle[]
  vehicleHealth: VehicleHealth
}

export const recommendDispatch = (
  input: RecommendDispatchInput,
): DispatchRecommendation => {
  const availableFleet = input.fleet.filter((vehicle) => vehicle.status !== 'Offline').length
  const healthyFactor = input.vehicleHealth.overallScore >= 80 ? 1 : 0.94

  const sortedQueues = [...input.queues].sort((a, b) => a.trucks - b.trucks)
  const bestQueue = sortedQueues[0]

  const baseline = input.mission.cycleTimeMin
  const queuePenalty = bestQueue.trucks * 1.3
  const estimatedCycleTime = Math.max(22, Math.round((baseline - 4 + queuePenalty) * healthyFactor))

  const estimatedImprovement = Math.max(
    4,
    Math.round(((baseline - estimatedCycleTime) / baseline) * 100),
  )

  return {
    recommendedShovel: bestQueue.shovel,
    estimatedCycleTime,
    estimatedImprovement,
    reason: `کمترین تراکم صف (${bestQueue.trucks} کامیون) و ${availableFleet} کامیون فعال در شبکه`,
    label: 'الگوریتم شبیه‌سازی‌شده',
  }
}
