import type { DispatchRecommendation, FleetVehicle, Mission, VehicleHealth } from '../../types/domain'
import { shovelQueues } from '../../data/mockData'
import { recommendDispatch } from '../../utils/recommendDispatch'

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

export const mockDispatchService = {
  async getRecommendation(input: {
    mission: Mission
    fleet: FleetVehicle[]
    vehicleHealth: VehicleHealth
  }): Promise<DispatchRecommendation> {
    await delay(900)
    return recommendDispatch({
      mission: input.mission,
      queues: shovelQueues,
      fleet: input.fleet,
      vehicleHealth: input.vehicleHealth,
    })
  },

  async applyRecommendation(
    mission: Mission,
    recommendation: DispatchRecommendation,
  ): Promise<Mission> {
    await delay(700)
    return {
      ...mission,
      fromShovel: recommendation.recommendedShovel,
      cycleTimeMin: recommendation.estimatedCycleTime,
      etaMin: Math.max(5, Math.round(recommendation.estimatedCycleTime / 4)),
      status: 'در حال حرکت',
    }
  },
}
