import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Download, Smartphone, Monitor } from 'lucide-react';
import { setupInstallPrompt, showInstallPrompt, isStandalone } from '@/utils/pwa';

export default function InstallPWA() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);

  useEffect(() => {
    // Don't show if already installed or running in standalone mode
    if (isStandalone()) {
      return;
    }

    // Check if user dismissed the prompt before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // Setup install prompt listener
    setupInstallPrompt((event) => {
      setInstallPromptEvent(event);
      setShowPrompt(true);
    });
  }, []);

  const handleInstall = async () => {
    const outcome = await showInstallPrompt();
    if (outcome === 'accepted') {
      setShowPrompt(false);
      localStorage.removeItem('pwa-install-dismissed');
    } else if (outcome === 'dismissed') {
      setShowPrompt(false);
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      <Card className="shadow-2xl border-2 border-teal-500 bg-white dark:bg-gray-800">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                  Install NuviaCare
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Get the full app experience
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <Download className="w-4 h-4 text-teal-600" />
              <span>Works offline</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <Monitor className="w-4 h-4 text-teal-600" />
              <span>Fast & reliable</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <Smartphone className="w-4 h-4 text-teal-600" />
              <span>Native app experience</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleInstall}
              className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Install App
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="px-6"
            >
              Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

