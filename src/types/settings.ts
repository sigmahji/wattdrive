export type RegionKey =
  | 'usa'
  | 'uk'
  | 'europe'
  | 'uae'
  | 'south_asia_pk'
  | 'south_asia_in'
  | 'australia'
  | 'canada';

export type DistanceUnit = 'mi' | 'km';
export type FuelUnit = 'gal' | 'L';
export type FuelEfficiencyUnit = 'MPG' | 'km/L' | 'L/100km';
export type EvEfficiencyUnit = 'mi/kWh' | 'kWh/100km' | 'km/kWh';

export interface RegionPreset {
  id: RegionKey;
  name: string;
  shortName: string;
  flag: string;
  currencySymbol: string;
  currencyCode: string;
  distanceUnit: DistanceUnit;
  fuelUnit: FuelUnit;
  fuelEfficiencyUnit: FuelEfficiencyUnit;
  evEfficiencyUnit: EvEfficiencyUnit;
  gridVoltage: string;
  defaultFuelPrice: number;
  defaultElectricityTariff: number;
  defaultGasEfficiency: number;
  defaultHybridEfficiency: number;
  defaultEvEfficiency: number;
  defaultPeakSunHours: number;
  defaultSolarCostPerWatt: number;
}

export type ThemeMode = 'dark' | 'light';

export interface UserProfile {
  name: string;
  email: string;
  avatar: string; // e.g. '⚡' | '🚗' | '☀️' | '🌿' | '🏎️' | '🔋'
  driverPersona: string;
  dailyDistanceGoal: number;
  memberSince: string;
}

export interface AppSettings {
  theme: ThemeMode;
  profile: UserProfile;
  region: RegionKey;
  currencySymbol: string;
  currencyCode: string;
  distanceUnit: DistanceUnit;
  fuelUnit: FuelUnit;
  fuelEfficiencyUnit: FuelEfficiencyUnit;
  evEfficiencyUnit: EvEfficiencyUnit;
  gridVoltage: string;
  // Dynamic user pricing & efficiency values
  fuelPrice: number;
  electricityTariff: number;
  solarOffPeakTariffDiscount: number; // e.g. 50% discount for solar/night tariff
  useSolarOrOffPeak: boolean;
  peakSunHours: number;
  solarCostPerWatt: number;
}

export const REGION_PRESETS: Record<RegionKey, RegionPreset> = {
  usa: {
    id: 'usa',
    name: 'United States',
    shortName: 'USA',
    flag: '🇺🇸',
    currencySymbol: '$',
    currencyCode: 'USD',
    distanceUnit: 'mi',
    fuelUnit: 'gal',
    fuelEfficiencyUnit: 'MPG',
    evEfficiencyUnit: 'mi/kWh',
    gridVoltage: '120V / 240V',
    defaultFuelPrice: 3.55,
    defaultElectricityTariff: 0.16,
    defaultGasEfficiency: 28,
    defaultHybridEfficiency: 52,
    defaultEvEfficiency: 3.8,
    defaultPeakSunHours: 5.2,
    defaultSolarCostPerWatt: 2.80,
  },
  uk: {
    id: 'uk',
    name: 'United Kingdom',
    shortName: 'UK',
    flag: '🇬🇧',
    currencySymbol: '£',
    currencyCode: 'GBP',
    distanceUnit: 'mi',
    fuelUnit: 'L',
    fuelEfficiencyUnit: 'MPG',
    evEfficiencyUnit: 'mi/kWh',
    gridVoltage: '230V',
    defaultFuelPrice: 1.45,
    defaultElectricityTariff: 0.28,
    defaultGasEfficiency: 38,
    defaultHybridEfficiency: 65,
    defaultEvEfficiency: 3.6,
    defaultPeakSunHours: 3.4,
    defaultSolarCostPerWatt: 1.65,
  },
  europe: {
    id: 'europe',
    name: 'Europe (EU)',
    shortName: 'Europe',
    flag: '🇪🇺',
    currencySymbol: '€',
    currencyCode: 'EUR',
    distanceUnit: 'km',
    fuelUnit: 'L',
    fuelEfficiencyUnit: 'L/100km',
    evEfficiencyUnit: 'kWh/100km',
    gridVoltage: '230V',
    defaultFuelPrice: 1.84,
    defaultElectricityTariff: 0.32,
    defaultGasEfficiency: 7.4,
    defaultHybridEfficiency: 4.5,
    defaultEvEfficiency: 16.5,
    defaultPeakSunHours: 3.8,
    defaultSolarCostPerWatt: 1.55,
  },
  uae: {
    id: 'uae',
    name: 'UAE & Gulf (GCC)',
    shortName: 'UAE',
    flag: '🇦🇪',
    currencySymbol: 'AED',
    currencyCode: 'AED',
    distanceUnit: 'km',
    fuelUnit: 'L',
    fuelEfficiencyUnit: 'km/L',
    evEfficiencyUnit: 'kWh/100km',
    gridVoltage: '230V',
    defaultFuelPrice: 2.98,
    defaultElectricityTariff: 0.30,
    defaultGasEfficiency: 12.2,
    defaultHybridEfficiency: 21.5,
    defaultEvEfficiency: 17.0,
    defaultPeakSunHours: 6.3,
    defaultSolarCostPerWatt: 3.30,
  },
  south_asia_pk: {
    id: 'south_asia_pk',
    name: 'Pakistan',
    shortName: 'Pakistan',
    flag: '🇵🇰',
    currencySymbol: 'Rs',
    currencyCode: 'PKR',
    distanceUnit: 'km',
    fuelUnit: 'L',
    fuelEfficiencyUnit: 'km/L',
    evEfficiencyUnit: 'km/kWh',
    gridVoltage: '220V',
    defaultFuelPrice: 278,
    defaultElectricityTariff: 58,
    defaultGasEfficiency: 13.0,
    defaultHybridEfficiency: 22.0,
    defaultEvEfficiency: 6.2,
    defaultPeakSunHours: 5.7,
    defaultSolarCostPerWatt: 115,
  },
  south_asia_in: {
    id: 'south_asia_in',
    name: 'India',
    shortName: 'India',
    flag: '🇮🇳',
    currencySymbol: '₹',
    currencyCode: 'INR',
    distanceUnit: 'km',
    fuelUnit: 'L',
    fuelEfficiencyUnit: 'km/L',
    evEfficiencyUnit: 'km/kWh',
    gridVoltage: '230V',
    defaultFuelPrice: 96,
    defaultElectricityTariff: 9.5,
    defaultGasEfficiency: 15.0,
    defaultHybridEfficiency: 24.0,
    defaultEvEfficiency: 6.5,
    defaultPeakSunHours: 5.5,
    defaultSolarCostPerWatt: 42,
  },
  australia: {
    id: 'australia',
    name: 'Australia',
    shortName: 'Australia',
    flag: '🇦🇺',
    currencySymbol: 'A$',
    currencyCode: 'AUD',
    distanceUnit: 'km',
    fuelUnit: 'L',
    fuelEfficiencyUnit: 'L/100km',
    evEfficiencyUnit: 'kWh/100km',
    gridVoltage: '230V',
    defaultFuelPrice: 1.95,
    defaultElectricityTariff: 0.34,
    defaultGasEfficiency: 8.2,
    defaultHybridEfficiency: 4.8,
    defaultEvEfficiency: 17.2,
    defaultPeakSunHours: 5.3,
    defaultSolarCostPerWatt: 1.45,
  },
  canada: {
    id: 'canada',
    name: 'Canada',
    shortName: 'Canada',
    flag: '🇨🇦',
    currencySymbol: 'C$',
    currencyCode: 'CAD',
    distanceUnit: 'km',
    fuelUnit: 'L',
    fuelEfficiencyUnit: 'L/100km',
    evEfficiencyUnit: 'kWh/100km',
    gridVoltage: '120V / 240V',
    defaultFuelPrice: 1.65,
    defaultElectricityTariff: 0.15,
    defaultGasEfficiency: 8.4,
    defaultHybridEfficiency: 5.0,
    defaultEvEfficiency: 18.5,
    defaultPeakSunHours: 4.0,
    defaultSolarCostPerWatt: 2.25,
  },
};
