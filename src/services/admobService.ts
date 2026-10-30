/**
 * AdMob Bridge Architecture for WattDrive
 * Supports native Capacitor AdMob plugins with graceful web fallbacks & simulation.
 */

export interface AdMobState {
  actionCount: number;
  bannerVisible: boolean;
  lastInterstitialTime: number | null;
  isNative: boolean;
}

type AdListener = (event: { type: 'interstitial' | 'banner'; count: number; message: string }) => void;

class AdMobService {
  private static instance: AdMobService;
  private actionKey = 'wattdrive_admob_action_count';
  private listeners: Set<AdListener> = new Set();
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): AdMobService {
    if (!AdMobService.instance) {
      AdMobService.instance = new AdMobService();
    }
    return AdMobService.instance;
  }

  /**
   * Check if running in a native Capacitor Android/iOS runtime
   */
  public isNativePlatform(): boolean {
    return (
      typeof window !== 'undefined' &&
      !!(window as unknown as { Capacitor?: { isNativePlatform: () => boolean } }).Capacitor?.isNativePlatform()
    );
  }

  /**
   * Initialize AdMob SDK safely
   */
  public async initAds(): Promise<void> {
    if (this.isInitialized) return;

    try {
      if (this.isNativePlatform()) {
        // Attempt native AdMob initialization if @capacitor-community/admob is bundled
        const capacitorWindow = window as unknown as {
          Capacitor?: {
            Plugins?: {
              AdMob?: {
                initialize: () => Promise<void>;
              };
            };
          };
        };

        if (capacitorWindow.Capacitor?.Plugins?.AdMob) {
          await capacitorWindow.Capacitor.Plugins.AdMob.initialize();
          console.log('[AdMob Native] AdMob SDK Initialized.');
        }
      } else {
        console.log('[AdMob Web] Running in browser mode. Fallback simulator active.');
      }
    } catch (err) {
      console.warn('[AdMob] Init warning (running in web/mock mode):', err);
    } finally {
      this.isInitialized = true;
    }
  }

  /**
   * Display bottom adaptive banner ad (respects 65px safe zone)
   */
  public async showBottomBanner(): Promise<void> {
    try {
      if (this.isNativePlatform()) {
        const capacitorWindow = window as unknown as {
          Capacitor?: {
            Plugins?: {
              AdMob?: {
                showBanner: (options: unknown) => Promise<void>;
              };
            };
          };
        };

        if (capacitorWindow.Capacitor?.Plugins?.AdMob) {
          await capacitorWindow.Capacitor.Plugins.AdMob.showBanner({
            adId: 'ca-app-pub-3940256099942544/6300978111', // Google Test Banner ID
            position: 'BOTTOM_CENTER',
            margin: 0,
            isTesting: true,
          });
        }
      }
      this.notifyListeners({
        type: 'banner',
        count: this.getActionCount(),
        message: 'Bottom Adaptive Banner active in 65px safe zone',
      });
    } catch (err) {
      console.warn('[AdMob] showBottomBanner fallback:', err);
    }
  }

  /**
   * Hide bottom banner
   */
  public async hideBottomBanner(): Promise<void> {
    try {
      if (this.isNativePlatform()) {
        const capacitorWindow = window as unknown as {
          Capacitor?: {
            Plugins?: {
              AdMob?: {
                hideBanner: () => Promise<void>;
              };
            };
          };
        };

        if (capacitorWindow.Capacitor?.Plugins?.AdMob) {
          await capacitorWindow.Capacitor.Plugins.AdMob.hideBanner();
        }
      }
    } catch (err) {
      console.warn('[AdMob] hideBottomBanner fallback:', err);
    }
  }

  /**
   * Retrieve total user actions count from localStorage
   */
  public getActionCount(): number {
    try {
      const stored = localStorage.getItem(this.actionKey);
      return stored ? parseInt(stored, 10) || 0 : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Record a major user action (e.g. Odometer update, Service logged, Spec sheet generated).
   * Increments counter in localStorage and triggers an Interstitial Ad every 3rd major action.
   */
  public async recordUserAction(): Promise<{ triggeredInterstitial: boolean; actionCount: number }> {
    const nextCount = this.getActionCount() + 1;
    try {
      localStorage.setItem(this.actionKey, nextCount.toString());
    } catch (e) {
      console.warn('LocalStorage unavailable for ad count:', e);
    }

    const triggeredInterstitial = nextCount % 3 === 0;

    if (triggeredInterstitial) {
      await this.showInterstitialAd(nextCount);
    }

    return {
      triggeredInterstitial,
      actionCount: nextCount,
    };
  }

  /**
   * Show Interstitial Ad (native or simulated)
   */
  private async showInterstitialAd(count: number): Promise<void> {
    try {
      if (this.isNativePlatform()) {
        const capacitorWindow = window as unknown as {
          Capacitor?: {
            Plugins?: {
              AdMob?: {
                prepareInterstitial: (options: unknown) => Promise<void>;
                showInterstitial: () => Promise<void>;
              };
            };
          };
        };

        if (capacitorWindow.Capacitor?.Plugins?.AdMob) {
          await capacitorWindow.Capacitor.Plugins.AdMob.prepareInterstitial({
            adId: 'ca-app-pub-3940256099942544/1033173712', // Google Test Interstitial ID
            isTesting: true,
          });
          await capacitorWindow.Capacitor.Plugins.AdMob.showInterstitial();
        }
      }

      this.notifyListeners({
        type: 'interstitial',
        count,
        message: `Interstitial Ad triggered (Action #${count}: 3-action threshold reached)`,
      });
      console.log(`[AdMob] Interstitial displayed on action #${count}`);
    } catch (err) {
      console.warn('[AdMob] Interstitial trigger fallback:', err);
    }
  }

  /**
   * Subscribe to AdMob events (used by UI for notifications & test overlays)
   */
  public subscribe(listener: AdListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(event: { type: 'interstitial' | 'banner'; count: number; message: string }): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in AdMob listener:', err);
      }
    });
  }
}

export const admobService = AdMobService.getInstance();
