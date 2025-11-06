import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';
import { queryClient } from './lib/queryClient';
import './i18n/config'; // Initialize i18n synchronously (required by Layout component)

// Mobile debugging - log to screen if console not available
const mobileDebug = (msg: string) => {
  console.log(msg);
  // Also create visible debug output on mobile
  if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    const debugEl = document.createElement('div');
    debugEl.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:rgba(0,0,0,0.8);color:#0f0;padding:10px;font-size:10px;z-index:99999;max-height:100px;overflow:auto;';
    debugEl.textContent = new Date().toLocaleTimeString() + ': ' + msg;
    document.body.appendChild(debugEl);
    setTimeout(() => debugEl.remove(), 5000);
  }
};

mobileDebug('🚀 App starting...');

// On mobile, clear service worker caches before app loads to prevent stale content
if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
  // Unregister all service workers first
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister().then(() => {
          console.log('[Mobile] Unregistered service worker');
        });
      });
    });
  }
  
  // Clear all caches
  if ('caches' in window) {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        caches.delete(cacheName).then(() => {
          console.log('[Mobile] Cleared cache:', cacheName);
        });
      });
    });
  }
}

// Add global error handler for mobile
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  mobileDebug('❌ Error: ' + event.error?.message);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  mobileDebug('❌ Promise error: ' + event.reason);
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  const msg = 'Root element not found';
  mobileDebug('❌ ' + msg);
  document.body.innerHTML = '<div style="padding: 20px; text-align: center; background: #f00; color: white; min-height: 100vh;"><h1>Error: Root element not found</h1><p>Please refresh the page.</p></div>';
} else {
  try {
    mobileDebug('✅ Root found, rendering...');
    
    // Render the app - React will replace the loading screen content
    const root = createRoot(rootElement);
    root.render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
    
    mobileDebug('✅ App rendered successfully');
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Failed to render app:', error);
    mobileDebug('❌ Render failed: ' + errorMsg);
    rootElement.innerHTML = '<div style="padding: 20px; text-align: center; background: #f44; color: white; min-height: 100vh;"><h1>Error loading app</h1><p>' + errorMsg + '</p><button onclick="window.location.reload()" style="padding: 10px 20px; font-size: 16px; margin-top: 20px; cursor: pointer;">Reload Page</button></div>';
  }
}
