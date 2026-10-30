import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Sun,
  Moon,
  ShieldCheck,
  Check,
  Download,
  Car,
  Zap,
  Target,
  Award,
  Sparkles,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_OPTIONS = ['⚡', '🚗', '☀️', '🌿', '🔋', '🏎️', '🛠️', '⭐'];

const PERSONAS = [
  {
    id: 'Daily Commuter',
    title: 'Daily Commuter',
    desc: 'Optimized for work-week savings & fuel-vs-EV ROI',
    icon: Car,
  },
  {
    id: 'Clean Energy Pioneer',
    title: 'Clean Energy Pioneer',
    desc: 'Zero-emission focus with solar panel & off-peak charging',
    icon: Zap,
  },
  {
    id: 'Fleet Garage Manager',
    title: 'Fleet Garage Manager',
    desc: 'Multi-vehicle maintenance intervals & service logs',
    icon: Award,
  },
];

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfile, theme, setTheme, settings, formatDistance } = useSettings();

  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [driverPersona, setDriverPersona] = useState(profile.driverPersona);
  const [dailyDistanceGoal, setDailyDistanceGoal] = useState<number>(profile.dailyDistanceGoal || 40);
  const [savedToast, setSavedToast] = useState(false);
  const [garageCount, setGarageCount] = useState<number>(0);

  // Sync state whenever profile updates or modal opens
  useEffect(() => {
    if (isOpen) {
      setName(profile.name);
      setEmail(profile.email);
      setAvatar(profile.avatar);
      setDriverPersona(profile.driverPersona);
      setDailyDistanceGoal(profile.dailyDistanceGoal || 40);

      // Check garage vehicles count from localStorage
      try {
        const garageRaw = localStorage.getItem('wattdrive_garage_vehicles_v1');
        if (garageRaw) {
          const list = JSON.parse(garageRaw);
          if (Array.isArray(list)) {
            setGarageCount(list.length);
          }
        }
      } catch {
        setGarageCount(0);
      }
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleSave = () => {
    updateProfile({
      name: name.trim() || 'WattDrive Driver',
      email: email.trim() || 'driver@wattdrive.app',
      avatar,
      driverPersona,
      dailyDistanceGoal: Number(dailyDistanceGoal) || 40,
    });
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 600);
  };

  const handleExportData = () => {
    try {
      const exportObject = {
        exportedAt: new Date().toISOString(),
        profile: { ...profile, name, email, avatar, driverPersona, dailyDistanceGoal },
        settings,
        garage: JSON.parse(localStorage.getItem('wattdrive_garage_vehicles_v1') || '[]'),
      };
      const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wattdrive_backup_${name.toLowerCase().replace(/\s+/g, '_')}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to export data', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-[430px] max-h-[88vh] bg-slate-900 border-t border-slate-750 rounded-t-3xl p-5 shadow-2xl overflow-y-auto animate-in slide-in-from-bottom duration-200 flex flex-col gap-4 text-slate-100"
        style={{ paddingBottom: 'calc(var(--sab, 0px) + 1.25rem)' }}
      >
        {/* Drawer Handle */}
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto -mt-1 mb-1 shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20">
              <User className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">Driver Profile & ID</h3>
              <p className="text-xs text-slate-400">Identity, units & display preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
            aria-label="Close Profile"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Driver Card with Avatar Selection */}
        <div className="bg-gradient-to-br from-slate-850 to-slate-900 rounded-2xl border border-slate-750 p-4 space-y-3 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center text-3xl shadow-inner relative group shrink-0">
              {avatar}
              <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-emerald-500 text-slate-950">
                <Sparkles className="w-3 h-3" />
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3" />
                <span>{driverPersona}</span>
              </span>
              <h4 className="text-base font-bold text-white truncate mt-0.5">{name || 'WattDrive Driver'}</h4>
              <p className="text-xs text-slate-400 truncate">{email || 'driver@wattdrive.app'}</p>
            </div>
          </div>

          {/* Quick Avatar Emoji Switcher */}
          <div className="pt-2 border-t border-slate-800">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Choose Avatar
            </label>
            <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar py-0.5">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatar(emoji)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all ${
                    avatar === emoji
                      ? 'bg-emerald-500/25 border-2 border-emerald-400 scale-110 shadow-sm'
                      : 'bg-slate-800/80 border border-slate-700/80 hover:bg-slate-750'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Theme Mode Toggle Section (Light & Dark) */}
        <div className="bg-slate-850/80 rounded-2xl border border-slate-750 p-3.5 space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>App Appearance & Theme</span>
            <span className="text-[10px] text-emerald-400 font-normal">Instant preview</span>
          </label>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Dark Theme Button */}
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all ${
                theme === 'dark'
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-semibold shadow-sm'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-750'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-slate-900 text-cyan-400 border border-slate-750">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold leading-tight">Dark Slate</div>
                  <div className="text-[9px] text-slate-400">OLED & Night</div>
                </div>
              </div>
              {theme === 'dark' && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
            </button>

            {/* Light Theme Button */}
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all ${
                theme === 'light'
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-semibold shadow-sm'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-750'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  <Sun className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <div className="text-xs font-bold leading-tight">Light Daylight</div>
                  <div className="text-[9px] text-slate-400">High Contrast</div>
                </div>
              </div>
              {theme === 'light' && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
            </button>
          </div>
        </div>

        {/* Profile Details Edit Form */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-300">Driver Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-300">Email / ID</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="driver@wattdrive.app"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Persona Selection */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-300">Driving Persona</label>
            <div className="space-y-1.5">
              {PERSONAS.map((item) => {
                const isSelected = driverPersona === item.id;
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDriverPersona(item.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                        : 'bg-slate-800/60 border-slate-750 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`p-1.5 rounded-lg ${
                          isSelected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold leading-tight">{item.title}</div>
                        <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{item.desc}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daily Goal Distance Target */}
          <div className="space-y-1 bg-slate-850/60 p-3 rounded-xl border border-slate-750">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-300 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span>Daily Roundtrip Target</span>
              </span>
              <span className="font-mono font-bold text-emerald-400 text-xs">
                {formatDistance(dailyDistanceGoal)}
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="250"
              step="5"
              value={dailyDistanceGoal}
              onChange={(e) => setDailyDistanceGoal(Number(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer mt-1"
            />
          </div>
        </div>

        {/* Fleet & Profile Quick Overview Badges */}
        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="bg-slate-800/80 rounded-xl p-2 border border-slate-750">
            <span className="text-[10px] text-slate-400 block leading-tight">Garage Fleet</span>
            <span className="text-sm font-bold text-white font-mono mt-0.5 block">{garageCount} Cars</span>
          </div>

          <div className="bg-slate-800/80 rounded-xl p-2 border border-slate-750">
            <span className="text-[10px] text-slate-400 block leading-tight">Region</span>
            <span className="text-sm font-bold text-white mt-0.5 block truncate">
              {settings.currencySymbol} • {settings.distanceUnit}
            </span>
          </div>

          <div className="bg-slate-800/80 rounded-xl p-2 border border-slate-750">
            <span className="text-[10px] text-slate-400 block leading-tight">Grid Spec</span>
            <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5 block truncate">
              {settings.gridVoltage}
            </span>
          </div>
        </div>

        {/* Data Backup & Export */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleExportData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Backup (JSON)</span>
          </button>

          <span className="text-[10px] text-slate-500 font-mono">Member since {profile.memberSince || '2026'}</span>
        </div>

        {/* Save & Apply Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
          >
            {savedToast ? (
              <>
                <Check className="w-4 h-4" />
                <span>Profile Preferences Saved!</span>
              </>
            ) : (
              <span>Save & Apply Profile</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
