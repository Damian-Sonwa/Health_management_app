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
import { useEffect, lazy, Suspense } from 'react';
import { registerServiceWorker } from '@/utils/pwa';

// Lazy load all pages for faster initial load (especially on mobile)
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const VitalsPage = lazy(() => import('@/pages/VitalsPage'));
const MedicationsPage = lazy(() => import('@/pages/MedicationsPage'));
const AppointmentsPage = lazy(() => import('@/pages/AppointmentsPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const MedicationRequestPage = lazy(() => import('@/pages/MedicationRequestPage'));
const UpgradePage = lazy(() => import('@/pages/UpgradePage'));
const ProfileOnboarding = lazy(() => import('@/pages/ProfileOnboarding'));
const SubscriptionPage = lazy(() => import('@/components/SubscriptionPage'));
const CaregiversPage = lazy(() => import('@/pages/CaregiversPage'));
const CarePlansPage = lazy(() => import('@/pages/CarePlansPage'));
const EducationPage = lazy(() => import('@/pages/EducationPage'));
const TelehealthPage = lazy(() => import('@/pages/TelehealthPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const WellnessGuide = lazy(() => import('@/components/WellnessGuide'));
const GamificationPage = lazy(() => import('@/pages/GamificationPage'));
const AIChat = lazy(() => import('@/components/AIChat'));
const DevicesPage = lazy(() => import('@/pages/DevicesPage'));
const DataVisualization = lazy(() => import('@/components/DataVisualization'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
    <div className="text-center animate-fade-in space-y-4">
      <AnimatedLogo size={80} className="mx-auto drop-shadow-lg" />
    </div>
  </div>
);

// Ensure QueryClient persists
const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  if (!auth) {
    console.error("ProtectedRoute error: useAuth() returned undefined. Ensure AuthProvider wraps your app.");
    return <Navigate to="/auth" replace />;
  }

  const { user, loading, token } = auth;

  // If loading and no token, show auth page immediately (don't wait)
  if (loading && !token) {
    return <Navigate to="/auth" replace />;
  }

  // If no token exists, immediately redirect to auth (don't wait for loading)
  if (!token) {
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
  const auth = useAuth();
  const { user, token, loading } = auth || { user: null, token: null, loading: true };

  return (
    <Routes>
      <Route
        path="/auth"
        element={
          // Only redirect if user is definitely authenticated (has token and user, not just loading)
          // Otherwise, always show auth page (even if loading, to prevent blank screen)
          (token && user && !loading) ? <Navigate to="/dashboard" replace /> : <AuthPage />
        }
      />

      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <ProfileOnboarding />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <Dashboard />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vitals"
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <VitalsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/medications"
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <MedicationsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments"
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <AppointmentsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/medication-request"
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <MedicationRequestPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <ProfilePage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/upgrade"
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <UpgradePage onBack={() => window.history.back()} />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/subscription"
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <SubscriptionPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/caregivers"
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <CaregiversPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/care-plans"
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <CarePlansPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/education"
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <EducationPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/telehealth"
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <TelehealthPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <SettingsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/wellness"
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <WellnessGuide />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <DataVisualization />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/gamification"
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <GamificationPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-chat"
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <AIChat />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/devices"
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <DevicesPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route 
        path="/" 
        element={
          // Immediately redirect to auth page - no waiting
          // If user is authenticated, ProtectedRoute will handle redirect to dashboard
          <Navigate to="/auth" replace />
        } 
      />
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
            if (navigator.serviceWorker) {
              navigator.serviceWorker.addEventListener('message', (event) => {
                if (event && event.data && event.data.type === 'SW_UPDATED') {
                  console.log('[PWA] Service worker updated, clearing caches and reloading...');
                  // Clear all caches before reload
                  if ('caches' in window && caches) {
                    caches.keys()
                      .then(names => {
                        if (names && Array.isArray(names)) {
                          console.log('[PWA] Clearing caches:', names);
                          names.forEach(name => {
                            if (name) {
                              caches.delete(name).catch(err => {
                                console.warn('[PWA] Error deleting cache:', name, err);
                              });
                            }
                          });
                        }
                        setTimeout(() => window.location.reload(), 100);
                      })
                      .catch(err => {
                        console.warn('[PWA] Error getting cache names:', err);
                        setTimeout(() => window.location.reload(), 100);
                      });
                  } else {
                    window.location.reload();
                  }
                }
              });
            }
            
            // Listen for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker && newWorker.state === 'installed' && navigator.serviceWorker && navigator.serviceWorker.controller) {
                    // New service worker available - force reload
                    console.log('[PWA] New version available, reloading...');
                    try {
                      newWorker.postMessage({ type: 'SKIP_WAITING' });
                    } catch (err) {
                      console.warn('[PWA] Error posting message to SW:', err);
                    }
                    setTimeout(() => {
                      window.location.reload();
                    }, 1000);
                  }
                });
                
                // Also listen for errors
                newWorker.addEventListener('error', (err) => {
                  console.warn('[PWA] Service worker installation error:', err);
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
