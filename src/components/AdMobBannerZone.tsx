import React, { useEffect, useState } from 'react';
import { admobService } from '../services/admobService';
import { Sparkles, X, ShieldCheck } from 'lucide-react';

export const AdMobBannerZone: React.FC = () => {
  const [actionCount, setActionCount] = useState<number>(() => admobService.getActionCount());
  const [interstitialNotification, setInterstitialNotification] = useState<string | null>(null);
  const [showSimulatedModal, setShowSimulatedModal] = useState(false);

  useEffect(() => {
    admobService.initAds();
    admobService.showBottomBanner();

    const unsubscribe = admobService.subscribe((event) => {
      setActionCount(event.count);
      if (event.type === 'interstitial') {
        setInterstitialNotification(event.message);
        setShowSimulatedModal(true);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <>
      {/* 65px Strict Safe Zone for AdMob Adaptive Banner */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 h-[65px] bg-slate-950/95 border-t border-slate-800 flex items-center justify-center px-3"
        style={{ height: '65px' }}
      >
        <div className="w-full max-w-[430px] h-full flex items-center justify-between px-2 text-xs">
          {/* Simulated Adaptive Banner Display */}
          <div className="w-full h-[50px] bg-slate-900/90 rounded-lg border border-dashed border-emerald-500/30 flex items-center justify-between px-3 relative overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                AdMob Banner
              </span>
              <div>
                <p className="text-[11px] font-medium text-slate-300 leading-tight">
                  Adaptive Banner (65px Safe Zone)
                </p>
                <p className="text-[9px] text-slate-500 leading-none">
                  Native Android / Web Adaptive Slot
                </p>
              </div>
            </div>

            {/* Action Counter Badge */}
            <div className="flex items-center gap-1 bg-slate-800/90 px-2 py-1 rounded-md border border-slate-700/60 text-[10px] text-slate-300 font-mono">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Actions: <strong className="text-emerald-400">{actionCount}</strong></span>
              <span className="text-slate-500 text-[9px]">({3 - (actionCount % 3 === 0 ? 3 : actionCount % 3)} to ad)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Interstitial Ad Native Modal (Triggered every 3rd action) */}
      {showSimulatedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-[380px] bg-slate-900 border border-emerald-500/40 rounded-2xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  AdMob Interstitial Ad
                </span>
              </div>
              <button
                onClick={() => setShowSimulatedModal(false)}
                className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
              </div>
              <h4 className="text-base font-bold text-white">Full-Screen Interstitial Ad</h4>
              <p className="text-xs text-slate-400 px-4">
                {interstitialNotification || 'Triggered every 3 major user actions. Safe Capacitor native wrapper active.'}
              </p>
            </div>

            <div className="bg-slate-800/80 rounded-xl p-3 text-[11px] text-slate-300 space-y-1 font-mono">
              <div className="flex justify-between">
                <span>Completed Actions:</span>
                <span className="text-emerald-400 font-bold">{actionCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Ad Frequency:</span>
                <span className="text-slate-400">1 ad per 3 actions</span>
              </div>
              <div className="flex justify-between">
                <span>Native Capacitor Plugin:</span>
                <span className="text-cyan-400">Active / Safe</span>
              </div>
            </div>

            <button
              onClick={() => setShowSimulatedModal(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tracking-wider transition-all"
            >
              Resume WattDrive App
            </button>
          </div>
        </div>
      )}
    </>
  );
};
