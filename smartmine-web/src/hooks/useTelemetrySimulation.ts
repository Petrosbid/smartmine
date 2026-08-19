import { useEffect } from 'react'
import { smartmineApi } from '../services/api/smartmineApi'
import type { Telemetry, VehicleHealth } from '../types/domain'

interface UseTelemetrySimulationOptions {
  enabled: boolean
  truckId: string
  setTelemetry: (telemetry: Telemetry) => void
  setVehicleHealth: (health: VehicleHealth) => void
}

export const useTelemetrySimulation = ({
  enabled,
  truckId,
  setTelemetry,
  setVehicleHealth,
}: UseTelemetrySimulationOptions): void => {
  useEffect(() => {
    if (!enabled) return

    const interval = window.setInterval(() => {
      void (async () => {
        try {
          const [nextTelemetry, health] = await Promise.all([
            smartmineApi.simulateTelemetry(truckId),
            smartmineApi.getVehicleHealth(truckId),
          ])
          setTelemetry(nextTelemetry)
          setVehicleHealth(health)
        } catch {
          // Keep current sample if backend request fails.
        }
      })()
    }, 1500)

    return () => {
      window.clearInterval(interval)
    }
  }, [enabled, setTelemetry, setVehicleHealth, truckId])
}
