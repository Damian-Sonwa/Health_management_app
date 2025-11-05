import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider, useAuth } from '@/components/AuthContext';
import Layout from '@/components/Layout';
import AuthPage from '@/components/AuthPage';
import ErrorBoundary from '@/components/ErrorBoundary';
import InstallPWA from '@/components/InstallPWA';
import OfflineIndicator from '@/components/OfflineIndicator';
import AnimatedLogo from '@/components/AnimatedLogo';
import { useEffect } from 'react';
import { registerServiceWorker } from '@/utils/pwa';

// Pages
import Dashboard from '@/pages/Dashboard';
import VitalsPage from '@/pages/VitalsPage';
import MedicationsPage from '@/pages/MedicationsPage';
import AppointmentsPage from '@/pages/AppointmentsPage';
import ProfilePage from '@/pages/ProfilePage';
import MedicationRequestPage from '@/pages/MedicationRequestPage';
import UpgradePage from '@/pages/UpgradePage';
import ProfileOnboarding from '@/pages/ProfileOnboarding';
import SubscriptionPage from '@/components/SubscriptionPage';
import CaregiversPage from '@/pages/CaregiversPage';
import CarePlansPage from '@/pages/CarePlansPage';
import EducationPage from '@/pages/EducationPage';
import TelehealthPage from '@/pages/TelehealthPage';
import SettingsPage from '@/pages/SettingsPage';
import WellnessGuide from '@/components/WellnessGuide';
import GamificationPage from '@/pages/GamificationPage';
import AIChat from '@/components/AIChat';
import DevicesPage from '@/pages/DevicesPage';
import DataVisualization from '@/components/DataVisualization';

// Ensure QueryClient persists
const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  if (!auth) {
    console.error("ProtectedRoute error: useAuth() returned undefined. Ensure AuthProvider wraps your app.");
    return <Navigate to="/auth" replace />;
  }

  const { user, loading, token } = auth;

  // If no token exists, immediately redirect to auth (don't wait for loading)
  if (!token && !loading) {
    return <Navigate to="/auth" replace />;
  }

  // Only show loading for authenticated users who are verifying their session
  if (loading && token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        <div className="text-center animate-fade-in space-y-4">
          <AnimatedLogo size={80} className="mx-auto drop-shadow-lg" />
        </div>
      </div>
    );
  }

  // If loading is done but no user, redirect to auth
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  // If no user even after loading, redirect to auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <ErrorBoundary>
      <Layout>{children}</Layout>
    </ErrorBoundary>
  );
}

function AppRoutes() {
  const { user, token, loading } = useAuth();

  return (
    <Routes>
      <Route
        path="/auth"
        element={
          // Only redirect if user is definitely authenticated (has token and user, not just loading)
          (token && user && !loading) ? <Navigate to="/dashboard" replace /> : <AuthPage />
        }
      />

      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <ProfileOnboarding />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vitals"
        element={
          <ProtectedRoute>
            <VitalsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/medications"
        element={
          <ProtectedRoute>
            <MedicationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments"
        element={
          <ProtectedRoute>
            <AppointmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/medication-request"
        element={
          <ProtectedRoute>
            <MedicationRequestPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upgrade"
        element={
          <ProtectedRoute>
            <UpgradePage onBack={() => window.history.back()} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/subscription"
        element={
          <ProtectedRoute>
            <SubscriptionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/caregivers"
        element={
          <ProtectedRoute>
            <CaregiversPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/care-plans"
        element={
          <ProtectedRoute>
            <CarePlansPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/education"
        element={
          <ProtectedRoute>
            <EducationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/telehealth"
        element={
          <ProtectedRoute>
            <TelehealthPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wellness"
        element={
          <ProtectedRoute>
            <WellnessGuide />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <DataVisualization />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gamification"
        element={
          <ProtectedRoute>
            <GamificationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-chat"
        element={
          <ProtectedRoute>
            <AIChat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/devices"
        element={
          <ProtectedRoute>
            <DevicesPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
}

function App() {
  // Register service worker on app mount
  useEffect(() => {
    if (import.meta.env.PROD) {
      // Only register service worker in production with error handling
      registerServiceWorker()
        .then((registration) => {
          if (registration) {
            // Check for updates on every page load
            registration.update();
            
            // Listen for service worker messages
            navigator.serviceWorker.addEventListener('message', (event) => {
              if (event.data && event.data.type === 'SW_UPDATED') {
                console.log('[PWA] Service worker updated, clearing caches and reloading...');
                // Clear all caches before reload
                if ('caches' in window) {
                  caches.keys().then(names => {
                    console.log('[PWA] Clearing caches:', names);
                    names.forEach(name => caches.delete(name));
                    setTimeout(() => window.location.reload(), 100);
                  });
                } else {
                  window.location.reload();
                }
              }
            });
            
            // Listen for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New service worker available - force reload
                    console.log('[PWA] New version available, reloading...');
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    setTimeout(() => {
                      window.location.reload();
                    }, 1000);
                  }
                });
              }
            });
          }
        })
        .catch(err => {
          console.warn('Service worker registration failed:', err);
        });
    } else {
      // In development, clear caches on reload to avoid stale cache issues
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            registration.unregister();
          });
        });
        if ('caches' in window) {
          caches.keys().then((cacheNames) => {
            cacheNames.forEach((cacheName) => {
              caches.delete(cacheName);
            });
          });
        }
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen">
            <AppRoutes />
            <Toaster />
            <InstallPWA />
            <OfflineIndicator />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
