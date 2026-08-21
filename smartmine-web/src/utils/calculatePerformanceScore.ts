import type { PerformanceInput, PerformanceScoreResult } from '../types/domain'

const clamp = (value: number, min = 0, max = 100): number => Math.min(max, Math.max(min, value))

export const calculatePerformanceScore = (
  input: PerformanceInput,
): PerformanceScoreResult => {
  const productionTarget = 380
  const cycleTarget = 12
  const avgCycleTarget = 30
  const waitTarget = 35
  const idleTarget = 20
  const fuelTarget = 360

  // 1. Production Score
  const productionScore = clamp(
    (input.hauledTon / productionTarget) * 70 + (input.cycleCount / cycleTarget) * 30,
  )

  // 2. Efficiency Score
  const efficiencyPenalty =
    Math.max(0, input.averageCycleTime - avgCycleTarget) * 1.2 +
    Math.max(0, input.waitTime - waitTarget) * 0.5 +
    Math.max(0, input.idleTime - idleTarget) * 0.8
  const efficiencyScore = clamp(100 - efficiencyPenalty)

  // 3. Safety Score
  const routeComp = input.routeCompliance ?? 95
  const routePenalty = Math.max(0, 95 - routeComp) * 0.8
  const safetyPenalty =
    input.overspeedEvents * 6 +
    input.hardBrakeEvents * 4 +
    input.safetyEvents * 10 +
    routePenalty
  const safetyScore = clamp(100 - safetyPenalty)

  // 4. Fuel Score (normalizes L/h and Shift Liters)
  const actualFuel = input.fuelConsumption <= 70 ? input.fuelConsumption * 8 : input.fuelConsumption
  const fuelPenalty = Math.max(0, actualFuel - fuelTarget) * 0.35
  const fuelScore = clamp(100 - fuelPenalty)

  const overallScore = Math.round(
    productionScore * 0.3 +
      efficiencyScore * 0.25 +
      safetyScore * 0.3 +
      fuelScore * 0.15,
  )

  const positiveFactors: string[] = []
  const improvementFactors: string[] = []

  if (productionScore >= 90) {
    positiveFactors.push('حجم تولید مطلوب و تکمیل چرخه‌های باربری فراتر از استاندارد شیفت')
  } else if (productionScore >= 80) {
    positiveFactors.push('دستیابی به تناژ مصوب و چرخه‌های استاندارد شیفت کاری')
  } else {
    improvementFactors.push('افزایش تعداد چرخه‌ها و ارتقای یکنواختی تناژ بارگیری در هر سرویس')
  }

  if (efficiencyScore >= 85) {
    positiveFactors.push('مدیریت بهینه زمان چرخه باربری و حداقل توقف در صف شاول‌ها')
  } else {
    improvementFactors.push('کاهش زمان معطلی در صف شاول و پرهیز از درجا کار کردن غیرضروری موتور')
  }

  if (safetyScore >= 92) {
    positiveFactors.push('رعایت کامل سرعت مجاز، رانندگی ایمن و انطباق حداکثری با مسیرهای مصوب')
  } else {
    improvementFactors.push('کنترل سرعت در سراشیبی‌ها، کاهش ترمزهای شدید و افزایش پایبندی به مسیر معدن')
  }

  if (fuelScore >= 85) {
    positiveFactors.push('رانندگی اقتصادی و مصرف سوخت بهینه با کنترل دور موتور در رمپ‌ها')
  } else {
    improvementFactors.push('بهینه‌سازی مصرف گازوئیل از طریق رانندگی یکنواخت و کاهش درجا کار کردن در صف')
  }

  if (routeComp >= 95 && !positiveFactors.some((f) => f.includes('انطباق'))) {
    positiveFactors.push('پایبندی عالی به مسیرهای استاندارد ترابری معدن')
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

