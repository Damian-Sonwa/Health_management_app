// PWA Utility Functions

/**
 * Check if device is mobile
 */
function isMobileDevice(): boolean {
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (window.matchMedia && window.matchMedia('(max-width: 768px)').matches);
}

/**
 * Register the service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if ('serviceWorker' in navigator) {
    try {
      // On mobile, unregister all existing service workers first to prevent stale cache
      if (isMobileDevice()) {
        try {
          const existingRegistrations = await navigator.serviceWorker.getRegistrations();
          if (existingRegistrations && Array.isArray(existingRegistrations)) {
            for (const registration of existingRegistrations) {
              if (registration) {
                try {
                  await registration.unregister();
                  console.log('[PWA] Unregistered old service worker on mobile');
                } catch (err) {
                  console.warn('[PWA] Error unregistering SW:', err);
                }
              }
            }
          }
        } catch (err) {
          console.warn('[PWA] Error getting SW registrations:', err);
        }
        
        // Clear all caches on mobile before registering new SW
        if ('caches' in window && caches) {
          try {
            const cacheNames = await caches.keys();
            if (cacheNames && Array.isArray(cacheNames)) {
              await Promise.all(
                cacheNames
                  .filter(name => name) // Filter out null/undefined
                  .map(name => caches.delete(name).catch(err => {
                    console.warn('[PWA] Error deleting cache:', name, err);
                    return false;
                  }))
              );
              console.log('[PWA] Cleared all caches on mobile');
            }
          } catch (err) {
            console.warn('[PWA] Error clearing caches:', err);
          }
        }
      }

      // Register with cache-busting query parameter for mobile
      const swUrl = isMobileDevice() 
        ? `/sw.js?v=${Date.now()}&t=${Math.random()}`
        : '/sw.js';
      
      const registration = await navigator.serviceWorker.register(swUrl, {
        scope: '/',
        updateViaCache: 'none' // Never cache the service worker itself
      });

      console.log('[PWA] Service Worker registered successfully:', registration.scope);

      // On mobile, wait for service worker to be ready before proceeding
      if (isMobileDevice() && registration && registration.installing) {
        try {
          await new Promise<void>((resolve, reject) => {
            const installingWorker = registration.installing;
            if (!installingWorker) {
              resolve();
              return;
            }
            
            const timeout = setTimeout(() => {
              console.warn('[PWA] Service worker installation timeout');
              resolve(); // Resolve anyway to not block app
            }, 5000);
            
            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'activated' || installingWorker.state === 'redundant') {
                clearTimeout(timeout);
                resolve();
              }
            });
            
            // Also listen for errors
            installingWorker.addEventListener('error', (err) => {
              clearTimeout(timeout);
              console.warn('[PWA] Service worker installation error:', err);
              resolve(); // Resolve anyway to not block app
            });
          });
        } catch (err) {
          console.warn('[PWA] Error waiting for SW installation:', err);
          // Continue anyway to not block app
        }
      }

      // Check for updates immediately
      await registration.update();
      
      // On mobile, check for updates more frequently
      const updateInterval = isMobileDevice() ? 5000 : 10000;
      setInterval(() => {
        registration.update();
      }, updateInterval);
      
      // Also check immediately on focus
      window.addEventListener('focus', () => {
        registration.update();
      });
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New service worker available - force immediate update
                console.log('[PWA] New version available! Reloading...');
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'activated') {
                    // On mobile, clear caches before reload
                    if (isMobileDevice() && 'caches' in window) {
                      caches.keys().then(names => {
                        names.forEach(name => caches.delete(name));
                        setTimeout(() => window.location.reload(), 100);
                      });
                    } else {
                      window.location.reload();
                    }
                  }
                });
              } else {
                // First time installation
                console.log('[PWA] Service Worker installed for the first time');
              }
            }
          });
        }
      });

      return registration;
    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
      return null;
    }
  } else {
    console.warn('[PWA] Service Workers are not supported in this browser.');
    return null;
  }
}

/**
 * Unregister the service worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const success = await registration.unregister();
      console.log('[PWA] Service Worker unregistered:', success);
      return success;
    }
  }
  return false;
}

/**
 * Request push notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    console.log('[PWA] Notification permission:', permission);
    return permission;
  }
  return 'denied';
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(
  registration: ServiceWorkerRegistration
): Promise<PushSubscription | null> {
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        // Replace with your VAPID public key
        'YOUR_VAPID_PUBLIC_KEY_HERE'
      )
    });

    console.log('[PWA] Push notification subscription:', subscription);
    
    // Send subscription to your server
    // await fetch('/api/push-subscription', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(subscription)
    // });

    return subscription;
  } catch (error) {
    console.error('[PWA] Push notification subscription failed:', error);
    return null;
  }
}

/**
 * Helper function to convert VAPID key
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Check if app is running in standalone mode (installed)
 */
export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

/**
 * Check if app is installable
 */
export function isInstallable(): boolean {
  return 'BeforeInstallPromptEvent' in window;
}

/**
 * Get install prompt
 */
export interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: InstallPromptEvent | null = null;

export function setupInstallPrompt(callback: (event: InstallPromptEvent) => void): void {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e as InstallPromptEvent;
    console.log('[PWA] Install prompt available');
    callback(deferredPrompt);
  });

  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App installed successfully');
    deferredPrompt = null;
  });
}

export async function showInstallPrompt(): Promise<'accepted' | 'dismissed' | null> {
  if (!deferredPrompt) {
    console.log('[PWA] Install prompt not available');
    return null;
  }

  // Show the install prompt
  await deferredPrompt.prompt();
  
  // Wait for the user to respond to the prompt
  const { outcome } = await deferredPrompt.userChoice;
  console.log('[PWA] User response to install prompt:', outcome);
  
  // Clear the deferredPrompt
  deferredPrompt = null;
  
  return outcome;
}

/**
 * Share content using Web Share API
 */
export async function shareContent(data: ShareData): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share(data);
      console.log('[PWA] Content shared successfully');
      return true;
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('[PWA] Share failed:', error);
      }
      return false;
    }
  } else {
    console.warn('[PWA] Web Share API not supported');
    return false;
  }
}

/**
 * Check for app updates
 */
export async function checkForUpdates(): Promise<boolean> {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
      return true;
    }
  }
  return false;
}

/**
 * Clear all caches
 */
export async function clearAllCaches(): Promise<void> {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('[PWA] All caches cleared');
  }
}

/**
 * Get cache size
 */
export async function getCacheSize(): Promise<number> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return estimate.usage || 0;
  }
  return 0;
}

/**
 * Check if online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Setup online/offline listeners
 */
export function setupNetworkListeners(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}

