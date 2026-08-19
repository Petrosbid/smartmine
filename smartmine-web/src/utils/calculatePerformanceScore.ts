import type { PerformanceInput, PerformanceScoreResult } from '../types/domain'

const clamp = (value: number, min = 0, max = 100): number => Math.min(max, Math.max(min, value))

export const calculatePerformanceScore = (
  input: PerformanceInput,
): PerformanceScoreResult => {
  const productionScore = clamp(
    input.cycleCount * 4 + input.hauledTon / 6 - input.averageCycleTime,
  )

  const efficiencyScore = clamp(
    100 - input.waitTime * 1.2 - input.idleTime * 0.8,
  )

  const safetyScore = clamp(
    100 - input.overspeedEvents * 6 - input.hardBrakeEvents * 4 - input.safetyEvents * 8 + input.routeCompliance * 0.3,
  )

  const fuelScore = clamp(110 - input.fuelConsumption * 0.9)

  const overallScore = Math.round(
    productionScore * 0.3 +
      efficiencyScore * 0.25 +
      safetyScore * 0.3 +
      fuelScore * 0.15,
  )

  const positiveFactors: string[] = []
  const improvementFactors: string[] = []

  if (productionScore >= 80) positiveFactors.push('تناژ مناسب')
  if (input.cycleCount >= 10) positiveFactors.push('تعداد چرخه مطلوب')
  if (safetyScore >= 85) positiveFactors.push('رعایت مناسب الزامات ایمنی')

  if (input.averageCycleTime > 30) {
    improvementFactors.push('زمان چرخه بالاتر از هدف')
  }
  if (input.fuelConsumption > 34) {
    improvementFactors.push('مصرف سوخت کمی بالا')
  }
  if (input.idleTime > 20) {
    improvementFactors.push('توقف غیرضروری')
  }

  return {
    productionScore: Math.round(productionScore),
    efficiencyScore: Math.round(efficiencyScore),
    safetyScore: Math.round(safetyScore),
    fuelScore: Math.round(fuelScore),
    overallScore,
    positiveFactors,
    improvementFactors,
  }
}
