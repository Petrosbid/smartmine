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

    const steps = []
    const eventLogs = []
    const stepMessages = [
      'شروع شیفت: استقرار ناوگان ترابری در موقعیت‌های بارگیری و فعال‌سازی سنسورهای IIoT',
      'ساعت اول: جریان روان باربری و تخلیه بدون وقفه در سنگ‌شکن مرکزی',
      'نیمه شیفت: پایش گلوگاه‌های ترافیکی شاول‌ها و ارسال دستورات دیسپچ پویا',
      'ساعت میانی: افزایش حجم استخراج سنگ و تثبیت سرعت پایدار در رمپ‌ها',
      'اوج تولید: تکمیل موفق چرخه‌های باربری با حداقل زمان انتظار در صف',
      'پایش نهایی: ارزیابی بهره‌وری OEE و ثبت آمارهای تولید شیفت معدن',
    ]

    for (let stepI = 1; stepI <= scale; stepI += 1) {
      const ratio = stepI / scale
      const currentHour = stepI
      const cumProd = Math.round(producedTon * ratio)
      const cumCycles = Math.round(scale * config.trucks * 1.6 * ratio)
      const cumFuel = Math.round(fuelLiters * ratio)
      const qTime = Number((avgQueueMin * (0.85 + 0.3 * (stepI % 3))).toFixed(1))

      const msgIdx = Math.min(stepMessages.length - 1, Math.floor(ratio * (stepMessages.length - 1)))
      const stepMsg = `ساعت ${currentHour}: ${stepMessages[msgIdx]} (تولید تجمعی: ${cumProd.toLocaleString('fa-IR')} تن)`

      steps.push({
        stepHour: currentHour,
        producedTon: cumProd,
        cycleCount: cumCycles,
        queueTime: qTime,
        fuelLiters: cumFuel,
        eventMessage: stepMsg,
      })
      eventLogs.push(stepMsg)
    }

    return {
      producedTon,
      avgQueueMin,
      avgCycleMin,
      idleMin,
      fuelLiters,
      efficiencyPercent,
      steps,
      eventLogs,
    }
  },
}

