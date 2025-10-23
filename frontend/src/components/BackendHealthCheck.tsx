import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';

export function BackendHealthCheck() {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline' | 'waking'>('checking');
  const [message, setMessage] = useState('Checking backend connection...');
  const [showAlert, setShowAlert] = useState(false);

  const checkBackend = async () => {
    setStatus('checking');
    setMessage('Checking backend connection...');
    
    try {
      console.log('🏥 Checking backend health...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second check
      
      const response = await fetch('https://health-management-app-joj5.onrender.com', {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log('✅ Backend is online');
        setStatus('online');
        setMessage('Backend connected successfully');
        setShowAlert(false);
      } else {
        console.error('❌ Backend returned error:', response.status);
        setStatus('offline');
        setMessage(`Backend error: ${response.status}`);
        setShowAlert(true);
      }
    } catch (error: any) {
      console.error('❌ Backend health check failed:', error);
      
      if (error.name === 'AbortError') {
        // Timeout - backend might be waking up
        setStatus('waking');
        setMessage('Backend is starting up. This may take 30-60 seconds on first load.');
        setShowAlert(true);
      } else {
        // Other error - backend unreachable
        setStatus('offline');
        setMessage('Cannot connect to backend. Please check your internet connection.');
        setShowAlert(true);
      }
    }
  };

  useEffect(() => {
    // Check on mount
    checkBackend();
    
    // Check every 30 seconds
    const interval = setInterval(checkBackend, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (!showAlert) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <Alert variant={status === 'waking' ? 'default' : 'destructive'} className="shadow-lg">
        <div className="flex items-start gap-3">
          {status === 'checking' && <Loader2 className="h-5 w-5 animate-spin" />}
          {status === 'waking' && <Loader2 className="h-5 w-5 animate-spin text-yellow-600" />}
          {status === 'offline' && <AlertCircle className="h-5 w-5" />}
          {status === 'online' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
          
          <div className="flex-1">
            <AlertTitle className="mb-1">
              {status === 'checking' && 'Checking Connection'}
              {status === 'waking' && 'Backend Starting Up'}
              {status === 'offline' && 'Backend Offline'}
              {status === 'online' && 'Connected'}
            </AlertTitle>
            <AlertDescription className="text-sm">
              {message}
              
              {status === 'waking' && (
                <div className="mt-2 space-y-1">
                  <p>⏳ Please wait 30-60 seconds...</p>
                  <p className="text-xs">
                    This happens because Render free tier sleeps after inactivity.
                    <br />
                    <strong>Solution:</strong> Setup UptimeRobot to keep backend awake 24/7
                  </p>
                </div>
              )}
              
              {status === 'offline' && (
                <div className="mt-2 space-y-1">
                  <p>Possible causes:</p>
                  <ul className="text-xs list-disc ml-4">
                    <li>Backend is sleeping (Render free tier)</li>
                    <li>No internet connection</li>
                    <li>Firewall blocking requests</li>
                    <li>Backend deployment failed</li>
                  </ul>
                </div>
              )}
            </AlertDescription>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={checkBackend}
            disabled={status === 'checking'}
            className="shrink-0"
          >
            <RefreshCw className={`h-4 w-4 ${status === 'checking' ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </Alert>
    </div>
  );
}

