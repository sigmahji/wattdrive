import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import {
  Car,
  Zap,
  TrendingDown,
  Leaf,
  Sun,
  Flame,
  Calendar,
} from 'lucide-react';

export const CommuteRoiTab: React.FC = () => {
  const { settings, updateSettings, formatCurrency, getEffectiveElectricityTariff } = useSettings();

  // Local state for commute calculator
  const [dailyDistance, setDailyDistance] = useState<number>(settings.distanceUnit === 'mi' ? 40 : 65);
  const [daysPerWeek, setDaysPerWeek] = useState<number>(5);

  // Vehicle efficiencies
  const [gasEfficiency, setGasEfficiency] = useState<number>(settings.fuelEfficiencyUnit === 'L/100km' ? 7.5 : settings.fuelEfficiencyUnit === 'MPG' ? 28 : 13.0);
  const [hybridEfficiency, setHybridEfficiency] = useState<number>(settings.fuelEfficiencyUnit === 'L/100km' ? 4.5 : settings.fuelEfficiencyUnit === 'MPG' ? 52 : 22.0);
  const [evEfficiency, setEvEfficiency] = useState<number>(settings.evEfficiencyUnit === 'kWh/100km' ? 16.5 : settings.evEfficiencyUnit === 'mi/kWh' ? 3.8 : 6.2);

  // Time periods
  const weeklyDistance = dailyDistance * daysPerWeek;
  const monthlyDistance = weeklyDistance * (52 / 12);
  const annualDistance = weeklyDistance * 52;

  const currentElectricityTariff = getEffectiveElectricityTariff();

  // Cost per unit distance calculation
  const getGasCostPerUnit = (eff: number): number => {
    if (eff <= 0) return 0;
    if (settings.fuelEfficiencyUnit === 'MPG') {
      if (settings.fuelUnit === 'L') {
        // UK Gallon = 4.54609 Litres
        const litresPerMile = 4.54609 / eff;
        return litresPerMile * settings.fuelPrice;
      }
      // US Gallon
      return settings.fuelPrice / eff;
    } else if (settings.fuelEfficiencyUnit === 'km/L') {
      return settings.fuelPrice / eff;
    } else {
      // L/100km
      return (eff / 100) * settings.fuelPrice;
    }
  };

  const getEvCostPerUnit = (eff: number): number => {
    if (eff <= 0) return 0;
    if (settings.evEfficiencyUnit === 'mi/kWh' || settings.evEfficiencyUnit === 'km/kWh') {
      return currentElectricityTariff / eff;
    } else {
      // kWh/100km
      return (eff / 100) * currentElectricityTariff;
    }
  };

  const gasCostPerDistance = getGasCostPerUnit(gasEfficiency);
  const hybridCostPerDistance = getGasCostPerUnit(hybridEfficiency);
  const evCostPerDistance = getEvCostPerUnit(evEfficiency);

  // Monthly costs
  const gasMonthlyCost = monthlyDistance * gasCostPerDistance;
  const hybridMonthlyCost = monthlyDistance * hybridCostPerDistance;
  const evMonthlyCost = monthlyDistance * evCostPerDistance;

  // Annual costs
  const gasAnnualCost = annualDistance * gasCostPerDistance;
  const evAnnualCost = annualDistance * evCostPerDistance;

  // Savings (EV vs Gas)
  const monthlySavings = Math.max(0, gasMonthlyCost - evMonthlyCost);
  const annualSavings = Math.max(0, gasAnnualCost - evAnnualCost);
  const fiveYearSavings = annualSavings * 5;

  // CO2 Emissions Avoided calculation
  // Petrol emissions: ~8.887 kg CO2 / US Gal or 2.31 kg CO2 / L
  const co2FactorPerFuelUnit = settings.fuelUnit === 'gal' ? 8.887 : 2.31;
  const gasUnitsConsumedYearly =
    settings.fuelEfficiencyUnit === 'MPG'
      ? settings.fuelUnit === 'L'
        ? (annualDistance * 4.54609) / (gasEfficiency || 1)
        : annualDistance / (gasEfficiency || 1)
      : settings.fuelEfficiencyUnit === 'km/L'
      ? annualDistance / (gasEfficiency || 1)
      : (annualDistance * (gasEfficiency || 1)) / 100;

  const gasAnnualCo2Kg = gasUnitsConsumedYearly * co2FactorPerFuelUnit;

  // EV grid CO2 emissions (approx 0.38 kg/kWh if grid, 0 if solar)
  const evKwhUsedYearly =
    settings.evEfficiencyUnit === 'kWh/100km'
      ? (annualDistance * evEfficiency) / 100
      : annualDistance / (evEfficiency || 1);

  const evAnnualCo2Kg = settings.useSolarOrOffPeak ? 0 : evKwhUsedYearly * 0.38;
  const netCo2SavedKg = Math.max(0, gasAnnualCo2Kg - evAnnualCo2Kg);
  const netCo2SavedTons = netCo2SavedKg / 1000;

  // Maximum for bar chart comparison
  const maxMonthly = Math.max(gasMonthlyCost, hybridMonthlyCost, evMonthlyCost, 1);

  return (
    <div className="space-y-4 pb-2">
      {/* Hero Savings Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/30 p-4 shadow-xl">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <TrendingDown className="w-4 h-4" />
            <span>EV Commute ROI & Savings</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            vs Gas Vehicle
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center my-3">
          <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/60">
            <div className="text-[10px] text-slate-400 font-medium">Monthly Saved</div>
            <div className="text-base font-extrabold text-white mt-0.5 truncate">
              {formatCurrency(monthlySavings)}
            </div>
            <div className="text-[9px] text-emerald-400 font-medium">per month</div>
          </div>

          <div className="bg-emerald-900/40 rounded-xl p-2.5 border border-emerald-500/40 relative">
            <div className="text-[10px] text-emerald-300 font-medium">Annual Saved</div>
            <div className="text-lg font-black text-emerald-300 mt-0.5 truncate">
              {formatCurrency(annualSavings)}
            </div>
            <div className="text-[9px] text-emerald-400/90 font-medium">1 Year ROI</div>
          </div>

          <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/60">
            <div className="text-[10px] text-slate-400 font-medium">5-Year Wealth</div>
            <div className="text-base font-extrabold text-cyan-300 mt-0.5 truncate">
              {formatCurrency(fiveYearSavings)}
            </div>
            <div className="text-[9px] text-cyan-400 font-medium">compounded</div>
          </div>
        </div>

        {/* CO2 Saved Badge */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/90 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <Leaf className="w-4 h-4 text-emerald-400" />
            <span>CO2 Avoided:</span>
          </div>
          <div className="font-bold text-white flex items-center gap-1">
            <span className="text-emerald-300 font-mono text-sm">{netCo2SavedTons.toFixed(2)} metric tons</span>
            <span className="text-slate-400 text-[10px]">/ year</span>
          </div>
        </div>
      </div>

      {/* Monthly Cost Horizontal Comparison Bar Chart */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Monthly Fuel & Energy Cost Comparison
          </h3>
          <span className="text-[10px] text-slate-400">
            {Math.round(monthlyDistance)} {settings.distanceUnit}/mo
          </span>
        </div>

        <div className="space-y-2.5">
          {/* Gas Vehicle Bar */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="flex items-center gap-1.5 font-medium text-rose-300">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>Gas / Petrol</span>
              </span>
              <span className="font-mono font-bold text-white">{formatCurrency(gasMonthlyCost)}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.max(10, (gasMonthlyCost / maxMonthly) * 100)}%` }}
              />
            </div>
          </div>

          {/* Hybrid Vehicle Bar */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="flex items-center gap-1.5 font-medium text-amber-300">
                <Car className="w-3.5 h-3.5 text-amber-400" />
                <span>Hybrid Vehicle</span>
              </span>
              <span className="font-mono font-bold text-white">{formatCurrency(hybridMonthlyCost)}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-400 to-yellow-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.max(8, (hybridMonthlyCost / maxMonthly) * 100)}%` }}
              />
            </div>
          </div>

          {/* EV Vehicle Bar */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="flex items-center gap-1.5 font-medium text-emerald-300">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Electric Vehicle (EV)</span>
              </span>
              <span className="font-mono font-bold text-emerald-400">{formatCurrency(evMonthlyCost)}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300 shadow-sm shadow-emerald-500/30"
                style={{ width: `${Math.max(6, (evMonthlyCost / maxMonthly) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Cost Per Distance Summary */}
        <div className="pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-[10px]">
          <div className="text-slate-400">
            Gas: <span className="font-mono text-slate-200">{formatCurrency(gasCostPerDistance, { maximumFractionDigits: 3 })}/{settings.distanceUnit}</span>
          </div>
          <div className="text-slate-400">
            Hybrid: <span className="font-mono text-slate-200">{formatCurrency(hybridCostPerDistance, { maximumFractionDigits: 3 })}/{settings.distanceUnit}</span>
          </div>
          <div className="text-slate-400">
            EV: <span className="font-mono text-emerald-300 font-bold">{formatCurrency(evCostPerDistance, { maximumFractionDigits: 3 })}/{settings.distanceUnit}</span>
          </div>
        </div>
      </div>

      {/* Commute Inputs Form */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          <span>Commute Distance & Driving Habits</span>
        </h3>

        {/* Daily Roundtrip Distance */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-slate-300">Daily Roundtrip Distance</span>
            <span className="font-mono text-emerald-400 font-bold">
              {dailyDistance} {settings.distanceUnit} / day
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="300"
            step="1"
            value={dailyDistance}
            onChange={(e) => setDailyDistance(parseInt(e.target.value) || 5)}
            className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>5 {settings.distanceUnit}</span>
            <span>150 {settings.distanceUnit}</span>
            <span>300 {settings.distanceUnit}</span>
          </div>
        </div>

        {/* Days Driven per Week */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-slate-300">Days Driven Per Week</span>
            <span className="font-mono text-emerald-400 font-bold">{daysPerWeek} days / wk</span>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
              <button
                key={d}
                onClick={() => setDaysPerWeek(d)}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  daysPerWeek === d
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {/* Solar / Off-Peak Charging Mode Toggle */}
        <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-750 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${settings.useSolarOrOffPeak ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-400'}`}>
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Solar / Off-Peak Charging</span>
                {settings.useSolarOrOffPeak && (
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono">
                    50% Tariff Off
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400">
                Effective EV Rate:{' '}
                <strong className="text-emerald-400 font-mono">
                  {formatCurrency(currentElectricityTariff, { maximumFractionDigits: 3 })}/kWh
                </strong>
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.useSolarOrOffPeak}
              onChange={(e) => updateSettings({ useSolarOrOffPeak: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
          </label>
        </div>
      </div>

      {/* Vehicle Efficiency Sliders & Inputs */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Vehicle Fuel & Energy Efficiency
        </h3>

        {/* Gas Efficiency */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300">Gas Vehicle Fuel Economy</span>
            <span className="font-mono text-rose-300 font-bold">
              {gasEfficiency} {settings.fuelEfficiencyUnit}
            </span>
          </div>
          <input
            type="range"
            min={settings.fuelEfficiencyUnit === 'L/100km' ? 3 : 10}
            max={settings.fuelEfficiencyUnit === 'L/100km' ? 20 : 60}
            step="0.5"
            value={gasEfficiency}
            onChange={(e) => setGasEfficiency(parseFloat(e.target.value) || 10)}
            className="w-full accent-rose-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
          />
        </div>

        {/* Hybrid Efficiency */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300">Hybrid Fuel Economy</span>
            <span className="font-mono text-amber-300 font-bold">
              {hybridEfficiency} {settings.fuelEfficiencyUnit}
            </span>
          </div>
          <input
            type="range"
            min={settings.fuelEfficiencyUnit === 'L/100km' ? 2 : 20}
            max={settings.fuelEfficiencyUnit === 'L/100km' ? 12 : 90}
            step="0.5"
            value={hybridEfficiency}
            onChange={(e) => setHybridEfficiency(parseFloat(e.target.value) || 20)}
            className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
          />
        </div>

        {/* EV Efficiency */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300">EV Energy Consumption</span>
            <span className="font-mono text-emerald-400 font-bold">
              {evEfficiency} {settings.evEfficiencyUnit}
            </span>
          </div>
          <input
            type="range"
            min={settings.evEfficiencyUnit === 'kWh/100km' ? 10 : 2}
            max={settings.evEfficiencyUnit === 'kWh/100km' ? 30 : 8}
            step="0.1"
            value={evEfficiency}
            onChange={(e) => setEvEfficiency(parseFloat(e.target.value) || 3)}
            className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
          />
        </div>
      </div>
    </div>
  );
};
