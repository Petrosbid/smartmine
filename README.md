<div align="center">

# ⛏️ SmartMine — Intelligent Mining Fleet Management System
### 🛰️ سامانه هوشمند مدیریت ناوگان و ترابری معدن مبتنی بر اینترنت اشیا صنعتی (IIoT) و هوش مصنوعی

> **A presentation-ready Proof of Concept (PoC) & Bachelor's Thesis Prototype for an IIoT-based Intelligent Mining Fleet, Dispatching, Telemetry & Predictive Maintenance Platform.**

[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.13-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.116+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8.0+-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![SQLite](https://img.shields.io/badge/SQLite-SQLAlchemy_2.0-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org)
[![Google Gemini AI](https://img.shields.io/badge/Google_Gemini-2.5_%2F_3.5_Flash-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)
[![Tests](https://img.shields.io/badge/Pytest-100%25_Passing-brightgreen?style=for-the-badge&logo=pytest&logoColor=white)]()
[![License](https://img.shields.io/badge/License-MIT-amber?style=for-the-badge)]()
[![Persian RTL](https://img.shields.io/badge/Persian_RTL-Native_Support-blueviolet?style=for-the-badge)]()

---

[**English Overview**](#-english-overview) &nbsp; | &nbsp; [**راهنمای فارسی**](#-بخش-فارسی-راهنمای-جامع-پروژه) &nbsp; | &nbsp; [**Architecture**](#-system-architecture) &nbsp; | &nbsp; [**Quickstart**](#-quickstart--installation) &nbsp; | &nbsp; [**Report**](SmartMine_Implementation_Report.md)

---

</div>

## screenshots

<div align="center">
  <table>
    <tr>
      <td align="center">
        <img src="https://github.com/user-attachments/assets/a42f3312-c98a-433c-b66b-85006126d874" width="180" />
      </td>
      <td align="center">
        <img src="https://github.com/user-attachments/assets/4c5de7b3-abd3-4091-b93f-19177d3f6b4c" width="180" />
      </td>
      <td align="center">
        <img src="https://github.com/user-attachments/assets/a556e4d8-e378-4032-aff2-a3dc5530f9c8" width="180" />
      </td>
      <td align="center">
        <img src="https://github.com/user-attachments/assets/2f77c742-b129-40e3-af94-7e39b90a1b29" width="180" />
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="https://github.com/user-attachments/assets/04011bd8-dafb-491f-a55a-d0b442f78230" width="180" />
      </td>
      <td align="center">
        <img src="https://github.com/user-attachments/assets/c1d4e814-8edd-414e-86cb-540018e67324" width="180" />
      </td>
      <td align="center">
        <img width="180" src="https://github.com/user-attachments/assets/7110ee53-3b26-4459-a0ba-55758c94c565" />
      </td>
      <td align="center">
        <img width="180" src="https://github.com/user-attachments/assets/62b921d2-75a4-4b1e-9f7b-966324f4838c" />
      </td>
    </tr>
  </table>
</div>

## 🌐 English Overview

**SmartMine** is an end-to-end intelligent mining fleet management and telemetry prototype developed as a software Proof-of-Concept (PoC) for a Bachelor’s thesis. It bridges the theoretical concepts of **Industrial Internet of Things (IIoT)**, **Wireless Sensor Networks (WSN)**, and **Generative AI** into an interactive, high-performance web application.

In open-pit surface mining, loading and haulage account for more than **50–60% of total operational costs**. Traditional operations suffer from static truck allocation, excessive idling, shovel queue congestion, and uneven equipment wear. **SmartMine** addresses these bottlenecks through deterministic multi-criteria dispatch optimization, real-time telemetry streaming, predictive maintenance anomaly detection, and natural language AI coaching.

---

### ✨ Key Highlights

- 🚚 **Dynamic Smart Dispatching:** Evaluates shovel queues, Euclidean distance, travel times, and vehicle health to assign trucks dynamically and reduce cycle bottlenecks.
- 📊 **Multi-Dimensional Driver Scoring:** Calculates balanced performance scores based on production tonnage, cycle efficiency, safety compliance (speeding/harsh braking), and fuel consumption.
- 🔧 **Simulated Predictive Maintenance (PdM):** Detects emerging anomalies in engine temperature, chassis vibration, and hydraulic oil pressure before equipment breakdowns occur.
- 📡 **Real-Time IoT Telemetry Stream:** Live CAN-Bus & WSN sensor emulation with interactive gauges, jitter simulation, and status indicators.
- 🤖 **Resilient Multi-tier Generative AI:** Integrated with **Google Gemini** (with fallback to OpenAI and an offline **Domain Expert Engine**) providing contextual advice without external dependencies.
- 📈 **Fleet Simulation & ROI Comparison:** Models 30–50 truck fleets across shifts and proves an **11.4% increase in production tonnage** and a **33.7% reduction in queue waiting time**.
- 🇮🇷 **Native Persian RTL & Industrial Dark UI:** Tailored with a specialized graphite and mining gold theme (`#D97706`) and the Vazirmatn font.

---

## 🏛️ System Architecture

SmartMine strictly adheres to the principle of **"Data and Deterministic Logic before AI"**. Mission-critical engineering calculations are computed deterministically via mathematical models; the GenAI layer acts exclusively as an explanation and coaching assistant.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SmartMine Architecture Flow                           │
└─────────────────────────────────────────────────────────────────────────────┘
  Driver & Mining Assets (D-102 / T-27)
         │
         ▼
  IoT / WSN Telemetry Layer (Temperature, Vibration, Pressure, Payload, GPS)
         │
         ▼
  FastAPI High-Performance Backend Gateway
         │
         ├───────────────────────────────┬───────────────────────────────┐
         ▼                               ▼                               ▼
  Smart Dispatch Engine           Driver Performance              Predictive Health
  (Queue & Distance Balancing)    (4-Factor KPI Scoring)          (Vibration & Temp PdM)
         │                               │                               │
         └───────────────────────────────┼───────────────────────────────┘
                                         ▼
                     Multi-Tier Resilient GenAI Layer
               (Google Gemini ➔ OpenAI ➔ Domain Expert Engine)
                                         │
                                         ▼
                 React 18 + TypeScript + Tailwind CSS Frontend
```

---

## 🧩 12 Core Interactive Pages

| # | Page / Module | Key Functions |
|:---:|:---|:---|
| **1** | **Login & Identity** | Operator sign-in (`D-102`), truck assignment (`T-27`), shift selection, and live IIoT connection status. |
| **2** | **Operational Dashboard** | High-level summary: speed, payload, engine temperature, fuel level, active mission, and AI tips. |
| **3** | **Shift Performance Input** | Form to submit shift metrics (cycles, tonnage, idle time, queue delay, speeding events, notes). |
| **4** | **Performance Report & Coaching** | Radial KPI gauge, radar score breakdown, positive/improvement points, and AI coaching. |
| **5** | **Smart Tactical Dispatch** | Interactive SVG pit map, real-time shovel queue monitoring, 8-phase mission state machine. |
| **6** | **Vehicle Health & PdM** | Subsystem health indices (engine, brakes, transmission, tires), vibration trends, and maintenance warnings. |
| **7** | **IoT Telemetry Stream** | 12 live sensor streams, dynamic jitter simulation toggle, and CAN-Bus data feeds. |
| **8** | **SmartMine AI Assistant** | Persian conversational assistant with complete real-time truck and dispatch context. |
| **9** | **Mining Fleet Simulation** | Discrete simulation engine modeling 30–50 trucks, queue accumulation, and cumulative shift tonnage. |
| **10** | **Traditional vs. Smart Comparison**| Statistical side-by-side comparison with Recharts showing ROI and financial savings. |
| **11** | **Alerts & Notifications** | Centralized notification center with severity filtering (Info, Success, Warning, Danger). |
| **12** | **Driver Profile & Badges** | Historical scores, total tonnage transported, safety badges, and career logs. |

---

## ⚡ Quickstart & Installation

### Prerequisites
- **Python 3.11+** or **3.13+**
- **Node.js 18+** and **npm**

### 1. Backend Setup (FastAPI)
```bash
# Clone the repository
git clone https://github.com/Petrosbid/smartmine.git
cd smartmine/smartmine-back

# Create and activate Python virtual environment
python -m venv .venv
# On Windows PowerShell:
.venv\Scripts\Activate.ps1
# On Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# (Optional) Configure environment variables in .env
# AI_PROVIDER=google
# AI_API_KEY=your_gemini_api_key
# AI_MODEL=gemini-2.5-flash

# Run the backend API server
python main.py
```
> 🚀 **Backend runs at:** `http://127.0.0.1:8000` (Interactive API Docs: `http://127.0.0.1:8000/docs`)

### 2. Frontend Setup (React + Vite)
```bash
# Open a new terminal and navigate to frontend directory
cd smartmine/smartmine-web

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```
> 🌐 **Frontend runs at:** `http://localhost:5173`

---

## 🧪 Testing & Quality Assurance

SmartMine includes automated unit and integration tests covering authentication, dispatch algorithms, performance calculations, telemetry, and simulation.

```bash
cd smartmine/smartmine-back
python -m pytest
```
```text
tests/test_ai_and_simulation.py ....               [ 40% ]
tests/test_auth.py .                               [ 50% ]
tests/test_dispatch.py ..                          [ 70% ]
tests/test_health.py .                             [ 80% ]
tests/test_performance.py .                        [ 90% ]
tests/test_telemetry_and_health.py .               [ 100% ]

============================= 10 passed in 100% =============================
```

---

<div dir="rtl">

---

## 🇮🇷 بخش فارسی: راهنمای جامع پروژه

### سامانه هوشمند مدیریت ناوگان و ترابری معدن (SmartMine)
**پروتوتایپ نرم‌افزاری و اثبات مفهوم (PoC) پروژه کارشناسی مهندسی کامپیوتر / فناوری اطلاعات / مهندسی معدن**

---

### 📖 معرفی پروژه
پروژه **SmartMine**، پیاده‌سازی کاربردی و عملیاتی سند تئوریک رساله کارشناسی (`project.pdf` - مشتمل بر ۱۵ فصل و ۱۹۱ صفحه) است. در حالی که رساله به بررسی آکادمیک معماری‌های اینترنت اشیا صنعتی (IIoT)، شبکه‌های حسگر بی‌سیم (WSN) و چالش‌های ترابری در معادن روباز پرداخته است، این نرم‌افزار به عنوان یک **سیستم اثبات مفهوم (PoC) تمام‌عیار** پیاده‌سازی شده تا تمامی جریان‌های داده‌ای، الگوریتم‌های دیسپچینگ، پایش سلامت خودرو و مربی‌گری هوش مصنوعی را به شکلی زنده و تعاملی به نمایش بگذارد.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                        موتورهای محاسباتی SmartMine                          │
├──────────────────────────┬──────────────────────────────────────────────────┤
│ 🎯 الگوریتم دیسپچینگ پویا │ بهینه‌سازی ۵ عامله بر پایه صف، فاصله و سلامت ماشین │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ 🏆 موتور امتیازدهی راننده │ ارزیابی چندبعدی بر پایه تولید، راندمان، ایمنی و سوخت│
├──────────────────────────┼──────────────────────────────────────────────────┤
│ 🔧 نگهداری پیش‌بینانه    │ تشخیص زودهنگام ناهنجاری ارتعاشات، دما و فشار روغن │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ 🤖 هوش مصنوعی مولد تاب‌آور│ تحلیل تفسیری با جمنای و موتور تخصصی آفلاین معدن    │
└──────────────────────────┴──────────────────────────────────────────────────┘
```

---

### 🚀 ویژگی‌های کلیدی سامانه

1. **دیسپچینگ پویا و نقشه تاکتیکی پیت معدن:**
   * نمایش زنده موقعیت شاول‌ها، سنگ‌شکن‌ها و دامپتراک‌ها روی نقشه برداری SVG.
   * پایش لحظه‌ای طول صف و ارسال هشدار خودکار در صورت وقوع گلوگاه ترافیکی.
   * پیشنهاد بهینه‌ترین شاول و امکان اعمال آنی مأموریت جدید روی خودرو.

2. **کارنامه هوشمند و مربی‌گری عملکرد راننده:**
   * تفکیک امتیازات شیفت در ۴ حوزه: **تولید (۳۰٪)**، **راندمان (۲۵٪)**، **ایمنی (۳۰٪)** و **مدیریت سوخت (۱۵٪)**.
   * ارائه تحلیل تفصیلی و ۳ توصیه کلیدی به زبان فارسی روان توسط لایه هوش مصنوعی.

3. **پایش سلامت فنی و نگهداری پیش‌بینانه (PdM):**
   * ارزیابی درصد سلامت موتور، گیربکس، ترمز، لاستیک‌ها و هیدرولیک.
   * ثبت روند افزایشی لرزش شاسی ($g$) و صدور خودکار هشدارهای بحرانی قبل از رخداد شکست مکانیکی.

4. **تله‌متری بلادرنگ اینترنت اشیا (Live IoT Telemetry):**
   * شبیه‌سازی زنده ۱۲ حسگر صنعتی خودرویی بر بستر CAN-Bus و WSN با قابلیت ایجاد نوسانات طبیعی.

5. **دستیار هوشمند و گفتگوی فارسی SmartMine AI:**
   * پاسخ‌گویی به سوالات فنی راننده با دسترسی کامل به بافت تله‌متری و وضعیت ناوگان.
   * مجهز به موتور آفلاین داخلی جهت تضمین ارائه بی‌نقص در جلسات دفاع حتی در صورت قطعی اینترنت.

6. **شبیه‌سازی ناوگان و تحلیل بازده سرمایه‌گذاری (ROI):**
   * شبیه‌سازی گام‌به‌گام کارکرد ۳۰ تا ۵۰ دامپتراک در شیفت‌های کاری.
   * مقایسه آماری روش سنتی در برابر SmartMine: **+۱۱.۴٪ افزایش تناژ تولیدی**، **-۳۳.۷٪ کاهش زمان صف**، **-۴۰.۴٪ کاهش زمان درجا کار کردن موتور** و **صرفه‌جویی سالانه ۳.۸ میلیارد تومانی**.

---

### 📊 مقایسه عملکرد: روش سنتی در برابر سامانه هوشمند SmartMine

| شاخص کلیدی عملیاتی (KPI) | سامانه سنتی (بیسیم و ایستا) | سامانه هوشمند SmartMine | میزان بهبود / تغییر | ارزش مهندسی و عملیاتی |
|:---|:---:|:---:|:---:|:---|
| **تولید شیفت (تناژ استخراج)** | ۸,۴۲۰ تن | ۹,۳۸۰ تن | **+۱۱.۴٪** | توازن بارگیری و بهره‌گیری حداکثری از ظرفیت ناوگان |
| **میانگین زمان معطلی در صف** | ۹.۲ دقیقه | ۶.۱ دقیقه | **-۳۳.۷٪** | حذف ترافیک شاول‌ها با هدایت هوشمند خودروها |
| **میانگین زمان کل چرخه** | ۳۶.۴ دقیقه | ۲۹.۸ دقیقه | **-۱۸.۱٪** | تسریع در انتقال بار به سنگ‌شکن و دپوها |
| **زمان درجا کار کردن موتور** | ۵۲ دقیقه | ۳۱ دقیقه | **-۴۰.۴٪** | کاهش اتلاف سوخت و استهلاک قطعات در توقف‌ها |
| **مصرف گازوئیل ناوگان** | ۴۱۰ لیتر | ۳۶۵ لیتر | **-۱۱.۰٪** | رانندگی اقتصادی و راندمان حرارتی بالاتر |
| **شاخص راندمان کلی ناوگان (OEE)**| ۷۴٪ | ۸۸٪ | **+۱۸.۹٪** | افزایش چشمگیر اثربخشی کلی تجهیزات معدنی |
| **کاهش انتشار گازهای گلخانه‌ای** | مبنای سنجش | ۱۲۴ تن CO₂ سالانه | **صرفه‌جویی پایدار** | کاهش مستقیم ردپای کربن در محیط زیست |

---

### 🎬 سناریوی ۵ تا ۷ دقیقه‌ای برای ارائه در جلسه دفاع کارشناسی

1. **ورود و داشبورد عملیاتی:** لاگین با کد راننده `D-102` و کامیون `T-27`، نمایش اتصال سبز IIoT و شاخص‌های زنده.
2. **مأموریت هوشمند و دیسپچ پویا:** نمایش هشدار صف ۸ کامیونی در شاول ۲، کلیک روی «محاسبه بهینه‌ترین مأموریت» و اعمال پیشنهاد شاول ۳ با ۱۹٪ صرفه‌جویی زمانی.
3. **ثبت عملکرد و کارنامه:** ثبت داده‌های شیفت و دریافت کارنامه ۴ بعدی به همراه تحلیل تفسیری هوش مصنوعی.
4. **سلامت کامیون و نگهداری پیش‌بینانه:** نمایش نمودار لرزش و هشدارهای پیشگیرانه تعویض قطعه.
5. **دستیار هوشمند SmartMine AI:** گفتگوی فارسی با دستیار هوشمند در خصوص وضعیت سلامت و مأموریت.
6. **شبیه‌سازی و مقایسه جامع:** اجرای شبیه‌سازی ۴۰ کامیون و ارائه جدول مقایسه‌ای سودآوری اقتصادی ۳.۸ میلیارد تومانی.

</div>

---

## 📁 Repository Structure

```text
smartmine/
├── smartmine-back/                  # FastAPI Backend Application
│   ├── app/
│   │   ├── algorithms/              # Deterministic Dispatch, Performance, PdM & Simulation
│   │   ├── api/v1/                  # Versioned REST Endpoints
│   │   ├── core/                    # App Configuration, Enums & Database Engine
│   │   ├── models/                  # SQLAlchemy ORM Models (Drivers, Trucks, Missions, etc.)
│   │   ├── repositories/            # Data Access & Repository Pattern
│   │   ├── schemas/                 # Pydantic v2 Request/Response Schemas
│   │   └── services/                # Business Logic & Multi-tier AI Service
│   ├── tests/                       # Pytest Automated Test Suite
│   ├── requirements.txt             # Python Dependencies
│   └── main.py                      # Backend Entry Point
│
├── smartmine-web/                   # React 18 + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── components/layout/       # AppShell, Sidebar, Header
│   │   ├── components/ui/           # Reusable UI Cards, Badges, Charts, Tooltips
│   │   ├── context/                 # Global AppStateContext (Session, Telemetry, Demo Mode)
│   │   ├── data/                    # Fallback Mining Datasets & Simulation Constants
│   │   ├── hooks/                   # useTelemetrySimulation Custom Hook
│   │   ├── pages/                   # 12 Interactive Mining Fleet Management Pages
│   │   ├── services/api/            # REST API Client & Mappers
│   │   ├── services/mock/           # Standalone Offline Mock Services
│   │   └── types/                   # TypeScript Domain Definitions
│   ├── package.json                 # Node Dependencies & Build Scripts
│   └── vite.config.ts               # Vite Configuration
│
├── SmartMine_Implementation_Report.md # Comprehensive Persian Academic Implementation Report
├── SmartMine_Prototype_Implementation.md # Prototype Design & Engineering Specification
└── README.md                        # Bilingual Project Documentation (This File)
```

---

## 👨‍💻 Academic Context & Authorship

- **Project Type:** Bachelor's Thesis Software Implementation & Proof of Concept (PoC)
- **Reference Document:** Theoretical Thesis Report (`project.pdf` - 191 Pages, 15 Chapters)
- **Target Domain:** Mining Engineering / Computer Engineering / Industrial IoT (IIoT)

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use and adapt it for academic, research, and educational purposes.
