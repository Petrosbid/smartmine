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

export const suggestedPrompts = [
  'تحلیل وضعیت سلامت فنی، دمای موتور و ارتعاش کامیون',
  'چگونه زمان چرخه باربری و توقف در صف شاول را کاهش دهم؟',
  'بهترین شاول برای بارگیری بعدی با توجه به تراکم صف‌ها کدام است؟',
  'راهکارهای کاهش مصرف سوخت و کنترل سرعت در شیب‌ها',
  'تحلیل کارنامه و شاخص‌های عملکرد آخرین شیفت کاری',
]

export const mockAIService = {
  async ask(question: string, context: AIContext): Promise<AIMessage> {
    await delay(700)
    const normalized = question.trim()

    let content = `### 🤖 تحلیل هوشمند وضعیت ناوگان SmartMine AI

بر اساس داده‌های تله‌متری و وضعیت خودرو:
- امتیاز سلامت خودرو: **${context.vehicleHealth.overallScore}%**
- سرعت لحظه‌ای: **${context.telemetry.speed} km/h**
- دمای موتور: **${context.telemetry.engineTemp}°C**
- میزان سوخت: **${context.telemetry.fuelPercent}%**

برای دریافت تحلیل اختصاصی، یکی از پرسش‌های پیشنهادی را انتخاب نمایید.`

    if (normalized.includes('سلامت') || normalized.includes('موتور') || normalized.includes('ارتعاش') || normalized.includes('کامیون')) {
      const vibComp = context.vehicleHealth.components.find((c) => c.name === 'ارتعاش')
      content = `### 🚜 گزارش وضعیت سلامت فنی کامیون ${context.vehicleHealth.truckId}

امتیاز سلامت کلی: **${context.vehicleHealth.overallScore} از ۱۰۰**

**📊 پارامترهای بلادرنگ تله‌متری:**
- دمای کاری موتور: **${context.telemetry.engineTemp}°C** (محدوده استاندارد: ۸۰-۹۰°C)
- وضعیت سیستم ارتعاش: **${vibComp?.statusText ?? 'نرمال'}**
- سطح سوخت باقی‌مانده: **${context.telemetry.fuelPercent}%**
- سرعت لحظه‌ای: **${context.telemetry.speed} km/h**

**💡 توصیه نگهداری پیشگیرانه:**
وضعیت سیستم‌های فنی در محدوده پایدار قرار دارد. پیشنهاد می‌شود در شیب‌های تند با ریتاردر کنترل سرعت انجام گیرد تا استهلاک ترمزها کاهش یابد.`
    } else if (normalized.includes('امتیاز') || normalized.includes('عملکرد') || normalized.includes('کارنامه')) {
      if (context.performance) {
        content = `### 🏆 تحلیل کارنامه عملکرد شیفت

امتیاز کلی ارزیابی‌شده: **${context.performance.overallScore} از ۱۰۰**

**تفکیک شاخص‌ها:**
- 🟢 شاخص تولید: **${context.performance.productionScore}%**
- ⏱️ شاخص بهره‌وری زمان چرخه: **${context.performance.efficiencyScore}%**
- 🛡️ شاخص ایمنی: **${context.performance.safetyScore}%**
- ⛽ شاخص مصرف بهینه سوخت: **${context.performance.fuelScore}%**

**💡 راهکار ارتقای امتیاز:**
عامل اصلی کسر امتیاز، زمان معطلی در صف شاول بوده است. با انتخاب شاول‌های خلوت‌تر می‌توانید امتیاز خود را به بالای ۹۰ برسانید.`
      } else {
        content = `امتیاز فعلی داشبورد شما **${context.kpi.performanceScore} از ۱۰۰** است. پس از ثبت فرم عملکرد در بخش کارنامه، تحلیل دقیق شیفت ارائه خواهد شد.`
      }
    } else if (normalized.includes('مأموریت') || normalized.includes('مسیر') || normalized.includes('مقصد')) {
      content = `### 🎯 مأموریت فعال ترابری

- مبدأ بارگیری: **${context.mission.fromShovel}**
- مقصد تخلیه: **${context.mission.toCrusher}**
- زمان چرخه تخمینی: **${context.mission.cycleTimeMin} دقیقه**
- وضعیت فعلی: **${context.mission.status}**

**💡 توصیه ناوبری:** مسیر رمپ جنوبی ترافیک روان‌تری دارد.`
    } else if (normalized.includes('چرخه') || normalized.includes('زمان')) {
      content = `### ⏱️ راهکارهای کاهش زمان چرخه باربری

۱. **کاهش توقف در صف شاول:** صف شاول عامل اصلی اتلاف زمان است؛ شاول‌های با صف کمتر از ۲ کامیون را هدف قرار دهید.
۲. **حفظ سرعت پایدار:** سرعت را در بازه پایدار **${Math.max(24, context.telemetry.speed - 2)} تا ${context.telemetry.speed + 2} km/h** نگه دارید.
۳. **مانور سریع در پای شاول و سنگ‌شکن:** آمادگی پیش از بارگیری و تخلیه تا ۲ دقیقه زمان چرخه را کاهش می‌دهد.`
    } else if (normalized.includes('شاول') || normalized.includes('صف') || normalized.includes('ترافیک')) {
      content = `### ⛏️ تحلیل ترافیک شاول‌های معدن

با توجه به داده‌های ترافیکی زنده، شاول **Shovel 03** با صف کوتاه‌تر و دسترسی مناسب‌تر نسبت به Shovel 02، زمان انتظار را تا **~۴ دقیقه** کاهش می‌دهد و به عنوان بهترین گزینه بارگیری پیشنهاد می‌شود.`
    } else if (normalized.includes('سوخت') || normalized.includes('گازوئیل') || normalized.includes('شیب')) {
      content = `### ⛽ بهینه‌سازی مصرف سوخت در رمپ‌ها و شیب‌ها

- میزان سوخت فعلی: **${context.telemetry.fuelPercent}%**
- دمای موتور: **${context.telemetry.engineTemp}°C**

**توصیه‌ها:**
۱. در توقف‌های بیش از ۳ دقیقه، از درجا کار کردن بیهوده خودداری کنید.
۲. در سربالایی‌ها، با انتخاب دنده مناسب از افزایش دور موتور به بالای ۱۹۰۰ RPM پرهیز نمایید.`
    }

    return {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content,
      createdAt: Date.now(),
    }
  },
}
