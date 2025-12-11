import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff, Wifi } from 'lucide-react';
import { isOnline, setupNetworkListeners } from '@/utils/pwa';

export default function OfflineIndicator() {
  const [online, setOnline] = useState(isOnline());
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const cleanup = setupNetworkListeners(
      () => {
        setOnline(true);
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 3000);
      },
      () => {
        setOnline(false);
        setShowMessage(true);
      }
    );

    return cleanup;
  }, []);

  if (!showMessage) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
      <Alert
        className={`${
          online
            ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-200'
            : 'bg-orange-50 dark:bg-orange-900/20 border-orange-500 text-orange-800 dark:text-orange-200'
        } shadow-lg`}
      >
        {online ? (
          <Wifi className="h-4 w-4" />
        ) : (
          <WifiOff className="h-4 w-4" />
        )}
        <AlertDescription className="ml-2">
          {online
            ? 'Back online! Your data is syncing...'
            : 'You are offline. Some features may be limited.'}
        </AlertDescription>
      </Alert>
    </div>
  );
}

