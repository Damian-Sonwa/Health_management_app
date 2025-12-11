import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Pill, 
  Home,
  FileText,
  CreditCard,
  Phone,
  MessageCircle,
  Settings,
  Bell,
  Menu,
  X,
  Search,
  Filter,
  LogOut,
  User,
  CheckCircle,
  XCircle,
  Video,
  Download,
  Eye,
  MapPin,
  Mail,
  Clock,
  Loader2,
  Send,
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import CallInterface from '@/components/pharmacy/CallInterface';
import LiveChat from '@/components/pharmacy/LiveChat';
import PaymentVerificationsPage from '@/components/pharmacy/PaymentVerificationsPage';
import CallChatCenterPage from '@/components/pharmacy/CallChatCenterPage';
import SettingsPage from '@/components/pharmacy/SettingsPage';
import { useAuth } from '@/components/AuthContext';
import { API_BASE_URL } from '@/config/api';
import { toast } from 'sonner';
import MedicalRequestsPage from '@/components/pharmacy/MedicalRequestsPage';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function PharmacyDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { socket, isConnected } = useRealtimeUpdates();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pharmacyStatus, setPharmacyStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);

  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'requests', label: 'Medical Requests', icon: FileText },
    { id: 'payments', label: 'Payment Verifications', icon: CreditCard },
    { id: 'call-chat', label: 'Call & Chat Center', icon: Phone },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Check onboarding and approval status - block dashboard access until approved
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const pharmacyId = user?.id || user?._id;
        if (!pharmacyId) return;

        const response = await fetch(`${API_BASE_URL}/pharmacies/${pharmacyId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success && data.data) {
          const pharmacy = data.data;
          setPharmacyStatus(pharmacy.status);
          
          // Block access if onboarding not completed
          if (!pharmacy.onboardingCompleted) {
            console.log('⚠️ Onboarding not completed, redirecting...');
            navigate('/pharmacy/onboarding', { replace: true });
            return;
          }
          
          // Block access if not approved
          if (pharmacy.status === 'pending') {
            console.log('⚠️ Account pending approval, redirecting...');
            navigate('/pharmacy/pending-approval', { replace: true });
            return;
          }
          
          if (pharmacy.status === 'rejected') {
            console.log('⚠️ Account rejected, redirecting...');
            navigate('/pharmacy/rejected', { replace: true });
            return;
          }
        } else {
          // If pharmacy record doesn't exist, redirect to onboarding
          console.log('⚠️ Pharmacy record not found, redirecting to onboarding...');
          navigate('/pharmacy/onboarding', { replace: true });
        }
      } catch (error) {
        console.error('Error checking pharmacy status:', error);
        navigate('/pharmacy/onboarding', { replace: true });
      }
    };

    if (user?.role === 'pharmacy') {
      checkAccess();
    }
  }, [user, navigate]);

  // Fetch notifications
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Socket.IO: Listen for new medication requests
  useEffect(() => {
    const pharmacyId = user?.id || user?._id;
    if (socket && isConnected && pharmacyId) {
      // Subscribe to pharmacy request notifications
      socket.emit('subscribe-pharmacy-requests', { pharmacyId });

      // Listen for new medication requests
      const handleNewRequest = (data: any) => {
        console.log('💊 PharmacyDashboard: New medication request received:', data);
        toast.success('New medication request received!');
        // Refresh notifications and trigger refresh for MedicalRequestsPage
        fetchNotifications();
        // Dispatch custom event to refresh requests list
        window.dispatchEvent(new Event('refreshRequests'));
      };

      socket.on('newPharmacyMedicationRequest', handleNewRequest);

      return () => {
        socket.off('newPharmacyMedicationRequest', handleNewRequest);
      };
    }
  }, [socket, isConnected, user]);

  // Determine active tab from URL
  useEffect(() => {
    const path = location.pathname;
    console.log('🔍 PharmacyDashboard: Path changed to:', path);
    if (path.includes('/requests')) {
      console.log('🔍 Setting activeTab to: requests');
      setActiveTab('requests');
    } else if (path.includes('/payments')) {
      console.log('🔍 Setting activeTab to: payments');
      setActiveTab('payments');
    } else if (path.includes('/call-chat')) {
      console.log('🔍 Setting activeTab to: call-chat');
      setActiveTab('call-chat');
    } else if (path.includes('/settings')) {
      console.log('🔍 Setting activeTab to: settings');
      setActiveTab('settings');
    } else {
      console.log('🔍 Setting activeTab to: dashboard');
      setActiveTab('dashboard');
    }
  }, [location.pathname]);
  
  // Debug: Log activeTab changes
  useEffect(() => {
    console.log('🔍 PharmacyDashboard: activeTab is now:', activeTab);
  }, [activeTab]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success || data.data) {
        const notifs = data.data || data.notifications || [];
        setNotifications(notifs);
        setUnreadCount(notifs.filter((n: Notification) => !n.isRead).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 w-full">
      <div className="flex h-screen overflow-hidden w-full">
        {/* Desktop Sidebar - Hidden on mobile */}
        <aside className={`
          hidden lg:flex
          ${sidebarOpen ? 'w-64' : 'w-20'} 
          bg-white border-r border-gray-200 
          transition-all duration-300 
          flex-col
          shadow-lg
        `}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <Pill className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Pharmacy</h2>
                  <p className="text-xs text-gray-500">Dashboard</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="ml-auto"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    console.log('🔍 Nav clicked:', item.id);
                    setActiveTab(item.id);
                    // Update URL without navigating (using replace to avoid adding to history)
                    window.history.replaceState(null, '', `/pharmacy-dashboard${item.id === 'dashboard' ? '' : `/${item.id}`}`);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                  {sidebarOpen && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t border-gray-200">
            <div className={`
              flex items-center gap-3 p-3 rounded-lg
              ${sidebarOpen ? 'bg-gray-50' : 'justify-center'}
            `}>
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-purple-600 text-white">
                  {user?.name?.charAt(0).toUpperCase() || 'P'}
                </AvatarFallback>
              </Avatar>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name || 'Pharmacy User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || ''}
                  </p>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden w-full min-w-0">
          {/* Top Header */}
          <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Mobile Menu Button */}
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild className="lg:hidden">
                    <Button variant="ghost" size="icon">
                      <Menu className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-64 p-0">
                    <div className="flex flex-col h-full">
                      {/* Mobile Sidebar Header */}
                      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                            <Pill className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h2 className="font-bold text-gray-900">Pharmacy</h2>
                            <p className="text-xs text-gray-500">Dashboard</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>

                      {/* Mobile Navigation */}
                      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {navItems.map((item) => {
                          const Icon = item.icon;
                          const isActive = activeTab === item.id;
                          
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                console.log('🔍 Mobile nav clicked:', item.id);
                                setActiveTab(item.id);
                                window.history.replaceState(null, '', `/pharmacy-dashboard${item.id === 'dashboard' ? '' : `/${item.id}`}`);
                                setMobileMenuOpen(false);
                              }}
                              className={`
                                w-full flex items-center gap-3 px-4 py-3 rounded-lg
                                transition-all duration-200
                                ${isActive 
                                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md' 
                                  : 'text-gray-700 hover:bg-gray-100'
                                }
                              `}
                            >
                              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                              <span className="font-medium">{item.label}</span>
                            </button>
                          );
                        })}
                      </nav>

                      {/* Mobile User Profile */}
                      <div className="p-4 border-t border-gray-200">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-purple-600 text-white">
                              {user?.name?.charAt(0).toUpperCase() || 'P'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {user?.name || 'Pharmacy User'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user?.email || ''}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            handleLogout();
                            setMobileMenuOpen(false);
                          }}
                          className="w-full mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {navItems.find(item => item.id === activeTab)?.label || 'Pharmacy Dashboard'}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 hidden sm:block">
                    Welcome back, {user?.name || 'Pharmacy'}
                  </p>
                </div>
              </div>
              
              {/* Notification Bell */}
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative"
                  >
                    <Bell className="w-5 h-5 text-gray-600" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Button>
                  
                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Mark all as read
                            notifications.forEach(n => {
                              if (!n.isRead) markNotificationAsRead(n._id);
                            });
                          }}
                        >
                          Mark all read
                        </Button>
                      </div>
                      <div className="divide-y">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-gray-500">
                            <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <p>No notifications</p>
                          </div>
                        ) : (
                          notifications.slice(0, 10).map((notification) => (
                            <div
                              key={notification._id}
                              className={`p-4 hover:bg-gray-50 cursor-pointer ${
                                !notification.isRead ? 'bg-blue-50' : ''
                              }`}
                              onClick={() => {
                                if (!notification.isRead) {
                                  markNotificationAsRead(notification._id);
                                }
                                setShowNotifications(false);
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-2 ${
                                  !notification.isRead ? 'bg-blue-600' : 'bg-transparent'
                                }`} />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 text-sm">
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-2">
                                    {new Date(notification.createdAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-purple-600 text-white">
                    {user?.name?.charAt(0).toUpperCase() || 'P'}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 min-h-0">
            {/* Pharmacy Approval Status Banner */}
            {pharmacyStatus === 'pending' && (
              <Card className="mb-4 sm:mb-6 border-l-4 border-l-yellow-500 bg-yellow-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-yellow-900 mb-1">Account Pending Approval</h3>
                      <p className="text-sm text-yellow-800">
                        Your pharmacy registration is pending admin approval. You can view your dashboard, but you won't receive medication requests from patients until your account is approved.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {pharmacyStatus === 'rejected' && (
              <Card className="mb-4 sm:mb-6 border-l-4 border-l-red-500 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-red-900 mb-1">Registration Rejected</h3>
                      <p className="text-sm text-red-800">
                        Your pharmacy registration has been rejected. Please contact support for more information.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Dashboard Home View */}
            {activeTab === 'dashboard' && (
              <div className="space-y-4 sm:space-y-6 w-full">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
                  <p className="text-gray-600 text-sm">Quick stats and recent activity</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <Card className="border-l-4 border-l-yellow-500">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Pending Requests</p>
                          <p className="text-3xl font-bold text-yellow-600">0</p>
                        </div>
                        <FileText className="w-12 h-12 text-yellow-500 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Awaiting Payment</p>
                          <p className="text-3xl font-bold text-blue-600">0</p>
                        </div>
                        <CreditCard className="w-12 h-12 text-blue-500 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-green-500">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Completed</p>
                          <p className="text-3xl font-bold text-green-600">0</p>
                        </div>
                        <Pill className="w-12 h-12 text-green-500 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Total Requests</p>
                          <p className="text-3xl font-bold text-purple-600">0</p>
                        </div>
                        <FileText className="w-12 h-12 text-purple-500 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        onClick={() => {
                          setActiveTab('requests');
                          window.history.replaceState(null, '', '/pharmacy-dashboard/requests');
                        }}
                        className="h-24 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        <FileText className="w-6 h-6" />
                        <span>View Requests</span>
                      </Button>
                      <Button
                        onClick={() => {
                          setActiveTab('payments');
                          window.history.replaceState(null, '', '/pharmacy-dashboard/payments');
                        }}
                        variant="outline"
                        className="h-24 flex flex-col items-center justify-center gap-2"
                      >
                        <CreditCard className="w-6 h-6" />
                        <span>Verify Payments</span>
                      </Button>
                      <Button
                        onClick={() => {
                          setActiveTab('call-chat');
                          window.history.replaceState(null, '', '/pharmacy-dashboard/call-chat');
                        }}
                        variant="outline"
                        className="h-24 flex flex-col items-center justify-center gap-2"
                      >
                        <Phone className="w-6 h-6" />
                        <span>Call & Chat</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Medical Requests Page */}
            {activeTab === 'requests' && (
              <ErrorBoundary>
                <MedicalRequestsPage
                  onViewRequest={(request) => {
                    // Store selected request and show details
                    setSelectedRequest(request);
                    setShowRequestDetails(true);
                  }}
                />
              </ErrorBoundary>
            )}

            {activeTab === 'payments' && (
              <ErrorBoundary>
                <PaymentVerificationsPage />
              </ErrorBoundary>
            )}

            {activeTab === 'call-chat' && (
              <ErrorBoundary>
                <CallChatCenterPage />
              </ErrorBoundary>
            )}

            {activeTab === 'settings' && (
              <ErrorBoundary>
                <SettingsPage />
              </ErrorBoundary>
            )}

            {/* Fallback - if no tab matches */}
            {!['dashboard', 'requests', 'payments', 'call-chat', 'settings'].includes(activeTab) && (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Page not found</p>
                  <p className="text-sm text-gray-500 mt-2">Active tab: {activeTab}</p>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* Request Details Dialog */}
      <Dialog open={showRequestDetails} onOpenChange={setShowRequestDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <RequestDetailsView
              request={selectedRequest}
              onClose={() => {
                setShowRequestDetails(false);
                setSelectedRequest(null);
              }}
              onUpdate={() => {
                // Refresh requests list
                if (activeTab === 'requests') {
                  // Trigger refresh in MedicalRequestsPage
                  window.dispatchEvent(new Event('refreshRequests'));
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Request Details Component
interface RequestDetailsViewProps {
  request: any;
  onClose: () => void;
  onUpdate: () => void;
}

function RequestDetailsView({ request, onClose, onUpdate }: RequestDetailsViewProps) {
  const { user } = useAuth();
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleConfirmRequest = async () => {
    try {
      setProcessing(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/pharmacy/medical-request/${request._id}/confirm`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          notes: 'Request confirmed by pharmacy'
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Prescription confirmed successfully!');
        onUpdate();
        onClose();
      } else {
        throw new Error(data.message || 'Failed to confirm request');
      }
    } catch (error: any) {
      toast.error('Failed to confirm request: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!declineReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      setProcessing(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/pharmacy/medical-request/${request._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reason: declineReason,
          message: 'Your medication request has been rejected'
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Request rejected successfully');
        setShowDeclineDialog(false);
        setDeclineReason('');
        onUpdate();
        onClose();
      } else {
        throw new Error(data.message || 'Failed to reject request');
      }
    } catch (error: any) {
      toast.error('Failed to reject request: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleCallPatient = async () => {
    setIsCallActive(true);
  };

  const handleVideoCall = async () => {
    setIsVideoActive(true);
  };

  const handleVerifyPayment = async () => {
    try {
      setProcessing(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/pharmacy/medical-request/${request._id}/verify-payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          notes: 'Payment verified by pharmacy'
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Payment verified successfully!');
        onUpdate();
        onClose();
      } else {
        throw new Error(data.message || 'Failed to verify payment');
      }
    } catch (error: any) {
      toast.error('Failed to verify payment: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'awaiting-payment':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <Badge className={`${getStatusColor(request.status)} text-sm px-3 py-1`}>
          {request.status.replace(/-/g, ' ').toUpperCase()}
        </Badge>
        <p className="text-sm text-gray-500">
          Request #{request.requestId || request._id.slice(-8)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Prescription Image */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Prescription
              </CardTitle>
            </CardHeader>
            <CardContent>
              {request.prescriptionFileURL ? (
                <div className="space-y-4">
                  <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                    {request.prescriptionFileURL.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <img
                        src={request.prescriptionFileURL}
                        alt="Prescription"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50">
                        <div className="text-center">
                          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Prescription File</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => window.open(request.prescriptionFileURL, '_blank')}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Full Size
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = request.prescriptionFileURL;
                        link.download = 'prescription.pdf';
                        link.click();
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No prescription file available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-medium">{request.patientInfo?.name || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-medium">{request.patientInfo?.phone || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium">{request.patientInfo?.email || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Delivery Address</p>
                    <p className="font-medium">
                      {request.deliveryAddress
                        ? `${request.deliveryAddress.street}, ${request.deliveryAddress.city}, ${request.deliveryAddress.state} ${request.deliveryAddress.zipCode}`
                        : request.patientInfo?.address
                        ? `${request.patientInfo.address.street}, ${request.patientInfo.address.city}, ${request.patientInfo.address.state}`
                        : 'N/A'}
                    </p>
                    {request.patientInfo?.deliveryNotes && (
                      <p className="text-sm text-gray-600 mt-2 italic">
                        Notes: {request.patientInfo.deliveryNotes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Submitted</p>
                    <p className="font-medium">
                      {new Date(request.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Payment Receipt Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-600" />
                Payment Receipt
              </CardTitle>
            </CardHeader>
            <CardContent>
              {request.paymentReceiptURL ? (
                <div className="space-y-4">
                  <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                    {request.paymentReceiptURL.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <img
                        src={request.paymentReceiptURL}
                        alt="Payment Receipt"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50">
                        <FileText className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => window.open(request.paymentReceiptURL, '_blank')}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Receipt
                    </Button>
                    {request.status === 'awaiting-payment' && (
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={handleVerifyPayment}
                        disabled={processing}
                      >
                        {processing ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        Verify Payment
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-orange-50 rounded-lg border border-orange-200">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 text-orange-400" />
                  <p className="text-sm font-medium text-orange-800">Awaiting Patient Receipt Upload</p>
                  <p className="text-xs text-orange-600 mt-1">
                    Patient will upload payment receipt after confirmation
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {request.status === 'pending' && (
                <>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handleConfirmRequest}
                    disabled={processing}
                  >
                    {processing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Confirm Request
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setShowDeclineDialog(true)}
                    disabled={processing}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Request
                  </Button>
                </>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleCallPatient}
                  disabled={!request.patientInfo?.phone}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Patient
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleVideoCall}
                  disabled={!request.patientInfo?.phone}
                >
                  <Video className="w-4 h-4 mr-2" />
                  Video Call
                </Button>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowChat(true)}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Live Chat
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  // Request clearer photo - send message to patient
                  toast.info('Feature: Request clearer photo - will send message to patient');
                }}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Request Clearer Photo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Decline Dialog */}
      <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="decline-reason">Reason for Rejection *</Label>
              <Textarea
                id="decline-reason"
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="e.g., Prescription unclear, medication out of stock, invalid prescription..."
                rows={4}
                required
              />
            </div>
            <DialogFooter>
              <Button
                variant="destructive"
                onClick={handleRejectRequest}
                disabled={processing || !declineReason.trim()}
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4 mr-2" />
                )}
                Confirm Rejection
              </Button>
              <Button variant="outline" onClick={() => setShowDeclineDialog(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat Dialog */}
      {showChat && (
        <Dialog open={showChat} onOpenChange={setShowChat}>
          <DialogContent className="max-w-2xl h-[600px] p-0 flex flex-col">
            <LiveChat
              requestId={request._id}
              patientId={request.userId || request.patientId}
              patientName={request.patientInfo?.name || 'Patient'}
              onClose={() => setShowChat(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Call UI */}
      {isCallActive && (
        <Dialog open={isCallActive} onOpenChange={setIsCallActive}>
          <DialogContent className="max-w-2xl p-0">
            <CallInterface
              requestId={request._id}
              patientId={request.userId || request.patientId}
              patientName={request.patientInfo?.name || 'Patient'}
              patientPhone={request.patientInfo?.phone || ''}
              onEndCall={() => setIsCallActive(false)}
              callType="phone"
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Video Call UI */}
      {isVideoActive && (
        <Dialog open={isVideoActive} onOpenChange={setIsVideoActive}>
          <DialogContent className="max-w-4xl p-0 bg-black">
            <CallInterface
              requestId={request._id}
              patientId={request.userId || request.patientId}
              patientName={request.patientInfo?.name || 'Patient'}
              patientPhone={request.patientInfo?.phone || ''}
              onEndCall={() => setIsVideoActive(false)}
              callType="video"
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
