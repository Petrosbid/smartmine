import type {
  ComparisonMetric,
  DashboardKpi,
  DispatchNode,
  Driver,
  FleetVehicle,
  Mission,
  NotificationItem,
  SimulationConfig,
  Telemetry,
  VehicleHealth,
} from '../types/domain'

export const DEMO_MODE = true

export const demoDriver: Driver = {
  id: 'D-102',
  name: 'راننده D-102',
  role: 'راننده کامیون معدنی',
  shift: 'صبح',
  truckId: 'T-27',
}

export const initialTelemetry: Telemetry = {
  gps: '35.25, 58.99',
  speed: 27,
  rpm: 1820,
  engineTemp: 87,
  oilPressure: 'Normal',
  tirePressure: 108,
  vibration: 0.31,
  payloadTon: 31.5,
  fuelPercent: 68,
  updatedAt: Date.now(),
}

export const initialMission: Mission = {
  truckId: 'T-27',
  fromShovel: 'Shovel 03',
  toCrusher: 'Crusher 01',
  distanceKm: 2.4,
  etaMin: 8,
  status: 'در حال حرکت',
  cycleTimeMin: 31,
}

export const initialDashboardKpi: DashboardKpi = {
  performanceScore: 85,
  hauledTon: 384,
  cycleCount: 12,
  productiveHours: '6h 42m',
}

export const fleetStatus: FleetVehicle[] = [
  { id: 'T-21', status: 'Online' },
  { id: 'T-22', status: 'Online' },
  { id: 'T-23', status: 'Warning' },
  { id: 'T-24', status: 'Offline' },
  { id: 'T-27', status: 'Online' },
]

export const vehicleHealthData: VehicleHealth = {
  truckId: 'T-27',
  overallScore: 84,
  components: [
    { name: 'موتور', score: 86, statusText: 'عادی', statusLevel: 'success' },
    { name: 'گیربکس', score: 81, statusText: 'عادی', statusLevel: 'success' },
    { name: 'لاستیک‌ها', score: 91, statusText: 'عادی', statusLevel: 'success' },
    { name: 'ترمز', score: 88, statusText: 'عادی', statusLevel: 'success' },
    { name: 'ارتعاش', score: 73, statusText: 'نیازمند پایش', statusLevel: 'warning' },
    { name: 'روغن', score: 84, statusText: 'عادی', statusLevel: 'success' },
  ],
  predictiveNote:
    'روند ارتعاش موتور طی چرخه‌های اخیر افزایش داشته است. پیشنهاد: بررسی وضعیت موتور در اولین بازه تعمیرات برنامه‌ریزی‌شده.',
  predictiveLevel: 'warning',
}

export const initialNotifications: NotificationItem[] = [
  {
    id: 'n1',
    title: 'افزایش ارتعاش موتور',
    timeAgo: '10 دقیقه قبل',
    category: 'vehicle',
    level: 'warning',
    read: false,
  },
  {
    id: 'n2',
    title: 'مأموریت جدید دریافت شد',
    timeAgo: '18 دقیقه قبل',
    category: 'mission',
    level: 'success',
    read: false,
  },
  {
    id: 'n3',
    title: 'تراکم بالا در شاول 02',
    timeAgo: '25 دقیقه قبل',
    category: 'mission',
    level: 'warning',
    read: true,
  },
  {
    id: 'n4',
    title: 'پایان موفق مأموریت',
    timeAgo: '42 دقیقه قبل',
    category: 'system',
    level: 'success',
    read: true,
  },
]

export const mineMapNodes: DispatchNode[] = [
  { id: 'Shovel 01', type: 'shovel', x: 15, y: 25 },
  { id: 'Shovel 02', type: 'shovel', x: 35, y: 15 },
  { id: 'Shovel 03', type: 'shovel', x: 30, y: 45 },
  { id: 'Shovel 04', type: 'shovel', x: 45, y: 65 },
  { id: 'Shovel 05', type: 'shovel', x: 20, y: 70 },
  { id: 'Crusher 01', type: 'crusher', x: 75, y: 45 },
  { id: 'Dump 01', type: 'dump', x: 85, y: 20 },
  { id: 'Dump 02', type: 'dump', x: 88, y: 70 },
  { id: 'T-27', type: 'truck', x: 55, y: 48 },
  { id: 'T-21', type: 'truck', x: 56, y: 30 },
  { id: 'T-22', type: 'truck', x: 62, y: 66 },
  { id: 'T-23', type: 'truck', x: 47, y: 28 },
]

export const shovelQueues = [
  { shovel: 'Shovel 01', trucks: 2 },
  { shovel: 'Shovel 02', trucks: 8 },
  { shovel: 'Shovel 03', trucks: 2 },
  { shovel: 'Shovel 04', trucks: 4 },
  { shovel: 'Shovel 05', trucks: 1 },
]

export const performanceTrend = [
  { day: 'شنبه', score: 79, ton: 340, cycle: 34 },
  { day: 'یکشنبه', score: 81, ton: 360, cycle: 33 },
  { day: 'دوشنبه', score: 83, ton: 372, cycle: 31 },
  { day: 'سه‌شنبه', score: 85, ton: 384, cycle: 31 },
  { day: 'چهارشنبه', score: 84, ton: 380, cycle: 32 },
  { day: 'پنجشنبه', score: 86, ton: 396, cycle: 30 },
  { day: 'جمعه', score: 85, ton: 389, cycle: 31 },
]

export const telemetryTrend = Array.from({ length: 12 }, (_, index) => ({
  t: `${index + 1}`,
  speed: 24 + (index % 4),
  rpm: 1760 + index * 7,
  temp: 84 + (index % 5),
}))

export const healthTrend = Array.from({ length: 10 }, (_, index) => ({
  idx: index + 1,
  engineTemp: 84 + (index % 4),
  vibration: 0.24 + (index % 4) * 0.03,
  oilPressure: 56 - index,
  tirePressure: 106 + (index % 3),
}))

export const comparisonMetrics: ComparisonMetric[] = [
  { label: 'تناژ تولید', traditional: 8420, smart: 9380, unit: 'ton' },
  { label: 'زمان چرخه', traditional: 36.4, smart: 29.8, unit: 'min' },
  { label: 'زمان انتظار', traditional: 9.2, smart: 6.1, unit: 'min' },
  { label: 'زمان بیکاری', traditional: 52, smart: 31, unit: 'min' },
  { label: 'مصرف سوخت', traditional: 410, smart: 365, unit: 'L' },
  { label: 'بهره‌وری', traditional: 74, smart: 88, unit: '%' },
]

export const defaultSimulationConfig: SimulationConfig = {
  trucks: 40,
  shovels: 5,
  dumpPoints: 3,
  durationHours: 4,
}
