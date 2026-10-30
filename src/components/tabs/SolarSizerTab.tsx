import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { admobService } from '../../services/admobService';
import {
  Sun,
  BatteryCharging,
  Cpu,
  FileText,
  Zap,
  Plus,
  Minus,
  Download,
  Share2,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SolarSizerTab: React.FC = () => {
  const { settings, formatCurrency } = useSettings();

  // Inputs
  const [dailyEvDistance, setDailyEvDistance] = useState<number>(settings.distanceUnit === 'mi' ? 35 : 55);
  const [peakSunHours, setPeakSunHours] = useState<number>(settings.peakSunHours || 5.0);
  const [acUnits, setAcUnits] = useState<number>(2);
  const [acHoursPerDay, setAcHoursPerDay] = useState<number>(7);
  const [fridgeCount, setFridgeCount] = useState<number>(1);
  const [baseLoadWatts, setBaseLoadWatts] = useState<number>(450);
  const [includeBattery, setIncludeBattery] = useState<boolean>(true);

  // Modal spec sheet state
  const [isSpecSheetOpen, setIsSpecSheetOpen] = useState<boolean>(false);
  const [copiedSpec, setCopiedSpec] = useState<boolean>(false);

  // EV Energy Need (kWh/day)
  const defaultEvEff = settings.evEfficiencyUnit === 'kWh/100km' ? 16.5 : settings.evEfficiencyUnit === 'mi/kWh' ? 3.8 : 6.2;
  const evDailyKwh =
    settings.evEfficiencyUnit === 'kWh/100km'
      ? (dailyEvDistance * defaultEvEff) / 100
      : dailyEvDistance / (defaultEvEff || 1);

  // Home Loads Energy Need (kWh/day)
  // Inverter AC: ~1350W average when running
  const acDailyKwh = (acUnits * 1350 * acHoursPerDay) / 1000;
  // Fridge: 150W with 0.45 duty cycle
  const fridgeDailyKwh = (fridgeCount * 150 * 24 * 0.45) / 1000;
  // Base load continuous 24h
  const baseDailyKwh = (baseLoadWatts * 24) / 1000;

  const totalDailyKwh = evDailyKwh + acDailyKwh + fridgeDailyKwh + baseDailyKwh;

  // Sizing Calculations:
  // Solar Derate Factor: 0.80 (losses for heat, dust, wiring, inversion)
  const derateFactor = 0.80;
  const rawSolarKw = totalDailyKwh / (peakSunHours * derateFactor);
  // Round to nearest 0.5 kW
  const recommendedSolarKw = Math.max(2.5, Math.ceil(rawSolarKw * 2) / 2);

  // Inverter Sizing: Peak simultaneous power + 25% surge headroom
  // Concurrent loads: Base + ACs (80% concurrent) + Level 2 EV EVSE (~3.6kW to 7.2kW)
  const evsePeakKw = settings.gridVoltage.includes('120') ? 3.3 : 4.4;
  const peakSimultaneousWatts = baseLoadWatts + (acUnits * 1350 * 0.8) + (evsePeakKw * 1000);
  const inverterKwHeadroom = (peakSimultaneousWatts * 1.25) / 1000;
  const recommendedInverterKw = Math.max(5.0, Math.ceil(Math.max(recommendedSolarKw * 0.85, inverterKwHeadroom)));

  // Lithium Battery Bank Sizing (LiFePO4 with 85% DoD):
  // Supplies ~55% of total load overnight including off-sun EV top-up
  const nightlyEnergyKwh = totalDailyKwh * 0.55;
  const rawBatteryKwh = includeBattery ? nightlyEnergyKwh / 0.85 : 0;
  // Common modular sizes: 5kWh modules
  const batteryModules = Math.max(1, Math.ceil(rawBatteryKwh / 5));
  const recommendedBatteryKwh = includeBattery ? batteryModules * 5 : 0;

  // Financial Estimates:
  const costPerWatt = settings.solarCostPerWatt || 2.5;
  const pvCost = recommendedSolarKw * 1000 * costPerWatt;
  // Battery approx cost per kWh based on currency
  const isHighUnitCurrency = settings.currencyCode === 'PKR' || settings.currencyCode === 'INR';
  const batteryCostPerKwh = isHighUnitCurrency ? costPerWatt * 400 : 350;
  const batteryCost = includeBattery ? recommendedBatteryKwh * batteryCostPerKwh : 0;
  const inverterAndBalanceCost = recommendedInverterKw * (isHighUnitCurrency ? 35000 : 280);

  const estimatedTotalCost = pvCost + batteryCost + inverterAndBalanceCost;

  // Annual Generation & Grid Bill Offset
  const annualSolarGenerationKwh = recommendedSolarKw * peakSunHours * 365 * derateFactor;
  const annualBillSavings = Math.min(annualSolarGenerationKwh, totalDailyKwh * 365) * settings.electricityTariff;
  const paybackYears = annualBillSavings > 0 ? (estimatedTotalCost / annualBillSavings).toFixed(1) : 'N/A';

  const handleGenerateSpecSheet = async () => {
    // Record action in AdMob service (triggers every 3 actions)
    await admobService.recordUserAction();

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {
      // ignore
    }

    setIsSpecSheetOpen(true);
  };

  const copySpecSummary = () => {
    const summary = `WattDrive System Spec Sheet
----------------------------------
Region: ${settings.region.toUpperCase()} (${settings.currencyCode})
Daily Consumption: ${totalDailyKwh.toFixed(1)} kWh/day
- EV Commute Load: ${evDailyKwh.toFixed(1)} kWh (${dailyEvDistance} ${settings.distanceUnit})
- Household AC & Base: ${(acDailyKwh + fridgeDailyKwh + baseDailyKwh).toFixed(1)} kWh

RECOMMENDED SPECS:
- Solar Array: ${recommendedSolarKw} kW PV (${Math.round((recommendedSolarKw * 1000) / 550)} x 550W Tier-1 Panels)
- Hybrid Inverter: ${recommendedInverterKw} kW Pure Sine Wave (${settings.gridVoltage})
- Lithium Battery Bank: ${includeBattery ? `${recommendedBatteryKwh} kWh LiFePO4 (${batteryModules}x 5kWh units)` : 'Grid-Tied (No Battery)'}
- Annual Clean Generation: ${Math.round(annualSolarGenerationKwh).toLocaleString()} kWh/yr
- Est. System Cost: ${formatCurrency(estimatedTotalCost)}
- Est. Payback: ${paybackYears} Years
----------------------------------
Generated by WattDrive Mobile App`;

    navigator.clipboard?.writeText(summary);
    setCopiedSpec(true);
    setTimeout(() => setCopiedSpec(false), 2500);
  };

  return (
    <div className="space-y-4 pb-2">
      {/* Sizing Recommendations Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-950/70 via-slate-900 to-slate-900 border border-cyan-500/30 p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
            <Sun className="w-4 h-4" />
            <span>Optimal Solar & Storage Blueprint</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            {totalDailyKwh.toFixed(1)} kWh / Day
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center my-2">
          {/* Solar Array Size */}
          <div className="bg-slate-800/80 rounded-xl p-2.5 border border-cyan-500/30">
            <div className="text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1">
              <Sun className="w-3 h-3 text-amber-400" />
              <span>Solar PV</span>
            </div>
            <div className="text-xl font-black text-cyan-300 mt-0.5 font-mono">
              {recommendedSolarKw} <span className="text-xs font-bold text-slate-400">kW</span>
            </div>
            <div className="text-[9px] text-slate-400">
              ~{Math.round((recommendedSolarKw * 1000) / 550)} panels
            </div>
          </div>

          {/* Hybrid Inverter Size */}
          <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/60">
            <div className="text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1">
              <Cpu className="w-3 h-3 text-emerald-400" />
              <span>Inverter</span>
            </div>
            <div className="text-xl font-black text-emerald-300 mt-0.5 font-mono">
              {recommendedInverterKw} <span className="text-xs font-bold text-slate-400">kW</span>
            </div>
            <div className="text-[9px] text-emerald-400/90 font-mono">{settings.gridVoltage}</div>
          </div>

          {/* Battery Bank */}
          <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/60">
            <div className="text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1">
              <BatteryCharging className="w-3 h-3 text-teal-400" />
              <span>Lithium</span>
            </div>
            <div className="text-xl font-black text-teal-300 mt-0.5 font-mono">
              {includeBattery ? recommendedBatteryKwh : '0'} <span className="text-xs font-bold text-slate-400">kWh</span>
            </div>
            <div className="text-[9px] text-slate-400">
              {includeBattery ? `${batteryModules}x 5kWh` : 'Grid Only'}
            </div>
          </div>
        </div>

        {/* Financial ROI strip */}
        <div className="pt-2.5 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center justify-between bg-slate-800/50 px-2.5 py-1.5 rounded-lg">
            <span className="text-slate-400 text-[11px]">Estimated Investment:</span>
            <span className="font-bold text-white font-mono">{formatCurrency(estimatedTotalCost)}</span>
          </div>
          <div className="flex items-center justify-between bg-slate-800/50 px-2.5 py-1.5 rounded-lg">
            <span className="text-slate-400 text-[11px]">Est. Payback:</span>
            <span className="font-bold text-emerald-400 font-mono">{paybackYears} Years</span>
          </div>
        </div>
      </div>

      {/* Inputs: Daily EV Mileage & Sun Hours */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>EV Charging & Climate Inputs</span>
        </h3>

        {/* Daily EV Driving */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-slate-300">Daily EV Distance Added</span>
            <span className="font-mono text-cyan-400 font-bold">
              {dailyEvDistance} {settings.distanceUnit}/day ({evDailyKwh.toFixed(1)} kWh)
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="200"
            step="5"
            value={dailyEvDistance}
            onChange={(e) => setDailyEvDistance(parseInt(e.target.value) || 10)}
            className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
          />
        </div>

        {/* Peak Sun Hours Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-slate-300">Peak Sun Hours (Solar Irradiance)</span>
            <span className="font-mono text-amber-400 font-bold">{peakSunHours} hrs / day</span>
          </div>
          <input
            type="range"
            min="2.5"
            max="7.5"
            step="0.1"
            value={peakSunHours}
            onChange={(e) => setPeakSunHours(parseFloat(e.target.value) || 2.5)}
            className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>3.0h (UK/North)</span>
            <span>5.0h (Avg)</span>
            <span>6.5h+ (Sunbelt/Gulf)</span>
          </div>
        </div>
      </div>

      {/* Household Loads Quick Counters */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Household Electrical Loads
        </h3>

        {/* Inverter ACs */}
        <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-750 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">Inverter ACs / Heat Pumps</div>
              <div className="text-[10px] text-slate-400">1.5 Ton (~1350W running)</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAcUnits(Math.max(0, acUnits - 1))}
                className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center text-slate-200 hover:bg-slate-600 active:scale-90"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center font-bold text-sm text-cyan-300 font-mono">
                {acUnits}
              </span>
              <button
                onClick={() => setAcUnits(Math.min(8, acUnits + 1))}
                className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center text-slate-200 hover:bg-slate-600 active:scale-90"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {acUnits > 0 && (
            <div className="flex items-center justify-between pt-1 border-t border-slate-700/60 text-[11px]">
              <span className="text-slate-400">Usage hours per unit:</span>
              <div className="flex items-center gap-1.5">
                {[4, 7, 10, 14].map((hr) => (
                  <button
                    key={hr}
                    onClick={() => setAcHoursPerDay(hr)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                      acHoursPerDay === hr
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {hr}h
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Refrigerators */}
        <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-750 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-white">Refrigerators / Freezers</div>
            <div className="text-[10px] text-slate-400">~150W continuous cycle</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFridgeCount(Math.max(0, fridgeCount - 1))}
              className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center text-slate-200 hover:bg-slate-600 active:scale-90"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-6 text-center font-bold text-sm text-cyan-300 font-mono">
              {fridgeCount}
            </span>
            <button
              onClick={() => setFridgeCount(Math.min(5, fridgeCount + 1))}
              className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center text-slate-200 hover:bg-slate-600 active:scale-90"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Base Home Load (Watts) */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-slate-300">Continuous Base Load (Lighting, Fans, Wi-Fi)</span>
            <span className="font-mono text-cyan-400 font-bold">{baseLoadWatts} Watts</span>
          </div>
          <input
            type="range"
            min="150"
            max="1500"
            step="50"
            value={baseLoadWatts}
            onChange={(e) => setBaseLoadWatts(parseInt(e.target.value) || 200)}
            className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
          />
        </div>

        {/* Battery Storage Option Toggle */}
        <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-750 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-white">Include Lithium Battery Storage</div>
            <div className="text-[10px] text-slate-400">Night backup & zero-grid export independence</div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={includeBattery}
              onChange={(e) => setIncludeBattery(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500" />
          </label>
        </div>
      </div>

      {/* Action Button: Generate Printable Spec Sheet */}
      <button
        onClick={handleGenerateSpecSheet}
        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all"
      >
        <FileText className="w-4 h-4" />
        <span>Generate Printable Spec Sheet</span>
      </button>

      {/* Printable Spec Sheet Bottom Sheet Modal */}
      {isSpecSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-[430px] max-h-[90vh] bg-slate-900 border-t border-cyan-500/40 rounded-t-3xl p-5 shadow-2xl overflow-y-auto animate-in slide-in-from-bottom duration-200 flex flex-col gap-4">
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto -mt-1" />

            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">System Spec Sheet</h3>
                  <p className="text-[11px] text-slate-400">Ready for Solar Contractor / EV Installer</p>
                </div>
              </div>
              <button
                onClick={() => setIsSpecSheetOpen(false)}
                className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Spec Sheet Contents */}
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Region Standard:</span>
                <span className="text-white font-bold">{settings.region.toUpperCase()} ({settings.currencyCode})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Daily Demand:</span>
                <span className="text-cyan-400 font-bold">{totalDailyKwh.toFixed(1)} kWh/day</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Recommended Solar PV:</span>
                <span className="text-amber-300 font-bold">{recommendedSolarKw} kW Array</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Panel Breakdown:</span>
                <span className="text-slate-300">{Math.round((recommendedSolarKw * 1000) / 550)}x 550W Tier-1 Mono</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Hybrid Inverter:</span>
                <span className="text-emerald-300 font-bold">{recommendedInverterKw} kW ({settings.gridVoltage})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Lithium Battery:</span>
                <span className="text-teal-300 font-bold">
                  {includeBattery ? `${recommendedBatteryKwh} kWh LiFePO4 (${batteryModules} modules)` : 'None (Grid Tied)'}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2">
                <span className="text-slate-400">Est. Annual Yield:</span>
                <span className="text-white font-bold">{Math.round(annualSolarGenerationKwh).toLocaleString()} kWh / yr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Est. Total Investment:</span>
                <span className="text-emerald-400 font-bold">{formatCurrency(estimatedTotalCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estimated Payback:</span>
                <span className="text-cyan-400 font-bold">{paybackYears} Years</span>
              </div>
            </div>

            {/* Spec Sheet Actions */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={copySpecSummary}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                {copiedSpec ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                <span>{copiedSpec ? 'Copied to Clipboard' : 'Copy Specs'}</span>
              </button>

              <button
                onClick={() => {
                  window.print();
                }}
                className="py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
              >
                <Download className="w-4 h-4" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
