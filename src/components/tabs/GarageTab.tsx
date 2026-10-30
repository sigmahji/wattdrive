import React, { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import type { Vehicle, MaintenanceItem, VehicleType } from '../../types/garage';
import { admobService } from '../../services/admobService';
import {
  Wrench,
  Car,
  Zap,
  Bike,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Clock,
  Edit2,
  Save,
  X,
  Gauge,
  Droplet,
  Disc,
  Filter,
  ThermometerSnowflake,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'wattdrive_garage_vehicles_v1';

const getDefaultItemsForType = (type: VehicleType, currentOdo: number, isMiles: boolean): MaintenanceItem[] => {
  const mult = isMiles ? 1 : 1.6;

  if (type === 'ev') {
    return [
      {
        id: 'ev-tire-rot',
        name: 'Tire Rotation & Balance',
        intervalDistance: Math.round(7500 * mult),
        lastServiceOdometer: currentOdo - Math.round(2000 * mult),
        notes: 'Check EV tire tread depth & camber',
        category: 'tires',
      },
      {
        id: 'ev-cabin-air',
        name: 'Cabin Air Filter',
        intervalDistance: Math.round(15000 * mult),
        lastServiceOdometer: currentOdo - Math.round(8000 * mult),
        notes: 'HEPA replacement',
        category: 'filters',
      },
      {
        id: 'ev-brake-fluid',
        name: 'Brake Fluid & Inspection',
        intervalDistance: Math.round(25000 * mult),
        lastServiceOdometer: currentOdo - Math.round(12000 * mult),
        notes: 'Regenerative braking pads check',
        category: 'brakes',
      },
      {
        id: 'ev-coolant',
        name: 'High Voltage Battery Coolant',
        intervalDistance: Math.round(40000 * mult),
        lastServiceOdometer: currentOdo - Math.round(15000 * mult),
        notes: 'OEM Dielectric Coolant exchange',
        category: 'battery',
      },
    ];
  }

  // Gas or Hybrid or Motorcycle
  return [
    {
      id: 'oil-change',
      name: 'Engine Oil & Filter',
      intervalDistance: Math.round(5000 * mult),
      lastServiceOdometer: currentOdo - Math.round(3800 * mult),
      notes: type === 'hybrid' ? '0W-20 Full Synthetic' : '10W-40 / 5W-30',
      category: 'engine',
    },
    {
      id: 'tire-rotation',
      name: 'Tire Rotation',
      intervalDistance: Math.round(7500 * mult),
      lastServiceOdometer: currentOdo - Math.round(5000 * mult),
      notes: 'Even tread wear pattern',
      category: 'tires',
    },
    {
      id: 'brake-pads',
      name: 'Brake Pads & Rotors',
      intervalDistance: Math.round(25000 * mult),
      lastServiceOdometer: currentOdo - Math.round(18000 * mult),
      notes: 'Ceramic brake pads inspection',
      category: 'brakes',
    },
    {
      id: 'cabin-filter',
      name: 'Cabin & Engine Air Filter',
      intervalDistance: Math.round(15000 * mult),
      lastServiceOdometer: currentOdo - Math.round(9000 * mult),
      notes: 'OEM Intake and A/C filter',
      category: 'filters',
    },
    {
      id: 'hybrid-coolant',
      name: type === 'hybrid' ? 'Inverter & Battery Coolant' : 'Engine Radiator Coolant',
      intervalDistance: Math.round(35000 * mult),
      lastServiceOdometer: currentOdo - Math.round(20000 * mult),
      notes: 'Long Life Coolant test',
      category: 'fluids',
    },
  ];
};

const initialVehiclesList: Vehicle[] = [
  {
    id: 'veh-ev-1',
    name: 'Primary Daily EV',
    type: 'ev',
    makeModel: 'Tesla Model Y / Ioniq 5',
    year: 2024,
    odometer: 18500,
    odometerUnit: 'mi',
    maintenanceItems: getDefaultItemsForType('ev', 18500, true),
    createdAt: Date.now(),
  },
  {
    id: 'veh-hybrid-2',
    name: 'Family Hybrid',
    type: 'hybrid',
    makeModel: 'Toyota Prius / RAV4 Hybrid',
    year: 2022,
    odometer: 34200,
    odometerUnit: 'mi',
    maintenanceItems: getDefaultItemsForType('hybrid', 34200, true),
    createdAt: Date.now() - 1000000,
  },
];

export const GarageTab: React.FC = () => {
  const { settings } = useSettings();

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse vehicles:', e);
    }
    return initialVehiclesList;
  });

  const [activeVehicleId, setActiveVehicleId] = useState<string>(() => vehicles[0]?.id || 'veh-ev-1');
  const [editingOdometer, setEditingOdometer] = useState<boolean>(false);
  const [tempOdometer, setTempOdometer] = useState<number>(0);

  // Add Vehicle Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newVehName, setNewVehName] = useState<string>('');
  const [newVehModel, setNewVehModel] = useState<string>('');
  const [newVehYear, setNewVehYear] = useState<number>(2023);
  const [newVehType, setNewVehType] = useState<VehicleType>('car');
  const [newVehOdo, setNewVehOdo] = useState<number>(10000);

  // Edit / Add Item Modal
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState<boolean>(false);
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemInterval, setNewItemInterval] = useState<number>(5000);
  const [newItemNotes, setNewItemNotes] = useState<string>('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
    } catch (e) {
      console.warn('Failed to save vehicles:', e);
    }
  }, [vehicles]);

  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId) || vehicles[0];

  useEffect(() => {
    if (activeVehicle) {
      setTempOdometer(activeVehicle.odometer);
    }
  }, [activeVehicleId, activeVehicle?.odometer]);

  const handleUpdateOdometer = async () => {
    if (!activeVehicle) return;
    const newOdo = Math.max(activeVehicle.odometer, tempOdometer);

    setVehicles((prev) =>
      prev.map((v) => (v.id === activeVehicle.id ? { ...v, odometer: newOdo } : v))
    );
    setEditingOdometer(false);

    // Record action for AdMob
    await admobService.recordUserAction();
  };

  const handleLogServiceCompleted = async (item: MaintenanceItem) => {
    if (!activeVehicle) return;

    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id !== activeVehicle.id) return v;
        return {
          ...v,
          maintenanceItems: v.maintenanceItems.map((m) =>
            m.id === item.id ? { ...m, lastServiceOdometer: v.odometer } : m
          ),
        };
      })
    );

    // Celebration confetti
    try {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 },
      });
    } catch {
      // ignore
    }

    // Trigger AdMob action record
    await admobService.recordUserAction();
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `veh-${Date.now()}`;
    const isMiles = settings.distanceUnit === 'mi';

    const newVeh: Vehicle = {
      id: newId,
      name: newVehName || `${newVehModel || 'New Vehicle'}`,
      type: newVehType,
      makeModel: newVehModel || 'Custom Vehicle',
      year: newVehYear,
      odometer: newVehOdo || 0,
      odometerUnit: settings.distanceUnit,
      maintenanceItems: getDefaultItemsForType(newVehType, newVehOdo || 0, isMiles),
      createdAt: Date.now(),
    };

    setVehicles((prev) => [...prev, newVeh]);
    setActiveVehicleId(newId);
    setIsAddModalOpen(false);

    // Reset fields
    setNewVehName('');
    setNewVehModel('');

    await admobService.recordUserAction();
  };

  const handleDeleteVehicle = (id: string) => {
    if (vehicles.length <= 1) {
      alert('You must keep at least one vehicle in your garage.');
      return;
    }
    const remaining = vehicles.filter((v) => v.id !== id);
    setVehicles(remaining);
    setActiveVehicleId(remaining[0].id);
  };

  const handleAddNewItem = () => {
    if (!activeVehicle || !newItemName.trim()) return;

    const newItem: MaintenanceItem = {
      id: `item-${Date.now()}`,
      name: newItemName.trim(),
      intervalDistance: newItemInterval || 5000,
      lastServiceOdometer: activeVehicle.odometer,
      notes: newItemNotes.trim(),
      category: 'engine',
    };

    setVehicles((prev) =>
      prev.map((v) =>
        v.id === activeVehicle.id
          ? { ...v, maintenanceItems: [...v.maintenanceItems, newItem] }
          : v
      )
    );

    setIsAddItemModalOpen(false);
    setNewItemName('');
    setNewItemNotes('');
  };

  const handleDeleteItem = (itemId: string) => {
    if (!activeVehicle) return;
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === activeVehicle.id
          ? { ...v, maintenanceItems: v.maintenanceItems.filter((i) => i.id !== itemId) }
          : v
      )
    );
  };

  // Status calculation for items
  const getItemHealth = (item: MaintenanceItem, currentOdo: number) => {
    const elapsed = currentOdo - item.lastServiceOdometer;
    const remaining = item.intervalDistance - elapsed;
    const percentRemaining = Math.max(0, Math.min(100, (remaining / item.intervalDistance) * 100));

    let status: 'green' | 'amber' | 'red' = 'green';
    if (remaining <= 0) {
      status = 'red';
    } else if (percentRemaining <= 25) {
      status = 'amber';
    }

    return {
      elapsed,
      remaining,
      percentRemaining,
      status,
    };
  };

  const getItemCategoryIcon = (category: string, name: string) => {
    if (category === 'battery' || name.toLowerCase().includes('coolant')) {
      return <ThermometerSnowflake className="w-4 h-4 text-cyan-400" />;
    }
    if (category === 'engine' || name.toLowerCase().includes('oil')) {
      return <Droplet className="w-4 h-4 text-amber-400" />;
    }
    if (category === 'tires' || name.toLowerCase().includes('tire')) {
      return <Disc className="w-4 h-4 text-emerald-400" />;
    }
    if (category === 'brakes' || name.toLowerCase().includes('brake')) {
      return <AlertTriangle className="w-4 h-4 text-rose-400" />;
    }
    if (category === 'filters' || name.toLowerCase().includes('filter')) {
      return <Filter className="w-4 h-4 text-indigo-400" />;
    }
    return <Wrench className="w-4 h-4 text-slate-400" />;
  };

  const getVehicleTypeIcon = (type: VehicleType) => {
    switch (type) {
      case 'ev':
        return <Zap className="w-4 h-4 text-emerald-400" />;
      case 'hybrid':
        return <Car className="w-4 h-4 text-amber-400" />;
      case 'motorcycle':
        return <Bike className="w-4 h-4 text-cyan-400" />;
      default:
        return <Car className="w-4 h-4 text-slate-300" />;
    }
  };

  // Summary counts
  const itemsHealth = activeVehicle?.maintenanceItems.map((item) =>
    getItemHealth(item, activeVehicle.odometer)
  ) || [];
  const overdueCount = itemsHealth.filter((h) => h.status === 'red').length;
  const warningCount = itemsHealth.filter((h) => h.status === 'amber').length;

  return (
    <div className="space-y-4 pb-2">
      {/* Garage Header & Vehicle Selector Tabs */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Multi-Vehicle Garage</h2>
              <p className="text-[10px] text-slate-400">Offline-first Fleet Service Tracker</p>
            </div>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Vehicle</span>
          </button>
        </div>

        {/* Vehicle Carousel Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {vehicles.map((v) => {
            const isSelected = v.id === activeVehicleId;
            return (
              <button
                key={v.id}
                onClick={() => setActiveVehicleId(v.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-slate-800 border-emerald-500 text-white shadow-sm'
                    : 'bg-slate-800/40 border-slate-750 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {getVehicleTypeIcon(v.type)}
                <span>{v.name}</span>
                <span className="text-[10px] text-slate-400 font-mono font-normal">
                  {v.odometer.toLocaleString()} {settings.distanceUnit}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Vehicle Hero Card */}
      {activeVehicle && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-4 shadow-xl space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white">{activeVehicle.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-emerald-400 border border-emerald-500/30">
                  {activeVehicle.type.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {activeVehicle.year} {activeVehicle.makeModel}
              </p>
            </div>

            <button
              onClick={() => handleDeleteVehicle(activeVehicle.id)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Delete Vehicle"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Odometer Reader & Fast Updater */}
          <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/90 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Gauge className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Current Odometer
                </div>
                {editingOdometer ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      value={tempOdometer}
                      onChange={(e) => setTempOdometer(parseInt(e.target.value) || 0)}
                      className="w-28 bg-slate-800 border border-emerald-500 rounded px-2 py-0.5 text-sm font-mono text-white focus:outline-none"
                    />
                    <button
                      onClick={handleUpdateOdometer}
                      className="p-1.5 rounded bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                    >
                      <Save className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingOdometer(false)}
                      className="p-1.5 rounded bg-slate-800 text-slate-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="text-lg font-black text-white font-mono flex items-center gap-1.5">
                    <span>{activeVehicle.odometer.toLocaleString()}</span>
                    <span className="text-xs font-medium text-slate-400">{settings.distanceUnit}</span>
                  </div>
                )}
              </div>
            </div>

            {!editingOdometer && (
              <button
                onClick={() => setEditingOdometer(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700/80 active:scale-95 transition-all"
              >
                <Edit2 className="w-3 h-3 text-emerald-400" />
                <span>Update Odo</span>
              </button>
            )}
          </div>

          {/* Quick Health Status Indicator */}
          <div className="flex items-center justify-between text-xs px-1">
            {overdueCount > 0 ? (
              <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>{overdueCount} Service Overdue!</span>
              </div>
            ) : warningCount > 0 ? (
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>{warningCount} Service Due Soon</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>All Scheduled Services Healthy</span>
              </div>
            )}

            <button
              onClick={() => setIsAddItemModalOpen(true)}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add Service Item</span>
            </button>
          </div>
        </div>
      )}

      {/* Maintenance Items List */}
      <div className="space-y-3">
        {activeVehicle?.maintenanceItems.map((item) => {
          const health = getItemHealth(item, activeVehicle.odometer);

          return (
            <div
              key={item.id}
              className={`bg-slate-900/90 rounded-2xl border p-4 space-y-3 transition-all ${
                health.status === 'red'
                  ? 'border-rose-500/40 bg-rose-950/10'
                  : health.status === 'amber'
                  ? 'border-amber-500/40 bg-amber-950/10'
                  : 'border-slate-800'
              }`}
            >
              {/* Item Title & Category */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-slate-800 border border-slate-700/60 mt-0.5">
                    {getItemCategoryIcon(item.category, item.name)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.name}</h4>
                    {item.notes && <p className="text-[10px] text-slate-400">{item.notes}</p>}
                    <p className="text-[10px] text-slate-500 font-mono">
                      Interval: every {item.intervalDistance.toLocaleString()} {settings.distanceUnit}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  {health.status === 'red' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      Overdue!
                    </span>
                  ) : health.status === 'amber' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      Due Soon
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Good
                    </span>
                  )}
                  <div className="text-[11px] font-bold font-mono mt-1 text-slate-200">
                    {health.remaining > 0 ? (
                      <span>{health.remaining.toLocaleString()} {settings.distanceUnit} left</span>
                    ) : (
                      <span className="text-rose-400">{Math.abs(health.remaining).toLocaleString()} {settings.distanceUnit} past</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Bar (Green -> Amber -> Red) */}
              <div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      health.status === 'red'
                        ? 'bg-rose-500 w-full'
                        : health.status === 'amber'
                        ? 'bg-amber-400'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.max(4, health.percentRemaining)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                  <span>Last: {item.lastServiceOdometer.toLocaleString()} {settings.distanceUnit}</span>
                  <span>Next: {(item.lastServiceOdometer + item.intervalDistance).toLocaleString()} {settings.distanceUnit}</span>
                </div>
              </div>

              {/* Action Buttons: Log Completed Service & Delete Item */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="text-[10px] text-slate-500 hover:text-rose-400 transition-colors"
                >
                  Remove item
                </button>

                <button
                  onClick={() => handleLogServiceCompleted(item)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 font-bold text-xs border border-emerald-500/30 transition-all active:scale-95"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Log Service Done</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Vehicle Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-[430px] max-h-[85vh] bg-slate-900 border-t border-slate-750 rounded-t-3xl p-5 shadow-2xl overflow-y-auto animate-in slide-in-from-bottom duration-200 flex flex-col gap-4"
            style={{ paddingBottom: 'calc(var(--sab, 0px) + 1.25rem)' }}
          >
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto -mt-1" />

            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-base font-bold text-white">Add Vehicle to Garage</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Vehicle Type</label>
                <div className="grid grid-cols-4 gap-1.5 mt-1">
                  {(['car', 'ev', 'hybrid', 'motorcycle'] as VehicleType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewVehType(t)}
                      className={`py-2 px-1 rounded-xl border text-xs font-semibold capitalize flex flex-col items-center gap-1 transition-all ${
                        newVehType === t
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {getVehicleTypeIcon(t)}
                      <span className="text-[10px]">{t}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Nickname / Label</label>
                <input
                  type="text"
                  placeholder="e.g. Daily Commuter"
                  value={newVehName}
                  onChange={(e) => setNewVehName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white mt-1 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Make & Model</label>
                  <input
                    type="text"
                    placeholder="e.g. Model Y / Civic"
                    value={newVehModel}
                    onChange={(e) => setNewVehModel(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white mt-1 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Model Year</label>
                  <input
                    type="number"
                    min="1990"
                    max="2030"
                    value={newVehYear}
                    onChange={(e) => setNewVehYear(parseInt(e.target.value) || 2023)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white mt-1 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">
                  Current Odometer ({settings.distanceUnit})
                </label>
                <input
                  type="number"
                  min="0"
                  value={newVehOdo}
                  onChange={(e) => setNewVehOdo(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono mt-1 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tracking-wider shadow-lg shadow-emerald-500/20 transition-all mt-2"
              >
                Add Vehicle
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Maintenance Item Modal */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-[430px] bg-slate-900 border-t border-slate-750 rounded-t-3xl p-5 shadow-2xl space-y-3 animate-in slide-in-from-bottom duration-200"
            style={{ paddingBottom: 'calc(var(--sab, 0px) + 1.25rem)' }}
          >
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto -mt-1" />

            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-base font-bold text-white">Add Custom Service Item</h3>
              <button
                onClick={() => setIsAddItemModalOpen(false)}
                className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Service Task Name</label>
              <input
                type="text"
                placeholder="e.g. Spark Plugs / Brake Caliper Grease"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white mt-1 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">
                Service Interval ({settings.distanceUnit})
              </label>
              <input
                type="number"
                step="500"
                min="500"
                value={newItemInterval}
                onChange={(e) => setNewItemInterval(parseInt(e.target.value) || 1000)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono mt-1 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Notes / Part Specs</label>
              <input
                type="text"
                placeholder="e.g. NGK Laser Iridium / Dot 4 LV"
                value={newItemNotes}
                onChange={(e) => setNewItemNotes(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white mt-1 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={handleAddNewItem}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tracking-wider transition-all"
            >
              Save Service Item
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
