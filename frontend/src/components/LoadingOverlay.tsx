import React, { useEffect, useMemo, useState } from 'react';

interface LoadingOverlayProps {
  message?: string;
}

export default function LoadingOverlay({ message }: LoadingOverlayProps) {
  const [online, setOnline] = useState<boolean>(navigator.onLine);
  const [elapsedMs, setElapsedMs] = useState<number>(0);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => setElapsedMs(Date.now() - start), 250);
    return () => clearInterval(id);
  }, []);

  const friendlyMessage = useMemo(() => {
    if (message) return message;
    if (!online) return 'Poor network connection. Please check your internet.';
    if (elapsedMs > 8000) return 'This is taking longer than expected. Please try again later.';
    if (elapsedMs > 3000) return 'Still loading... thanks for your patience.';
    return 'Preparing your app...';
  }, [elapsedMs, online, message]);

  const subMessage = useMemo(() => {
    if (!online) return 'You appear to be offline. Reconnect to continue.';
    if (elapsedMs > 8000) return 'You can retry now or wait a moment and try again.';
    if (elapsedMs > 3000) return 'Your data and features are being loaded.';
    return 'Loading resources...';
  }, [elapsedMs, online]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="text-center animate-fade-in p-6">
        <div className="mx-auto mb-6 w-16 h-16 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{friendlyMessage}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{subMessage}</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-md bg-teal-600 text-white hover:bg-teal-700 transition-colors"
          >
            Retry
          </button>
          <button
            onClick={() => history.back()}
            className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Go Back
          </button>
        </div>
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          {online ? 'Network: Online' : 'Network: Offline'} • {Math.round(elapsedMs / 1000)}s elapsed
        </div>
      </div>
    </div>
  );
}


