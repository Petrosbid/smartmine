import type {
  AIMessage,
  DashboardKpi,
  Mission,
  PerformanceScoreResult,
  Telemetry,
  VehicleHealth,
} from '../../types/domain'

interface AIContext {
  mission: Mission
  telemetry: Telemetry
  vehicleHealth: VehicleHealth
  performance: PerformanceScoreResult | null
  kpi: DashboardKpi
}

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

const fallbackResponse =
  'در حالت نمونه اولیه، پاسخ بر اساس داده‌های جاری سامانه ارائه می‌شود. سوال را دقیق‌تر بپرسید.'

export const suggestedPrompts = [
  'چرا امتیاز عملکرد من کاهش یافته؟',
  'مأموریت بعدی من چیست؟',
  'وضعیت کامیون من چگونه است؟',
  'چگونه زمان چرخه را کاهش دهم؟',
  'کدام شاول برای من مناسب‌تر است؟',
]

export const mockAIService = {
  async ask(question: string, context: AIContext): Promise<AIMessage> {
    await delay(900)
    const normalized = question.trim()

    let content = fallbackResponse

    if (normalized.includes('امتیاز')) {
      if (context.performance) {
        content = `بر اساس داده‌های ثبت‌شده، امتیاز کلی شما ${context.performance.overallScore} است. مهم‌ترین عامل کاهش عملکرد، زمان چرخه و زمان انتظار بوده است.`
      } else {
        content = `امتیاز فعلی داشبورد ${context.kpi.performanceScore} است. برای تحلیل دقیق‌تر، فرم عملکرد شیفت را ثبت کنید.`
      }
    } else if (normalized.includes('مأموریت')) {
      content = `مأموریت فعلی شما: ${context.mission.fromShovel} به ${context.mission.toCrusher} با زمان چرخه تقریبی ${context.mission.cycleTimeMin} دقیقه.`
    } else if (normalized.includes('کامیون') || normalized.includes('سلامت')) {
      content = `سلامت کامیون ${context.vehicleHealth.truckId} برابر ${context.vehicleHealth.overallScore}% است. وضعیت ارتعاش: ${context.vehicleHealth.components.find((c) => c.name === 'ارتعاش')?.statusText ?? 'نامشخص'}.`
    } else if (normalized.includes('چرخه')) {
      content = `برای کاهش زمان چرخه، از شاول‌های کم‌تراکم استفاده کنید، توقف‌های بیکاری را کاهش دهید و سرعت را در بازه پایدار ${Math.max(24, context.telemetry.speed - 2)} تا ${context.telemetry.speed + 2} km/h نگه دارید.`
    } else if (normalized.includes('شاول')) {
      content = 'با توجه به تراکم فعلی، Shovel 03 گزینه مناسب‌تری نسبت به Shovel 02 است و می‌تواند زمان انتظار را کاهش دهد.'
    }

    return {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content,
      createdAt: Date.now(),
    }
  },
}
