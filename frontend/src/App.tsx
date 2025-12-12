import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider, useAuth } from '@/components/AuthContext';
import Layout from '@/components/Layout';
import AuthPage from '@/components/AuthPage';
import ErrorBoundary from '@/components/ErrorBoundary';
import InstallPWA from '@/components/InstallPWA';
import OfflineIndicator from '@/components/OfflineIndicator';
import RoleBasedRoute from '@/components/RoleBasedRoute';
import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getDashboardPath } from '@/utils/navigation';

// Direct imports - no lazy loading to prevent loading issues
import Dashboard from '@/pages/Dashboard';
import VitalsPage from '@/pages/VitalsPage';
import MedicationsPage from '@/pages/MedicationsPage';
import AppointmentsPage from '@/pages/AppointmentsPage';
import ProfilePage from '@/pages/ProfilePage';
import MedicationRequestPage from '@/pages/MedicationRequestPage';
import MedicationRequestChatPage from '@/pages/MedicationRequestChatPage';
import PharmacySelectionPage from '@/pages/PharmacySelectionPage';
import PharmacyDashboard from '@/pages/PharmacyDashboard';
import DoctorDashboard from '@/pages/DoctorDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import UpgradePage from '@/pages/UpgradePage';
import ProfileOnboarding from '@/pages/ProfileOnboarding';
import SubscriptionPage from '@/components/SubscriptionPage';
import CaregiversPage from '@/pages/CaregiversPage';
import CarePlansPage from '@/pages/CarePlansPage';
import EducationPage from '@/pages/EducationPage';
import TelehealthPage from '@/pages/TelehealthPage';
import PatientConsultationRoom from '@/pages/PatientConsultationRoom';
import SettingsPage from '@/pages/SettingsPage';
import PharmacyPage from '@/pages/PharmacyPage';
import PharmacyOnboarding from '@/pages/PharmacyOnboarding';
import PharmacyPendingApproval from '@/pages/PharmacyPendingApproval';
import DoctorOnboarding from '@/pages/DoctorOnboarding';
import DoctorPendingApproval from '@/pages/DoctorPendingApproval';
import WellnessGuide from '@/components/WellnessGuide';
import GamificationPage from '@/pages/GamificationPage';
import AIChat from '@/components/AIChat';
import DevicesPage from '@/pages/DevicesPage';
import DataVisualization from '@/components/DataVisualization';
import ChatPage from '@/pages/ChatPage';
import VideoCallPage from '@/pages/VideoCallPage';

// QueryClient with no caching to prevent stale data issues
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 0,
      cacheTime: 0,
      refetchOnMount: true,
      networkMode: 'online',
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  if (!auth) {
    console.error("ProtectedRoute error: useAuth() returned undefined. Ensure AuthProvider wraps your app.");
    return <Navigate to="/auth" replace />;
  }

  const { user, loading, token } = auth;

  // Add timeout to prevent infinite loading - if loading takes too long, redirect to auth
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        console.warn('ProtectedRoute: Loading timeout, redirecting to auth');
        setLoadingTimeout(true);
      }, 3000); // 3 second timeout
      return () => clearTimeout(timeout);
    } else {
      setLoadingTimeout(false);
    }
  }, [loading]);

  // If loading timeout or no token, redirect to auth immediately
  if (loadingTimeout || !token) {
    return <Navigate to="/auth" replace />;
  }

  // If loading and no token, show auth page immediately (don't wait)
  if (loading && !token) {
    return <Navigate to="/auth" replace />;
  }

  // If no token exists, immediately redirect to auth (don't wait for loading)
  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  // Only show loading for a short time - then redirect if still loading
  if (loading && token && !user) {
    // Show loading for max 2 seconds, then redirect
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        <Loader2 className="h-12 w-12 animate-spin text-teal-700" />
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
          (token && user && !loading) ? (
            <Navigate to={getDashboardPath(user.role)} replace />
          ) : <AuthPage />
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

      {/* Patient Dashboard - Full Access */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['patient', 'admin']}>
              <Dashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      
      {/* Pharmacy Onboarding */}
      <Route
        path="/pharmacy/onboarding"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['pharmacy', 'admin']}>
              <PharmacyOnboarding />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      
      {/* Pharmacy Pending Approval */}
      <Route
        path="/pharmacy/pending-approval"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['pharmacy', 'admin']}>
              <PharmacyPendingApproval />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      
      {/* Doctor Onboarding */}
      <Route
        path="/doctor/onboarding"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['doctor', 'admin']}>
              <DoctorOnboarding />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      
      {/* Doctor Pending Approval */}
      <Route
        path="/doctor/pending-approval"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['doctor', 'admin']}>
              <DoctorPendingApproval />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      
      {/* Pharmacy Dashboard - Medication Requests Only */}
      <Route
        path="/pharmacy-dashboard"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['pharmacy', 'admin']}>
              <PharmacyDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      
      {/* Doctor Dashboard - Telehealth Only */}
      <Route
        path="/doctor-dashboard"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['doctor', 'admin']}>
              <DoctorDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      
      {/* Admin Dashboard - Full Access */}
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      {/* Patient-only routes */}
      <Route
        path="/vitals"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['patient', 'admin']}>
              <VitalsPage />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/medications"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['patient', 'admin']}>
              <MedicationsPage />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['patient', 'doctor', 'admin']}>
              <AppointmentsPage />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat/:chatRoomId"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/video-call/:meetingId"
        element={
          <ProtectedRoute>
            <VideoCallPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/medication-request"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['patient', 'admin']}>
              <PharmacySelectionPage />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/medication-request/:requestId/chat"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['patient', 'admin']}>
              <MedicationRequestChatPage />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/medication-request"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['patient', 'admin']}>
              <PharmacySelectionPage />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacy/:id"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['patient', 'admin']}>
              <PharmacyPage />
            </RoleBasedRoute>
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
            <RoleBasedRoute allowedRoles={['patient', 'admin']}>
              <CaregiversPage />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/care-plans"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['patient', 'admin']}>
              <CarePlansPage />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/education"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['patient', 'admin']}>
              <EducationPage />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/telehealth"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['patient', 'doctor', 'admin']}>
              <TelehealthPage />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      {/* Patient Consultation Room */}
      <Route
        path="/patient-consultation-room"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['patient', 'admin']}>
              <PatientConsultationRoom />
            </RoleBasedRoute>
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
            <RoleBasedRoute allowedRoles={['patient', 'admin']}>
              <WellnessGuide />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['patient', 'admin']}>
              <DataVisualization />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/gamification"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['patient', 'admin']}>
              <GamificationPage />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-chat"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['patient', 'admin']}>
              <AIChat />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/devices"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['patient', 'admin']}>
              <DevicesPage />
            </RoleBasedRoute>
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
  // Disable service worker registration to prevent caching issues, especially on mobile
  useEffect(() => {
    // Unregister any existing service workers and clear caches
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister();
        });
      });
    }
    if ('caches' in window) {
      caches.keys().then((cacheNames) => {
        cacheNames.forEach((cacheName) => {
          caches.delete(cacheName);
        });
      });
    }
    
    // Service worker disabled to prevent caching issues, especially on mobile
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
