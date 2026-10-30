import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import './index.css';
import App from './App.tsx';

// On native mobile devices (Android / iOS), ensure there is an immediate safe padding
// to prevent notch overlap even before Capacitor SystemBars finishes async insets injection
if (Capacitor.isNativePlatform()) {
  const root = document.documentElement;
  const currentTop = root.style.getPropertyValue('--safe-area-inset-top');
  if (!currentTop || currentTop === '0px') {
    root.style.setProperty('--safe-area-fallback-top', '36px');
    root.style.setProperty('--safe-area-fallback-bottom', '16px');
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
