import type { Telemetry, VehicleComponentHealth, VehicleHealth } from '../../types/domain'

export const mockVehicleHealthService = {
  updateFromTelemetry(state: VehicleHealth, telemetry: Telemetry): VehicleHealth {
    const vibrationComponent = state.components.find((component) => component.name === 'ارتعاش')

    if (!vibrationComponent) {
      return state
    }

    const vibrationPenalty = telemetry.vibration > 0.4 ? 6 : telemetry.vibration > 0.34 ? 3 : 0
    const enginePenalty = telemetry.engineTemp > 91 ? 4 : telemetry.engineTemp > 88 ? 2 : 0

    const updatedComponents: VehicleComponentHealth[] = state.components.map((component) => {
      if (component.name === 'ارتعاش') {
        const nextScore = Math.max(60, 76 - vibrationPenalty)
        return {
          ...component,
          score: nextScore,
          statusText: nextScore < 72 ? 'نیازمند پایش' : 'عادی',
          statusLevel: nextScore < 72 ? 'warning' : 'success',
        }
      }

      if (component.name === 'موتور') {
        const nextScore = Math.max(74, 88 - enginePenalty)
        return {
          ...component,
          score: nextScore,
          statusText: nextScore < 80 ? 'نیازمند پایش' : 'عادی',
          statusLevel: nextScore < 80 ? 'warning' : 'success',
        }
      }

      return component
    })

    const overallScore = Math.round(
      updatedComponents.reduce((sum, component) => sum + component.score, 0) /
        updatedComponents.length,
    )

    return {
      ...state,
      overallScore,
      components: updatedComponents,
      predictiveNote:
        telemetry.vibration > 0.4
          ? 'ارتعاش موتور روند افزایشی دارد. پیشنهاد: بازبینی بلبرینگ‌ها در پنجره تعمیرات بعدی.'
          : state.predictiveNote,
    }
  },
}
