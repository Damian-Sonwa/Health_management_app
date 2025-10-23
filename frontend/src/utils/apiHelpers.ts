import { toast } from 'sonner';

/**
 * Shows a loading toast while API call is in progress
 * Automatically shows success/error messages
 */
export async function apiWithToast<T>(
  apiCall: () => Promise<T>,
  messages: {
    loading?: string;
    success?: string;
    error?: string;
  } = {}
): Promise<T> {
  const loadingToast = toast.loading(
    messages.loading || 'Processing... (Backend may be waking up, this can take up to 60 seconds)'
  );

  try {
    const result = await apiCall();
    toast.dismiss(loadingToast);
    
    if (messages.success) {
      toast.success(messages.success);
    }
    
    return result;
  } catch (error: any) {
    toast.dismiss(loadingToast);
    
    const errorMessage = messages.error || error.message || 'Operation failed';
    
    // Provide helpful error messages
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      toast.error('Request timed out', {
        description: 'The server is taking too long to respond. Please try again in a moment.',
        duration: 5000,
      });
    } else if (error.message.includes('Network error') || error.message.includes('fetch')) {
      toast.error('Connection Error', {
        description: 'Unable to reach the server. Please check your internet connection.',
        duration: 5000,
      });
    } else if (error.message.includes('Authentication required')) {
      toast.error('Session Expired', {
        description: 'Please log in again.',
        duration: 3000,
      });
    } else {
      toast.error(errorMessage, {
        duration: 4000,
      });
    }
    
    throw error;
  }
}

/**
 * Checks if backend is reachable and shows appropriate message
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('https://health-management-app-joj5.onrender.com', {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn('Backend health check failed:', error);
    return false;
  }
}

/**
 * Shows a warning if backend appears to be sleeping
 */
export function warnIfBackendSleeping() {
  checkBackendHealth().then((isHealthy) => {
    if (!isHealthy) {
      toast.info('Backend Starting', {
        description: 'The server is waking up. First request may take 30-60 seconds.',
        duration: 10000,
      });
    }
  });
}

