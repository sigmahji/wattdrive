export type VehicleType = 'car' | 'ev' | 'hybrid' | 'motorcycle';

export interface MaintenanceItem {
  id: string;
  name: string;
  intervalDistance: number; // e.g. 5,000 miles or 8,000 km
  lastServiceOdometer: number;
  notes?: string; // e.g. "0W-20 Full Synthetic"
  category: 'engine' | 'tires' | 'brakes' | 'filters' | 'fluids' | 'battery';
}

export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  makeModel: string;
  year: number;
  odometer: number;
  odometerUnit: 'mi' | 'km';
  maintenanceItems: MaintenanceItem[];
  createdAt: number;
}
