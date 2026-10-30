import React, { useState } from 'react';
import { SettingsProvider } from './context/SettingsContext';
import { GlobalSettingsBar } from './components/GlobalSettingsBar';
import { BottomNav, type ActiveTab } from './components/BottomNav';
import { AdMobBannerZone } from './components/AdMobBannerZone';
import { CommuteRoiTab } from './components/tabs/CommuteRoiTab';
import { SolarSizerTab } from './components/tabs/SolarSizerTab';
import { GarageTab } from './components/tabs/GarageTab';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('commute');

  return (
    <div className="min-h-screen bg-slate-950 flex justify-center text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      {/* 430px Mobile Container centered on desktop */}
      <div className="w-full max-w-[430px] min-h-screen bg-slate-950 flex flex-col relative border-x border-slate-800/80 shadow-2xl">
        {/* Persistent Top Global Settings Bar */}
        <GlobalSettingsBar />

        {/* Tab Content Area (with dynamic bottom padding for BottomNav + 65px AdMob zone + Safe Area) */}
        <main
          className="flex-1 px-3 pt-3 overflow-y-auto"
          style={{ paddingBottom: 'calc(145px + var(--sab, 0px))' }}
        >
          {activeTab === 'commute' && <CommuteRoiTab />}
          {activeTab === 'solar' && <SolarSizerTab />}
          {activeTab === 'garage' && <GarageTab />}
        </main>

        {/* Bottom Navigation (Fixed at bottom: 65px) */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

        {/* AdMob 65px Safe Zone & Native Adaptive Banner (Fixed at bottom: 0) */}
        <AdMobBannerZone />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}
