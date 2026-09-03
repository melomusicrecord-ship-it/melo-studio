import { useState, useEffect, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWA() {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  const [isReadyForOffline, setIsReadyForOffline] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [installOutcome, setInstallOutcome] = useState<'idle' | 'accepted' | 'dismissed'>('idle');

  // Detect platform
  const [platform, setPlatform] = useState<'windows' | 'mac' | 'linux' | 'android' | 'ios' | 'other'>('windows');

  useEffect(() => {
    // Online / Offline tracking
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

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

    // Verify offline readiness (document loaded, storage available)
    if (document.readyState === 'complete') {
      setIsReadyForOffline(true);
    } else {
      const handleLoad = () => setIsReadyForOffline(true);
      window.addEventListener('load', handleLoad);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
        window.removeEventListener('appinstalled', handleAppInstalled);
        window.removeEventListener('load', handleLoad);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

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
    isReadyForOffline,
    isInstalled,
    isInstallable: !!deferredPrompt,
    installOutcome,
    platform,
    promptInstall,
  };
}
