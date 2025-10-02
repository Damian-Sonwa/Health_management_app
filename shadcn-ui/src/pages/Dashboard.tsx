import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Activity, 
  Pill, 
  Calendar, 
  FileText, 
  Users, 
  Settings, 
  Bell,
  Menu,
  X,
  Home,
  BarChart3,
  Stethoscope,
  Shield,
  CreditCard,
  BookOpen,
  Phone,
  User
} from 'lucide-react';

// Import components
import PatientProfile from '@/components/PatientProfile';
import VitalsTracking from '@/components/VitalsTracking';
import MedicationManagement from '@/components/MedicationManagement';
import DeviceIntegration from '@/components/DeviceIntegration';
import DataVisualization from '@/components/DataVisualization';
import CarePlans from '@/components/CarePlans';
import WellnessGuide from '@/components/WellnessGuide';
import Telehealth from '@/components/Telehealth';
import CaregiversModal from '@/components/CaregiversModal';
import EducationModal from '@/components/EducationModal';
import SettingsModal from '@/components/SettingsModal';
import SecurityModal from '@/components/SecurityModal';
import SubscriptionModal from '@/components/SubscriptionModal';
import HealthDashboard from './HealthDashboard';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCaregiversModalOpen, setIsCaregiversModalOpen] = useState(false);
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Health Dashboard', icon: Home },
    { id: 'profile', label: 'Patient Profile', icon: User },
    { id: 'vitals', label: 'Vital Log', icon: Activity },
    { id: 'medications', label: 'Medications', icon: Pill },
    { id: 'devices', label: 'Device Integration', icon: Stethoscope },
    { id: 'analytics', label: 'Data Visualization', icon: BarChart3 },
    { id: 'care-plans', label: 'Care Plans', icon: FileText },
    { id: 'wellness', label: 'Wellness Guide', icon: Heart },
    { id: 'telehealth', label: 'Telehealth', icon: Phone },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <HealthDashboard />;
      case 'profile':
        return <PatientProfile />;
      case 'vitals':
        return <VitalsTracking />;
      case 'medications':
        return <MedicationManagement />;
      case 'devices':
        return <DeviceIntegration />;
      case 'analytics':
        return <DataVisualization />;
      case 'care-plans':
        return <CarePlans />;
      case 'wellness':
        return <WellnessGuide />;
      case 'telehealth':
        return <Telehealth />;
      default:
        return <HealthDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header with Medical Device Image */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-green-600">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/20 backdrop-blur-sm border border-white/30">
                <img 
                  src="/images/medical-device-header.jpg" 
                  alt="Medical Device" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">HealthCare</h1>
                <p className="text-xs text-blue-100">Dashboard</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="px-3 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "secondary" : "ghost"}
                    className={`w-full justify-start text-left ${
                      activeTab === item.id 
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsSidebarOpen(false);
                    }}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
            </div>

            {/* Additional Menu Items */}
            <div className="px-3 mt-6">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Account & Settings
              </div>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsCaregiversModalOpen(true)}
                >
                  <Users className="mr-3 h-4 w-4" />
                  Care Team & Family
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsEducationModalOpen(true)}
                >
                  <BookOpen className="mr-3 h-4 w-4" />
                  Health Education
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsSubscriptionModalOpen(true)}
                >
                  <CreditCard className="mr-3 h-4 w-4" />
                  Subscription
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsSettingsModalOpen(true)}
                >
                  <Settings className="mr-3 h-4 w-4" />
                  Settings
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsSecurityModalOpen(true)}
                >
                  <Shield className="mr-3 h-4 w-4" />
                  Security & Privacy
                </Button>
              </div>
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Heart className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-900">Health Score</p>
                    <p className="text-lg font-bold text-green-600">87%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">HealthCare Dashboard</h1>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Modals */}
      <CaregiversModal 
        isOpen={isCaregiversModalOpen} 
        onClose={() => setIsCaregiversModalOpen(false)} 
      />
      <EducationModal 
        isOpen={isEducationModalOpen} 
        onClose={() => setIsEducationModalOpen(false)} 
      />
      <SettingsModal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)} 
      />
      <SecurityModal 
        isOpen={isSecurityModalOpen} 
        onClose={() => setIsSecurityModalOpen(false)} 
      />
      <SubscriptionModal 
        isOpen={isSubscriptionModalOpen} 
        onClose={() => setIsSubscriptionModalOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;