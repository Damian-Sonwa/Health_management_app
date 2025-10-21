import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider, useAuth } from '@/components/AuthContext';
import Layout from '@/components/Layout';
import AuthPage from '@/components/AuthPage';
import ErrorBoundary from '@/components/ErrorBoundary';
import Dashboard from '@/pages/Dashboard';
import VitalsPage from '@/pages/VitalsPage';
import MedicationsPage from '@/pages/MedicationsPage';
import AppointmentsPage from '@/pages/AppointmentsPage';
import ProfilePage from '@/pages/ProfilePage';
import MedicationRequestPage from '@/pages/MedicationRequestPage';
import UpgradePage from '@/pages/UpgradePage';
import CaregiversPage from '@/pages/CaregiversPage';
import CarePlansPage from '@/pages/CarePlansPage';
import EducationPage from '@/pages/EducationPage';
import TelehealthPage from '@/pages/TelehealthPage';
import SettingsPage from '@/pages/SettingsPage';
import TestSignup from '@/pages/TestSignup';
import WellnessGuide from '@/components/WellnessGuide';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your health dashboard...</p>
        </div>
      </div>
    );
  }
  
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
  const { user } = useAuth();

  return (
    <Routes>
      <Route 
        path="/auth" 
        element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />} 
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
            <UpgradePage />
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
      <Route path="/test-signup" element={<TestSignup />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen">
            <AppRoutes />
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;