import { useState, useEffect, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWA() {
  const [actualOnline, setActualOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  // User-controllable Forced Offline Mode (for testing and studio autonomy)
  const [isForcedOffline, setIsForcedOffline] = useState<boolean>(() => {
    try {
      return localStorage.getItem('msh_forced_offline') === 'true';
    } catch {
      return false;
    }
  });

  const [isReadyForOffline, setIsReadyForOffline] = useState<boolean>(true);
  const [isServiceWorkerActive, setIsServiceWorkerActive] = useState<boolean>(false);
  const [cachedAssetsCount, setCachedAssetsCount] = useState<number>(0);
  const [isSyncingCache, setIsSyncingCache] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [installOutcome, setInstallOutcome] = useState<'idle' | 'accepted' | 'dismissed'>('idle');

  // Detect platform
  const [platform, setPlatform] = useState<'windows' | 'mac' | 'linux' | 'android' | 'ios' | 'other'>('windows');

  // Computed effective online status: if forced offline, returns false
  const isOnline = !isForcedOffline && actualOnline;

  // Toggle offline mode function
  const toggleOfflineMode = useCallback((forced?: boolean) => {
    setIsForcedOffline((prev) => {
      const next = typeof forced === 'boolean' ? forced : !prev;
      try {
        localStorage.setItem('msh_forced_offline', String(next));
        window.dispatchEvent(new CustomEvent('msh-offline-mode-changed', { detail: { isOffline: next } }));
      } catch (err) {
        console.warn('Erro ao salvar preferência de modo offline:', err);
      }
      return next;
    });
  }, []);

  // Inspect CacheStorage
  const updateCacheStatus = useCallback(async () => {
    if (typeof window !== 'undefined' && 'caches' in window) {
      try {
        const cacheNames = await caches.keys();
        let total = 0;
        for (const name of cacheNames) {
          const cache = await caches.open(name);
          const keys = await cache.keys();
          total += keys.length;
        }
        setCachedAssetsCount(total);
      } catch (e) {
        console.warn('Erro ao verificar caches:', e);
      }
    }
  }, []);

  // Force cache sync of all critical assets
  const syncOfflineCache = useCallback(async () => {
    setIsSyncingCache(true);
    try {
      if (typeof window !== 'undefined' && 'caches' in window) {
        const cache = await caches.open('melo-studio-hub-v2');
        const urlsToCache = [
          '/',
          '/index.html',
          '/manifest.json',
          '/icon.svg',
          '/apple-touch-icon.png',
          '/pwa-192x192.png',
          '/pwa-512x512.png',
        ];

        // Also discover any current script/css tags in DOM
        const scripts = Array.from(document.querySelectorAll('script[src]'))
          .map((s) => (s as HTMLScriptElement).src)
          .filter((src) => src.startsWith(window.location.origin));
        const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
          .map((l) => (l as HTMLLinkElement).href)
          .filter((href) => href.startsWith(window.location.origin));

        const allUrls = Array.from(new Set([...urlsToCache, ...scripts, ...styles]));
        await Promise.all(
          allUrls.map(async (url) => {
            try {
              const res = await fetch(url, { cache: 'reload' });
              if (res.ok) {
                await cache.put(url, res);
              }
            } catch (err) {
              console.warn('Item skipped during cache sync:', url);
            }
          })
        );

        await updateCacheStatus();
      }
    } catch (e) {
      console.warn('Falha no sync de cache:', e);
    } finally {
      setIsSyncingCache(false);
    }
  }, [updateCacheStatus]);

  useEffect(() => {
    // Online / Offline tracking
    const handleOnline = () => setActualOnline(true);
    const handleOffline = () => setActualOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen to custom offline events across tabs or components
    const handleCustomOffline = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (typeof customEvent.detail?.isOffline === 'boolean') {
        setIsForcedOffline(customEvent.detail.isOffline);
      }
    };
    window.addEventListener('msh-offline-mode-changed', handleCustomOffline);

    // Check service worker status
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      if (navigator.serviceWorker.controller) {
        setIsServiceWorkerActive(true);
      }
      navigator.serviceWorker.ready.then(() => {
        setIsServiceWorkerActive(true);
      });
    }

    // Initialize cache status
    updateCacheStatus();

    // Detect standalone display mode
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes('android-app://');
      setIsInstalled(isStandaloneMode);
    };

    checkStandalone();

    // Detect OS platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform('ios');
    } else if (/android/.test(userAgent)) {
      setPlatform('android');
    } else if (/win/.test(userAgent)) {
      setPlatform('windows');
    } else if (/mac/.test(userAgent)) {
      setPlatform('mac');
    } else if (/linux/.test(userAgent)) {
      setPlatform('linux');
    } else {
      setPlatform('other');
    }

    // Capture PWA install prompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setInstallOutcome('accepted');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('msh-offline-mode-changed', handleCustomOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [updateCacheStatus]);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) {
      return false;
    }
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        setInstallOutcome('accepted');
        return true;
      } else {
        setInstallOutcome('dismissed');
        return false;
      }
    } catch (err) {
      console.warn('Error prompting PWA install:', err);
      return false;
    }
  }, [deferredPrompt]);

  return {
    isOnline,
    actualOnline,
    isForcedOffline,
    toggleOfflineMode,
    isReadyForOffline,
    isServiceWorkerActive,
    cachedAssetsCount,
    isSyncingCache,
    syncOfflineCache,
    isInstalled,
    isInstallable: !!deferredPrompt,
    installOutcome,
    platform,
    promptInstall,
  };
}

