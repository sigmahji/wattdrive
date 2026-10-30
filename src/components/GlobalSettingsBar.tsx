import React, { useState } from 'react';
import { Globe, Sliders, Check, RotateCcw, X, Zap } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { REGION_PRESETS, type RegionKey } from '../types/settings';

export const GlobalSettingsBar: React.FC = () => {
  const {
    settings,
    activePreset,
    setRegion,
    updateSettings,
    resetToRegionDefaults,
  } = useSettings();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);

  const regionList = Object.values(REGION_PRESETS);

  return (
    <>
      {/* Top Fixed Header with Persistent Global Settings Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 px-3 py-2.5 shadow-sm transition-all">
        <div className="flex items-center justify-between gap-2 max-w-md mx-auto">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Zap className="w-5 h-5 text-slate-950 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-bold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  WattDrive
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                  Global
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">EV, Fuel & Solar Calculator</p>
            </div>
          </div>

          {/* Quick Region Selector & Settings Trigger */}
          <div className="flex items-center gap-1.5">
            {/* Quick Country Switcher Button */}
            <div className="relative">
              <button
                onClick={() => setIsRegionDropdownOpen(!isRegionDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700/80 hover:bg-slate-750 active:scale-95 transition-all text-xs font-medium text-slate-200"
                aria-label="Change Region"
              >
                <span className="text-sm leading-none">{activePreset.flag}</span>
                <span className="font-semibold">{activePreset.shortName}</span>
                <span className="text-slate-400 text-[10px]">({settings.currencySymbol})</span>
              </button>

              {/* Quick Region Popup Menu */}
              {isRegionDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
                    onClick={() => setIsRegionDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-60 z-50 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-1.5 space-y-0.5 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
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
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
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

            {/* Custom Tuning Drawer Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-750 active:scale-95 transition-all"
              aria-label="Tune Units & Rates"
              title="Global Preferences"
            >
              <Sliders className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>

        {/* Dynamic Metric Badges Row */}
        <div className="flex items-center justify-between mt-1.5 px-0.5 text-[11px] text-slate-400 overflow-x-auto no-scrollbar gap-2">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-750 text-slate-300 font-mono text-[10px]">
              Dist: {settings.distanceUnit}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-750 text-slate-300 font-mono text-[10px]">
              Fuel: {settings.currencySymbol}{settings.fuelPrice.toFixed(2)}/{settings.fuelUnit}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-750 text-slate-300 font-mono text-[10px]">
              Grid: {settings.currencySymbol}{settings.electricityTariff.toFixed(2)}/kWh
            </span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-750 text-emerald-400 font-mono text-[10px]">
              {settings.gridVoltage}
            </span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-[10px] text-emerald-400 hover:text-emerald-300 underline underline-offset-2 shrink-0 font-medium"
          >
            Customize
          </button>
        </div>
      </header>

      {/* Settings Bottom-Sheet Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-[430px] max-h-[85vh] bg-slate-900 border-t border-slate-750 rounded-t-3xl p-5 shadow-2xl overflow-y-auto animate-in slide-in-from-bottom duration-200 flex flex-col gap-4"
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
    </>
  );
};
