# ⚡ WattDrive: Global EV, Fuel & Solar Calculator

> **Production-Ready, Offline-First Mobile Architecture (React + Vite + TypeScript + Tailwind CSS + CapacitorJS)**

WattDrive is a mobile-first, offline-first application designed to calculate EV commute ROI, size home solar PV and lithium battery storage systems, and manage multi-vehicle maintenance schedules across global regions. Built to run fluidly on web and wrap seamlessly into native Android/iOS apps via **CapacitorJS**.

---

## 🌟 Key Architecture & Capabilities

### 1. 🌍 Globalization & Localization Engine
- **Instant Region/Currency Presets:**
  - 🇺🇸 **USA:** `$ USD`, `Miles`, `US Gallons`, `MPG` & `mi/kWh`, `120V/240V`
  - 🇬🇧 **UK:** `£ GBP`, `Miles`, `Litres`, `MPG` & `mi/kWh`, `230V`
  - 🇪🇺 **Europe (EU):** `€ EUR`, `Kilometers`, `Litres`, `L/100km` & `kWh/100km`, `230V`
  - 🇦🇪 **UAE / Gulf (GCC):** `AED`, `Kilometers`, `Litres`, `km/L` & `kWh/100km`, `230V`
  - 🇵🇰/🇮🇳 **South Asia:** `Rs PKR` / `₹ INR`, `Kilometers`, `Litres`, `km/L` & `km/kWh`, `220V/230V`
  - 🇦🇺/🇨🇦 **Australia & Canada:** `A$ AUD` / `C$ CAD`, `Kilometers`, `Litres`, `L/100km`, `230V`/`120V`
- Dynamically updates all calculation formulas, conversion factors, and default local fuel and electricity tariffs with zero configuration required.
- Custom Tuning Drawer allows users to override fuel rates, grid tariffs, grid voltage, and solar irradiance.
- All preferences persisted 100% offline in `localStorage`.

---

### 2. 📱 Mobile Native UI/UX & AdMob Safe Zone
- **Viewport Constraints:** Max-width `430px` centered on desktop displays, edge-to-edge native layout on mobile.
- **Dark-Mode Slate/Emerald Aesthetic:** High-contrast `#0f172a` backdrop with `#10b981` emerald accents and `#06b6d4` cyan accents.
- **Native Experience:** Global `user-select: none`, disabled horizontal bounce scrolling, smooth native tab transitions, and animated bottom sheet modals.
- **Strict AdMob 65px Safe Zone:** Fixed `65px` bottom spacer reserved below the bottom navigation bar so native AdMob Adaptive Banners never obstruct interactive buttons.

---

### 3. 🚀 Core Application Tabs

#### 🚗 Tab 1: Commute & EV ROI Calculator
- Side-by-side running cost comparison: **Gas/Petrol vs. Hybrid vs. Electric Vehicle (EV)**.
- Sliders and numeric inputs for daily roundtrip distance, days driven per week, and vehicle efficiencies.
- Solar / Off-Peak charging toggle with automatic tariff discount calculation.
- Instant financial metrics: Daily, Monthly, Annual, and 5-Year Compounded Savings.
- Horizontal CSS comparison bar chart comparing monthly expenditures.
- Real-time **Annual CO₂ Avoided Badge** in metric tons.

#### ☀️ Tab 2: Home Solar & EV Charger Sizer
- Calculates required Solar PV Array size (`kW`) and Lithium Battery Bank capacity (`kWh`) to cover EV charging plus home loads.
- Interactive load counters: Inverter ACs / Heat Pumps (with usage hours), Refrigerators, and continuous base household loads (Watts).
- Peak Sun Hours slider calibrated from 3.0h (Northern Europe) to 6.5h+ (Sunbelt/Middle East/South Asia).
- Financial metrics: Recommended PV size, Hybrid Inverter rating, Battery capacity, total estimated system investment, and payback period.
- **"Generate Printable Spec Sheet"** action button: produces an exportable contractor-ready spec sheet with copy and print/PDF support.

#### 🔧 Tab 3: Multi-Vehicle Maintenance & Service Garage
- Fleet tracker supporting Cars, EVs, Hybrids, and Motorcycles stored 100% offline.
- Odometer tracker with fast-update logger.
- Preset maintenance schedules:
  - *Internal Combustion & Hybrid:* Engine Oil & Filter (0W-20 / 10W-40), Tire Rotation, Brake Pads & Rotors, Cabin & Engine Air Filters, Coolant.
  - *Electric Vehicles (EV):* Tire Rotation & Alignment, Cabin HEPA Filter, Brake Fluid & Regenerative System Inspection, High-Voltage Battery Coolant Exchange.
- Dynamic color-coded health bars (**Green** > 25% remaining, **Amber** ≤ 25% remaining, **Red** Overdue).
- "Log Service Done" button resets service intervals and triggers celebratory feedback.

---

### 4. 📢 AdMob Bridge Architecture (`src/services/admobService.ts`)
- TypeScript singleton providing:
  - `initAds()`: Safely boots native Capacitor AdMob plugins when running on Android/iOS, with graceful web simulator fallback.
  - `showBottomBanner()`: Activates adaptive banner anchored strictly in the 65px safe zone.
  - `recordUserAction()`: Increments persistent action counter in `localStorage` and triggers full-screen interstitial ad every **3rd major user action** (Odometer updates, logging services, generating spec sheets).

---

## 🛠️ Tech Stack
- **Framework:** React 19 + TypeScript
- **Bundler:** Vite 8
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Celebration Effects:** Canvas Confetti
- **Native Wrapper:** CapacitorJS (`@capacitor/core`, `@capacitor/cli`)

---

## 🏃 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

---

## 📱 Native Android Build with Capacitor

To build an Android APK or launch in Android Studio:

```bash
# 1. Build the production web assets
npm run build

# 2. Add Android platform (if not already added)
npx cap add android

# 3. Synchronize assets to native Android project
npx cap sync

# 4. Open in Android Studio to run on emulator or physical device
npx cap open android
```

---

## 📄 License
MIT License. Created by [sigmahji](https://github.com/sigmahji).
