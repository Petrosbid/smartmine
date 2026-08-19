import type { SimulationConfig, SimulationResult } from '../../types/domain'

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

export const mockSimulationService = {
  async run(config: SimulationConfig): Promise<SimulationResult> {
    await delay(1800)

    const scale = config.durationHours
    const truckFactor = config.trucks / 40
    const shovelFactor = config.shovels / 5

    const producedTon = Math.round(2200 * scale * truckFactor * shovelFactor)
    const avgQueueMin = Number((7.5 - (truckFactor - 1) - (shovelFactor - 1) * 0.8).toFixed(1))
    const avgCycleMin = Number((31 - (shovelFactor - 1) * 1.2 + (truckFactor - 1) * 0.7).toFixed(1))
    const idleMin = Math.round(36 * scale - (shovelFactor - 1) * 7)
    const fuelLiters = Math.round(92 * scale * truckFactor)
    const efficiencyPercent = Math.round(80 + (shovelFactor - 1) * 6 + (truckFactor - 1) * 4)

    return {
      producedTon,
      avgQueueMin,
      avgCycleMin,
      idleMin,
      fuelLiters,
      efficiencyPercent,
    }
  },
}
