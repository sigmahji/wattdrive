import React from 'react';
import { Calculator, SunMedium, Wrench } from 'lucide-react';

export type ActiveTab = 'commute' | 'solar' | 'garage';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav
      className="fixed left-0 right-0 z-30 flex justify-center bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 transition-all"
      style={{ bottom: 'calc(65px + var(--sab, 0px))' }} // Positioned exactly above the 65px AdMob Safe Zone + bottom inset
    >
      <div className="w-full max-w-[430px] h-15 flex items-center justify-around px-2">
        {/* Tab 1: Commute ROI */}
        <button
          onClick={() => onTabChange('commute')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-all ${
            activeTab === 'commute'
              ? 'text-emerald-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-colors ${
              activeTab === 'commute' ? 'bg-emerald-500/15' : 'bg-transparent'
            }`}
          >
            <Calculator className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Commute ROI</span>
        </button>

        {/* Tab 2: Solar & Sizer */}
        <button
          onClick={() => onTabChange('solar')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-all ${
            activeTab === 'solar'
              ? 'text-cyan-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-colors ${
              activeTab === 'solar' ? 'bg-cyan-500/15' : 'bg-transparent'
            }`}
          >
            <SunMedium className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Solar & Sizer</span>
        </button>

        {/* Tab 3: Garage & Service */}
        <button
          onClick={() => onTabChange('garage')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-all ${
            activeTab === 'garage'
              ? 'text-emerald-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-colors ${
              activeTab === 'garage' ? 'bg-emerald-500/15' : 'bg-transparent'
            }`}
          >
            <Wrench className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Fleet Garage</span>
        </button>
      </div>
    </nav>
  );
};
