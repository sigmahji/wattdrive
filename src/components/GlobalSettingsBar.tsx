import React, { useState } from 'react';
import {
  Globe,
  Check,
  RotateCcw,
  X,
  Zap,
  Sun,
  Moon,
  User,
  Fuel,
  Plug,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { REGION_PRESETS, type RegionKey } from '../types/settings';
import { ProfileModal } from './ProfileModal';

export const GlobalSettingsBar: React.FC = () => {
  const {
    settings,
    activePreset,
    theme,
    toggleTheme,
    setTheme,
    profile,
    setRegion,
    updateSettings,
    resetToRegionDefaults,
  } = useSettings();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);

  const regionList = Object.values(REGION_PRESETS);

  // Clean rate value formatter that displays integers cleanly (e.g. 400 vs 400.00)
  const formatRateValue = (val: number): string => {
    if (val >= 100) {
      return val % 1 === 0 ? val.toFixed(0) : val.toFixed(1);
    }
    return val % 1 === 0 ? val.toFixed(0) : val.toFixed(2);
  };

  const formatVoltage = (volt: string): string => {
    return volt.replace(' / ', '/');
  };

  return (
    <>
      {/* Top Fixed Header with Persistent Global Settings Bar */}
      <header
        className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 px-3 pb-2.5 shadow-sm transition-all"
        style={{ paddingTop: 'calc(var(--sat, 0px) + 0.625rem)' }}
      >
        <div className="flex items-center justify-between gap-2 max-w-md mx-auto">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 via-emerald-400 to-cyan-400 flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0 ring-1 ring-white/10">
              <Zap className="w-4.5 h-4.5 text-slate-950 fill-slate-950" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-extrabold text-[16px] tracking-tight text-white dark:text-white">
                  WattDrive
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide leading-tight truncate mt-0.5">
                EV & Energy Intelligence
              </p>
            </div>
          </div>

          {/* Quick Region Selector & Sleek Actions Cluster */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Quick Country Switcher Capsule */}
            <div className="relative">
              <button
                onClick={() => setIsRegionDropdownOpen(!isRegionDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-750 active:scale-95 border border-slate-700/80 transition-all text-xs font-semibold text-slate-200 shadow-sm"
                aria-label="Change Region"
                title={`Active Region: ${activePreset.name}`}
              >
                <span className="text-sm leading-none shrink-0">{activePreset.flag}</span>
                <span className="truncate max-w-[62px] sm:max-w-none text-[11px] font-bold">
                  {activePreset.shortName}
                </span>
                <ChevronDown
                  className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                    isRegionDropdownOpen ? 'rotate-180 text-emerald-400' : ''
                  }`}
                />
              </button>

              {/* Quick Region Popup Menu */}
              {isRegionDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
                    onClick={() => setIsRegionDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-64 z-50 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-1.5 space-y-0.5 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                      Select Region Preset
                    </div>
                    {regionList.map((preset) => {
                      const isSelected = preset.id === settings.region;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => {
                            setRegion(preset.id as RegionKey);
                            setIsRegionDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                            isSelected
                              ? 'bg-emerald-500/15 text-emerald-300 font-semibold'
                              : 'text-slate-300 hover:bg-slate-800 active:bg-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">{preset.flag}</span>
                            <div className="text-left">
                              <div className="leading-tight">{preset.name}</div>
                              <div className="text-[10px] text-slate-400">
                                {preset.currencySymbol} • {preset.distanceUnit} • {preset.fuelUnit} • {preset.fuelEfficiencyUnit}
                              </div>
                            </div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Quick Theme Switcher Button */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-750 active:scale-95 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-sm"
              aria-label={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-indigo-500" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* Profile Access Button */}
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-750 active:scale-95 border border-slate-700/80 flex items-center justify-center transition-all shadow-sm group"
              aria-label="Driver Profile Access"
              title={`Driver Profile (${profile.name})`}
            >
              <span className="w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-xs font-bold leading-none">
                {profile.avatar || <User className="w-3.5 h-3.5" />}
              </span>
            </button>

            {/* Custom Tuning Drawer Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-750 active:scale-95 border border-slate-700/80 flex items-center justify-center text-emerald-400 hover:text-emerald-300 transition-all shadow-sm"
              aria-label="Tune Units & Rates"
              title="Benchmark Rates & Units"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Modern Live Benchmark Rates Ribbon */}
        <div className="mt-2">
          <div className="grid grid-cols-3 gap-1.5">
            {/* Fuel Benchmark Tile */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 p-1.5 px-2 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/70 hover:border-amber-500/40 text-left transition-all active:scale-[0.98] shadow-sm group"
              title="Click to adjust Fuel Benchmark Price"
            >
              <div className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Fuel className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider leading-none">
                  Fuel
                </div>
                <div className="text-xs font-bold text-slate-100 dark:text-slate-100 truncate mt-0.5 leading-tight">
                  {settings.currencySymbol}{formatRateValue(settings.fuelPrice)}
                  <span className="text-[10px] font-medium text-slate-400">/{settings.fuelUnit}</span>
                </div>
              </div>
            </button>

            {/* Grid Electricity Tile */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 p-1.5 px-2 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/70 hover:border-cyan-500/40 text-left transition-all active:scale-[0.98] shadow-sm group"
              title="Click to adjust Grid Electricity Tariff"
            >
              <div className="w-6 h-6 rounded-lg bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Zap className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider leading-none">
                  Grid
                </div>
                <div className="text-xs font-bold text-slate-100 dark:text-slate-100 truncate mt-0.5 leading-tight">
                  {settings.currencySymbol}{formatRateValue(settings.electricityTariff)}
                  <span className="text-[10px] font-medium text-slate-400">/kWh</span>
                </div>
              </div>
            </button>

            {/* Supply & Standard Units Tile */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 p-1.5 px-2 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/70 hover:border-emerald-500/40 text-left transition-all active:scale-[0.98] shadow-sm group"
              title="Click to tune grid voltage, sun hours & units"
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Plug className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[9px] font-semibold text-emerald-500 dark:text-emerald-400 uppercase tracking-wider leading-none flex items-center justify-between">
                  <span>Supply</span>
                  <span className="text-[8px] font-bold text-slate-400">EDIT</span>
                </div>
                <div className="text-xs font-bold text-slate-100 dark:text-slate-100 truncate mt-0.5 leading-tight">
                  {formatVoltage(settings.gridVoltage)}
                  <span className="text-[10px] font-medium text-slate-400"> · {settings.distanceUnit}</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Settings Bottom-Sheet Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-[430px] max-h-[85vh] bg-slate-900 border-t border-slate-750 rounded-t-3xl p-5 shadow-2xl overflow-y-auto animate-in slide-in-from-bottom duration-200 flex flex-col gap-4"
            style={{ paddingBottom: 'calc(var(--sab, 0px) + 1.25rem)' }}
          >
            {/* Modal Handle */}
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto -mt-1 mb-1" />

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Global Preset & Rates</h3>
                  <p className="text-xs text-slate-400">Tailored to your location & power grid</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Region Selector Pills */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Quick Region Preset</label>
              <div className="grid grid-cols-2 gap-2">
                {regionList.map((preset) => {
                  const isSelected = preset.id === settings.region;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => setRegion(preset.id as RegionKey)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-sm'
                          : 'bg-slate-800/60 border-slate-750 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <span className="text-lg">{preset.flag}</span>
                      <div className="overflow-hidden">
                        <div className="text-xs font-semibold truncate">{preset.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {preset.currencySymbol} • {preset.distanceUnit} • {preset.fuelUnit}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fuel & Electricity Price Overrides */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Custom Rates for {activePreset.name}
              </h4>

              <div className="grid grid-cols-2 gap-3">
                {/* Fuel Price */}
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300 font-medium">
                    Fuel Price ({settings.currencySymbol} / {settings.fuelUnit})
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={settings.fuelPrice}
                      onChange={(e) => updateSettings({ fuelPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                    <span className="absolute right-2.5 top-2 text-xs text-slate-400 font-mono">
                      {settings.currencySymbol}
                    </span>
                  </div>
                </div>

                {/* Electricity Tariff */}
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300 font-medium">
                    Grid Tariff ({settings.currencySymbol} / kWh)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={settings.electricityTariff}
                      onChange={(e) => updateSettings({ electricityTariff: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                    <span className="absolute right-2.5 top-2 text-xs text-slate-400 font-mono">
                      {settings.currencySymbol}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid Voltage / Sun Hours */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300 font-medium">Grid Supply Voltage</label>
                  <input
                    type="text"
                    value={settings.gridVoltage}
                    onChange={(e) => updateSettings({ gridVoltage: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300 font-medium">Avg Peak Sun (hrs/day)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={settings.peakSunHours}
                    onChange={(e) => updateSettings({ peakSunHours: parseFloat(e.target.value) || 1 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Theme Preference Option in Settings Modal */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Display Theme
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                    theme === 'dark'
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Moon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Dark Slate</span>
                  </div>
                  {theme === 'dark' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                    theme === 'light'
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Light Daylight</span>
                  </div>
                  {theme === 'light' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              </div>
            </div>

            {/* Reset to Defaults & Done */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={resetToRegionDefaults}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750 text-xs font-semibold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Defaults
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-emerald-500/20 transition-all"
              >
                Apply & Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Driver Profile Access Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
};
