import React, { createContext, useContext, useState, useEffect } from 'react';
import { SystemBars, SystemBarsStyle } from '@capacitor/core';
import {
  REGION_PRESETS,
  type AppSettings,
  type RegionKey,
  type RegionPreset,
  type ThemeMode,
  type UserProfile,
} from '../types/settings';

interface SettingsContextType {
  settings: AppSettings;
  activePreset: RegionPreset;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  profile: UserProfile;
  updateProfile: (partial: Partial<UserProfile>) => void;
  setRegion: (region: RegionKey) => void;
  updateSettings: (partial: Partial<AppSettings>) => void;
  formatCurrency: (amount: number, options?: { maximumFractionDigits?: number; minimumFractionDigits?: number }) => string;
  formatDistance: (dist: number) => string;
  getEffectiveElectricityTariff: () => number;
  resetToRegionDefaults: () => void;
}

const STORAGE_KEY = 'wattdrive_global_settings_v1';

const defaultRegion: RegionKey = 'usa';
const defaultPreset = REGION_PRESETS[defaultRegion];

export const initialProfile: UserProfile = {
  name: 'Alex Morgan',
  email: 'alex.driver@wattdrive.app',
  avatar: '⚡',
  driverPersona: 'Daily Commuter',
  dailyDistanceGoal: 40,
  memberSince: '2026',
};

const initialSettings: AppSettings = {
  theme: 'dark',
  profile: initialProfile,
  region: defaultRegion,
  currencySymbol: defaultPreset.currencySymbol,
  currencyCode: defaultPreset.currencyCode,
  distanceUnit: defaultPreset.distanceUnit,
  fuelUnit: defaultPreset.fuelUnit,
  fuelEfficiencyUnit: defaultPreset.fuelEfficiencyUnit,
  evEfficiencyUnit: defaultPreset.evEfficiencyUnit,
  gridVoltage: defaultPreset.gridVoltage,
  fuelPrice: defaultPreset.defaultFuelPrice,
  electricityTariff: defaultPreset.defaultElectricityTariff,
  solarOffPeakTariffDiscount: 50, // 50% discount when off-peak/solar is enabled
  useSolarOrOffPeak: false,
  peakSunHours: defaultPreset.defaultPeakSunHours,
  solarCostPerWatt: defaultPreset.defaultSolarCostPerWatt,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.region && REGION_PRESETS[parsed.region as RegionKey]) {
          return {
            ...initialSettings,
            ...parsed,
            profile: { ...initialProfile, ...(parsed.profile || {}) },
            theme: (parsed.theme === 'light' || parsed.theme === 'dark') ? parsed.theme : 'dark',
          };
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved settings:', e);
    }
    return initialSettings;
  });

  // Keep DOM theme class, meta theme-color and Capacitor SystemBars in sync with active theme
  useEffect(() => {
    const isLight = settings.theme === 'light';
    const root = document.documentElement;
    if (isLight) {
      root.classList.add('light');
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
    }

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', isLight ? '#f8fafc' : '#0f172a');
    }

    try {
      SystemBars.setStyle({
        style: isLight ? SystemBarsStyle.Light : SystemBarsStyle.Dark,
      }).catch(() => {});
    } catch {
      // Ignore on web
    }
  }, [settings.theme]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  }, [settings]);

  const activePreset = REGION_PRESETS[settings.region] || REGION_PRESETS.usa;

  const setTheme = (theme: ThemeMode) => {
    setSettings((prev) => ({ ...prev, theme }));
  };

  const toggleTheme = () => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light',
    }));
  };

  const updateProfile = (partial: Partial<UserProfile>) => {
    setSettings((prev) => ({
      ...prev,
      profile: {
        ...(prev.profile || initialProfile),
        ...partial,
      },
    }));
  };

  const setRegion = (region: RegionKey) => {
    const preset = REGION_PRESETS[region];
    if (!preset) return;

    setSettings((prev) => ({
      ...prev,
      region,
      currencySymbol: preset.currencySymbol,
      currencyCode: preset.currencyCode,
      distanceUnit: preset.distanceUnit,
      fuelUnit: preset.fuelUnit,
      fuelEfficiencyUnit: preset.fuelEfficiencyUnit,
      evEfficiencyUnit: preset.evEfficiencyUnit,
      gridVoltage: preset.gridVoltage,
      fuelPrice: preset.defaultFuelPrice,
      electricityTariff: preset.defaultElectricityTariff,
      peakSunHours: preset.defaultPeakSunHours,
      solarCostPerWatt: preset.defaultSolarCostPerWatt,
    }));
  };

  const updateSettings = (partial: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const resetToRegionDefaults = () => {
    setRegion(settings.region);
  };

  const getEffectiveElectricityTariff = (): number => {
    if (settings.useSolarOrOffPeak) {
      const discountMultiplier = (100 - settings.solarOffPeakTariffDiscount) / 100;
      return +(settings.electricityTariff * discountMultiplier).toFixed(3);
    }
    return settings.electricityTariff;
  };

  const formatCurrency = (amount: number, options?: { maximumFractionDigits?: number; minimumFractionDigits?: number }): string => {
    const isHighUnitCurrency = settings.currencyCode === 'PKR' || settings.currencyCode === 'INR';
    const defaultMaxDecimals = isHighUnitCurrency ? 0 : amount < 10 && amount > -10 ? 2 : amount > 1000 ? 0 : 2;

    const maxDigits = options?.maximumFractionDigits !== undefined ? options.maximumFractionDigits : defaultMaxDecimals;
    const minDigits = options?.minimumFractionDigits !== undefined ? options.minimumFractionDigits : 0;

    const formattedNum = new Intl.NumberFormat(undefined, {
      minimumFractionDigits: minDigits,
      maximumFractionDigits: maxDigits,
    }).format(amount);

    return `${settings.currencySymbol} ${formattedNum}`;
  };

  const formatDistance = (dist: number): string => {
    return `${Math.round(dist).toLocaleString()} ${settings.distanceUnit}`;
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        activePreset,
        theme: settings.theme || 'dark',
        setTheme,
        toggleTheme,
        profile: settings.profile || initialProfile,
        updateProfile,
        setRegion,
        updateSettings,
        formatCurrency,
        formatDistance,
        getEffectiveElectricityTariff,
        resetToRegionDefaults,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
