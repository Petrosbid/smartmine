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
    await delay(600)
    const normalized = question.trim().toLowerCase()

    const { speed, engineTemp, vibration, fuelPercent, oilPressure, tirePressure, payloadTon } = context.telemetry
    const { overallScore, components, predictiveLevel, predictiveNote } = context.vehicleHealth
    const truckId = context.vehicleHealth.truckId || 'T-27'

    let content = ''

    // 1. Vehicle Health / Telemetry / Engine Analysis
    if (
      normalized.includes('سلامت') ||
      normalized.includes('موتور') ||
      normalized.includes('ارتعاش') ||
      normalized.includes('کامیون') ||
      normalized.includes('فنی') ||
      normalized.includes('خرابی')
    ) {
      const isOverheating = engineTemp > 90
      const isHighVib = vibration > 0.35
      const isLowFuel = fuelPercent < 25

      let warningBanner = ''
      if (isOverheating || isHighVib || predictiveLevel === 'danger' || predictiveLevel === 'warning') {
        warningBanner = `⚠️ **هشدار عملیاتی:** پایش تله‌متری نشان‌دهنده ${
          isOverheating
            ? `دمای بالای موتور (${engineTemp}°C)`
            : isHighVib
              ? `ارتعاش غیرعادی شاسی (${vibration}g)`
              : predictiveNote || 'نوسان در پارامترهای فنی'
        } است.\n\n`
      }

      const compLines = components
        .map((c) => `- **${c.name}**: امتیاز سلامت **${c.score}%** (${c.statusText})`)
        .join('\n')

      content = `${warningBanner}### 🚜 تحلیل جامع وضعیت فنی کامیون **${truckId}**

امتیاز کل سلامت خودرو: **${overallScore} از ۱۰۰** (سطح ریسک: **${predictiveLevel === 'danger' ? 'بحرانی' : predictiveLevel === 'warning' ? 'هشدار' : 'ایمن و مطلوب'}**)

**📊 شاخص‌های زنده تله‌متری IIoT:**
- دمای کاری موتور: **${engineTemp}°C** ${isOverheating ? '⚠️ (بالاتر از حد مجاز ۹۰°C)' : '✅ (محدوده استاندارد)'}
- ارتعاش شاسی: **${vibration}g** ${isHighVib ? '⚠️ (نیازمند پایش لنت و کمک‌فنر)' : '✅ (طبیعی)'}
- فشار روغن موتور: **${oilPressure === 'Low' ? '⚠️ افت فشار (Low)' : '۵۴ PSI (نرمال)'}**
- فشار باد تایرها: **${tirePressure} PSI**
- سطح سوخت باقی‌مانده: **${fuelPercent}%** ${isLowFuel ? '⚠️ (سوخت در محدوده بحرانی)' : ''}
- سرعت لحظه‌ای: **${speed} km/h** | بار فعلی: **${payloadTon} تن**

**🔧 وضعیت قطعات اصلی:**
${compLines}

**💡 توصیه مهندسی نگهداری پیشگیرانه:**
${predictiveNote || 'سیستم‌های فنی در محدوده پایدار قرار دارند. حفظ دور موتور بهینه و رانندگی نرم توصیه می‌شود.'}`
    }

    // 2. Driver Performance & Shift Score Analysis
    else if (
      normalized.includes('امتیاز') ||
      normalized.includes('عملکرد') ||
      normalized.includes('کارنامه') ||
      normalized.includes('راندمان') ||
      normalized.includes('شیفت')
    ) {
      if (context.performance) {
        const perf = context.performance
        const positives =
          perf.positiveFactors.length > 0
            ? perf.positiveFactors.map((f) => `✅ ${f}`).join('\n')
            : '✅ ثبات و پایداری عملکرد در طول شیفت'
        const improvements =
          perf.improvementFactors.length > 0
            ? perf.improvementFactors.map((f) => `⚠️ ${f}`).join('\n')
            : '⚠️ حفظ همین روند برای شیفت‌های آینده'

        content = `### 🏆 کارنامه و تحلیل هوشمند عملکرد شیفت کاری

امتیاز کل ارزیابی‌شده شما: **${perf.overallScore} از ۱۰۰** (${
          perf.overallScore >= 85
            ? 'بسیار عالی و الگوی رانندگی بهینه'
            : perf.overallScore >= 70
              ? 'مطلوب با امکان ارتقا به رده برتر'
              : 'نیازمند بهینه‌سازی زمان‌های توقف و رانندگی ایمن‌تر'
        })

**📊 ریز نمرات شاخص‌های عملکردی:**
- 🟢 **تولید و تناژ (${perf.productionScore}%):** حجم جابجایی سنگ و چرخه‌ها.
- ⏱️ **بهره‌وری زمان چرخه (${perf.efficiencyScore}%):** حداقل توقف در صف شاول و زمان درجا کار کردن.
- 🛡️ **ایمنی و انطباق مسیر (${perf.safetyScore}%):** رانندگی بدون تخطی از سرعت و رعایت انطباق مسیر.
- ⛽ **مدیریت مصرف سوخت (${perf.fuelScore}%):** رانندگی اقتصادی در رمپ‌های خروجی پیت.

**نقاط قوت شناسایی‌شده:**
${positives}

**گلوگاه‌ها و فرصت‌های ارتقای راندمان:**
${improvements}

**🎯 راهکار رسیدن به امتیاز بالای ۹۵:**
با انتخاب شاول‌های خلوت‌تر از طریق نقشه دیسپچ و خاموش کردن موتور در توقف‌های بالای ۵ دقیقه، راندمان شیفت تا ۱۵٪ افزایش خواهد یافت.`
      } else {
        content = `### 📊 وضعیت شاخص‌های عملکردی در داشبورد

امتیاز جاری شما در این شیفت **${context.kpi.performanceScore} از ۱۰۰** ثبت شده است (مجموع تناژ: **${context.kpi.hauledTon} تن** در **${context.kpi.cycleCount} چرخه** با زمان کاری مؤثر **${context.kpi.productiveHours}**).

برای دریافت کارنامه تحلیلی تفصیلی و توصیه‌های مربی هوشمند، فرم عملکرد شیفت را در منوی «عملکرد من» تکمیل نمایید.`
      }
    }

    // 3. Mission & Tactical Dispatching
    else if (
      normalized.includes('مأموریت') ||
      normalized.includes('ماموریت') ||
      normalized.includes('مسیر') ||
      normalized.includes('مقصد') ||
      normalized.includes('کجا') ||
      normalized.includes('تخلیه') ||
      normalized.includes('بارگیری')
    ) {
      content = `### 🎯 جزئیات مأموریت فعال ناوگان

- شناسه کامیون: **${context.mission.truckId}**
- نقطه بارگیری (مبدأ): **${context.mission.fromShovel}**
- نقطه تخلیه (مقصد): **${context.mission.toCrusher}**
- مسافت کل رفت و برگشت: **${context.mission.distanceKm} کیلومتر**
- زمان تخمینی تا مقصد: **~${context.mission.etaMin} دقیقه** (کل زمان چرخه: **${context.mission.cycleTimeMin} دقیقه**)
- وضعیت لحظه‌ای مأموریت: **${context.mission.status}**

**💡 توصیه ناوبری هوشمند دیسپچ:**
پس از اتمام تخلیه در سنگ‌شکن، وضعیت صف شاول‌ها را بررسی نموده و در صورت ازدحام در شاول‌های اصلی، به سمت گزینه‌های کم‌ترافیک هدایت شوید.`
    }

    // 4. Shovels & Queues Congestion
    else if (
      normalized.includes('شاول') ||
      normalized.includes('صف') ||
      normalized.includes('ترافیک') ||
      normalized.includes('ازدحام') ||
      normalized.includes('کدام شاول')
    ) {
      content = `### ⛏️ تحلیل ترافیک و صف بارگیری شاول‌های معدن

بر اساس داده‌های ارسالی از شبکه IIoT:
- **Shovel 02**: دارای بار سنگین ترافیکی (۸ کامیون در صف | زمان انتظار تقریبی: ۱۸ دقیقه) ⚠️
- **Shovel 03**: ترافیک سبک و روان (۲ کامیون در صف | زمان انتظار: ۳ دقیقه) ✅
- **Shovel 01 & 05**: وضعیت عادی و زمان انتظار زیر ۴ دقیقه ✅

**🎯 پیشنهاد هوش مصنوعی:**
انتخاب **Shovel 03** به عنوان مقصد بارگیری بعدی، زمان کل چرخه شما را تا **۱۹٪ (حدود ۶ دقیقه در هر دور)** کاهش می‌دهد.`
    }

    // 5. Cycle Time & Speed Optimization
    else if (
      normalized.includes('چرخه') ||
      normalized.includes('زمان') ||
      normalized.includes('کاهش زمان') ||
      normalized.includes('سرعت') ||
      normalized.includes('بهینه‌سازی')
    ) {
      content = `### ⏱️ راهکارهای هوش مصنوعی جهت کاهش زمان چرخه (Cycle Time)

۱. **اجتناب از صف شاول:** بیش از ۳۰٪ از زمان چرخه در صف انتظار شاول‌های شلوغ تلف می‌شود؛ همیشه شاول با صف کمتر از ۳ را انتخاب کنید.
2. **سرعت یکنواخت در رمپ‌ها:** سرعت فعلی شما **${speed} km/h** است؛ حفظ بازه **۲۵ تا ۳۰ km/h** در سراشیبی‌ها با استفاده از ریتاردر، از توقف‌های ناگهانی جلوگیری می‌کند.
3. **مانور سریع در پای شاول و سنگ‌شکن:** استقرار در زاویه بهینه بارگیری پیش از رسیدن نوبت، ۲ دقیقه در هر چرخه صرفه‌جویی به همراه دارد.`
    }

    // 6. Fuel & Heat Management
    else if (
      normalized.includes('سوخت') ||
      normalized.includes('گازوئیل') ||
      normalized.includes('داغ') ||
      normalized.includes('حرارت') ||
      normalized.includes('شیب') ||
      normalized.includes('درجا')
    ) {
      content = `### ⛽ بهینه‌سازی مصرف سوخت و مدیریت دمای موتور

- میزان سوخت فعلی: **${fuelPercent}%**
- دمای کاری موتور: **${engineTemp}°C**

**توصیه‌های عملیاتی:**
۱. **کاهش درجا کار کردن (Idle Time):** در توقف‌های بیش از ۳ دقیقه در صف شاول، دور موتور را در حالت Economic قرار دهید (صرفه‌جویی تا ۱۲ لیتر در ساعت).
۲. **کنترل دور موتور در سربالایی:** دور موتور را در بازه **۱۵۰۰ تا ۱۸۰۰ RPM** نگه دارید تا علاوه بر صرفه‌جویی در سوخت، دمای موتور بالای ۹۰°C نرود.
۳. **استفاده از ترمز هیدرولیکی (Retarder):** در شیب‌های تند پیت معدن از ریتاردر استفاده نمایید تا از داغ شدن لنت‌ها و هدررفت انرژی جلوگیری شود.`
    }

    // Default Overview
    else {
      content = `### 🤖 تحلیل وضعیت کلی ناوگان و کامیون **${truckId}**

بر اساس آخرین داده‌های سنسوری و تله‌متری:
- **وضعیت سلامت خودرو:** **${overallScore}%** (دمای موتور: **${engineTemp}°C**، ارتعاش: **${vibration}g**)
- **تله‌متری لحظه‌ای:** سرعت **${speed} km/h** | سطح سوخت **${fuelPercent}%**
- **مأموریت فعال:** **${context.mission.fromShovel} ← ${context.mission.toCrusher}** (وضعیت: **${context.mission.status}**)

برای دریافت راهنمایی تخصصی، می‌توانید درباره «وضعیت سلامت موتور»، «کاهش زمان چرخه»، «ترافیک شاول‌ها» یا «تحلیل کارنامه شیفت» سوال بفرمایید.`
    }

    return {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content,
      createdAt: Date.now(),
    }
  },
}

