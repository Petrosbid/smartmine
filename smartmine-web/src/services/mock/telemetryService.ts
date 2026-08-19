import type { Telemetry } from '../../types/domain'

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))

const vary = (base: number, delta: number): number => {
  const offset = (Math.random() * 2 - 1) * delta
  return base + offset
}

export const mockTelemetryService = {
  nextSample(current: Telemetry): Telemetry {
    const speed = clamp(Math.round(vary(current.speed, 3)), 18, 38)
    const rpm = clamp(Math.round(vary(current.rpm, 55)), 1600, 2100)
    const engineTemp = clamp(Math.round(vary(current.engineTemp, 2)), 78, 94)
    const tirePressure = clamp(Math.round(vary(current.tirePressure, 1.4)), 102, 112)
    const vibration = clamp(Number(vary(current.vibration, 0.05).toFixed(2)), 0.2, 0.55)
    const payloadTon = clamp(Number(vary(current.payloadTon, 1.2).toFixed(1)), 28, 36)
    const fuelPercent = clamp(Math.round(vary(current.fuelPercent, 1.5)), 45, 80)

    return {
      ...current,
      speed,
      rpm,
      engineTemp,
      tirePressure,
      vibration,
      payloadTon,
      fuelPercent,
      updatedAt: Date.now(),
    }
  },
}
