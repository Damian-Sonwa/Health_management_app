import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { 
  Home,
  Activity,
  Pill,
  Calendar,
  User,
  Crown,
  Heart,
  FileText,
  Menu,
  LogOut,
  Settings,
  Bell,
  Search,
  Moon,
  Sun,
  Trophy,
  Sparkles,
  Smartphone,
  BarChart3,
  Eye,
  EyeOff,
  MessageCircle,
  ChevronDown,
  ChevronRight,
  Users,
  LayoutDashboard,
  BookOpen,
  TrendingUp
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/components/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import GlobalSearch from '@/components/GlobalSearch';
import AdSenseBanner from '@/components/AdSenseBanner';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin, isPatient, isPharmacy, isDoctor, featurePreviewEnabled, toggleFeaturePreview } = useAuth();
  const { unreadCount } = useNotifications();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUpgradeBanner] = useState(false); // Set to false to hide upgrade banner
  const [trialDays] = useState(0); // Set to 0 since we're not using trial functionality
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    dashboard: false,
    services: false,
    learning: false,
    analytics: false,
    settings: false
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setIsDarkMode(savedDarkMode === 'true');
    }
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  // Define navigation items grouped by section
  interface NavItem {
    name: string;
    nameKey: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    roles: string[];
  }

  interface NavSection {
    id: string;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    items: NavItem[];
    roles: string[]; // Roles that can see this section
  }

  const navigationSections: NavSection[] = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['patient', 'pharmacy', 'doctor', 'admin'],
      items: [
    { name: t('dashboard.title'), nameKey: 'Dashboard', href: '/dashboard', icon: Home, roles: ['patient', 'admin'] },
    { name: 'Pharmacy Dashboard', nameKey: 'Pharmacy Dashboard', href: '/pharmacy-dashboard', icon: Pill, roles: ['pharmacy', 'admin'] },
    { name: 'Doctor Dashboard', nameKey: 'Doctor Dashboard', href: '/doctor-dashboard', icon: Calendar, roles: ['doctor', 'admin'] },
    { name: 'Admin Dashboard', nameKey: 'Admin Dashboard', href: '/admin-dashboard', icon: Settings, roles: ['admin'] },
      ]
    },
    {
      id: 'services',
      name: 'Services',
      icon: Pill,
      roles: ['patient', 'admin'],
      items: [
    { name: t('vitals.title'), nameKey: 'Vitals', href: '/vitals', icon: Activity, roles: ['patient', 'admin'] },
    { name: t('medications.title'), nameKey: 'Medications', href: '/medications', icon: Pill, roles: ['patient', 'admin'] },
        { name: 'Medication Request', nameKey: 'Medication Request', href: '/medication-request', icon: FileText, roles: ['patient', 'admin'] },
        // REMOVED: Chat Center - chat functionality removed, use phone/video/email instead
        { name: 'Consultation Room', nameKey: 'Consultation Room', href: '/patient-consultation-room', icon: Calendar, roles: ['patient', 'admin'] },
    { name: t('devices.title'), nameKey: 'Devices', href: '/devices', icon: Smartphone, roles: ['patient', 'admin'] },
    { name: t('caregivers.title'), nameKey: 'Caregivers', href: '/caregivers', icon: User, roles: ['patient', 'admin'] },
    { name: t('carePlans.title'), nameKey: 'Care Plans', href: '/care-plans', icon: FileText, roles: ['patient', 'admin'] },
      ]
    },
    {
      id: 'learning',
      name: 'Learning & Resources',
      icon: BookOpen,
      roles: ['patient', 'admin'],
      items: [
    { name: 'Education', nameKey: 'Education', href: '/education', icon: FileText, roles: ['patient', 'admin'] },
    { name: t('wellness.title'), nameKey: 'Wellness Guide', href: '/wellness', icon: Heart, roles: ['patient', 'admin'] },
        { name: 'AI Health Coach', nameKey: 'AI Health Coach', href: '/ai-chat', icon: Sparkles, roles: ['patient', 'admin'] },
        { name: 'Gamification', nameKey: 'Gamification', href: '/gamification', icon: Trophy, roles: ['patient', 'admin'] },
      ]
    },
    {
      id: 'analytics',
      name: 'Reports & Analytics',
      icon: TrendingUp,
      roles: ['patient', 'admin'],
      items: [
        { name: 'Analytics', nameKey: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['patient', 'admin'] },
      ]
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: Settings,
      roles: ['patient', 'pharmacy', 'doctor', 'admin'],
      items: [
        { name: t('profile.title'), nameKey: 'Profile', href: '/profile', icon: User, roles: ['patient', 'pharmacy', 'doctor', 'admin'] },
    { name: t('settings.title'), nameKey: 'Settings', href: '/settings', icon: Settings, roles: ['patient', 'pharmacy', 'doctor', 'admin'] },
      ]
    }
  ];

  // For backward compatibility - keep all navigation items in flat structure for filtering
  const allNavigationItems: NavItem[] = navigationSections.flatMap(section => section.items);

  // Filter sections and items based on user role
  const getVisibleSections = (): NavSection[] => {
    if (!user?.role) return [];
    
    return navigationSections
      .filter(section => section.roles.includes(user.role))
      .map(section => ({
        ...section,
        items: section.items.filter(item => item.roles.includes(user.role))
      }))
      .filter(section => section.items.length > 0);
  };

  const visibleSections = getVisibleSections();

  // For admin: only show dashboard section
  const displaySections = user?.role === 'admin' 
    ? visibleSections.filter(section => section.id === 'dashboard')
    : visibleSections;

  // Toggle section collapse
  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleSignOut = async () => {
    logout();
    navigate('/auth');
  };

  const isActive = (href: string) => location.pathname === href;
  
  // Hide Layout sidebar for pharmacy dashboard (it has its own sidebar)
  const isPharmacyDashboard = location.pathname.startsWith('/pharmacy-dashboard');
  const isDoctorDashboard = location.pathname.startsWith('/doctor-dashboard');
  const isAdminDashboard = location.pathname.startsWith('/admin-dashboard');
  const isOnboarding = location.pathname.includes('/onboarding') || location.pathname.includes('/pending-approval');
  const hideLayoutSidebar = isPharmacyDashboard || isDoctorDashboard || isAdminDashboard || isOnboarding;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-green-50/80 via-blue-50/80 to-purple-50/80'
    }`}>
      {/* Desktop Sidebar - Hidden for pharmacy, doctor, and admin dashboards */}
      {!hideLayoutSidebar && (
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className={`flex min-h-0 flex-1 flex-col shadow-xl transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-gradient-to-b from-gray-800 via-gray-800/95 to-gray-900' 
            : 'bg-gradient-to-b from-green-50 via-blue-50/90 to-purple-50/80 backdrop-blur-sm'
        }`}>
          {/* Brand */}
          <div className="flex h-24 flex-shrink-0 items-center justify-center gap-3 px-4 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 shadow-lg shadow-blue-500/30">
            <img 
              src="/heart-droplet-logo.svg" 
              alt="Nuviacare Logo" 
              className="h-10 w-10 object-contain"
            />
            <h1 className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              NuviaCare
            </h1>
          </div>

          {/* Navigation */}
          <div className="flex flex-1 flex-col overflow-y-auto">
            <nav className="flex-1 space-y-1 px-2 py-4">
              {displaySections.map((section) => {
                const SectionIcon = section.icon;
                const isCollapsed = collapsedSections[section.id];
                const hasActiveItem = section.items.some(item => isActive(item.href));
                
                return (
                  <div key={section.id} className="space-y-1">
                    {/* Section Header */}
                    {section.items.length > 1 ? (
                      <button
                        onClick={() => toggleSection(section.id)}
                        className={`w-full flex items-center justify-between px-2 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors ${
                          hasActiveItem
                            ? isDarkMode ? 'text-blue-400' : 'text-blue-600'
                            : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        } ${isDarkMode ? 'hover:text-gray-300' : 'hover:text-gray-700'}`}
                      >
                        <div className="flex items-center">
                          <SectionIcon className="mr-2 h-4 w-4" />
                          {!isSidebarCollapsed && <span>{section.name}</span>}
                        </div>
                        {!isSidebarCollapsed && (
                          isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    ) : null}
                    
                    {/* Section Items */}
                    {(!isCollapsed || section.items.length === 1) && section.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          className={`group flex items-center px-2 py-2 ${section.items.length > 1 ? 'ml-4' : ''} text-sm font-medium rounded-lg transition-all duration-300 transform hover:-translate-x-1 ${
                            isActive(item.href)
                              ? 'bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30'
                              : isDarkMode 
                                ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white hover:shadow-md hover:bg-gradient-to-r hover:from-green-500/20 hover:via-blue-500/20 hover:to-purple-500/20'
                                : 'text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:via-blue-50 hover:to-purple-50 hover:text-blue-700 hover:shadow-md'
                          }`}
                        >
                          <Icon
                            className={`mr-3 h-5 w-5 transition-colors ${
                              isActive(item.href) 
                                ? 'text-white' 
                                : isDarkMode 
                                  ? 'text-gray-400 group-hover:text-gray-300'
                                  : 'text-gray-400 group-hover:text-gray-500'
                            }`}
                          />
                          {!isSidebarCollapsed && <span>{item.name}</span>}
                        </Link>
                      );
                    })}
                  </div>
                );
              })}
            </nav>

            {/* Upgrade Banner */}
            {showUpgradeBanner && (
              <div className="mx-2 mb-4 p-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
                <div className="flex items-center">
                  <Crown className="h-5 w-5 text-white mr-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      {trialDays > 0 ? `${trialDays} days left` : 'Trial expired'}
                    </p>
                    <p className="text-xs text-white opacity-90">Upgrade to Premium</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full mt-2 bg-white text-orange-600 hover:bg-gray-100"
                  onClick={() => navigate('/upgrade')}
                >
                  Upgrade Now
                </Button>
              </div>
            )}

            {/* Upgrade to Premium Button - Only for patients */}
            {isPatient && (
            <div className="px-2 pb-2">
              <Button
                onClick={() => navigate('/subscription')}
                className="w-full justify-center bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50"
              >
                <Crown className="mr-2 h-5 w-5" />
                Upgrade to Premium
              </Button>
            </div>
            )}

            {/* Sign Out Button */}
            <div className={`border-t px-2 py-4 transition-colors duration-300 ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <Button
                onClick={handleSignOut}
                className={`w-full justify-start text-left font-medium transition-all duration-300 transform hover:-translate-x-1 ${
                  isDarkMode
                    ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40 hover:text-red-300'
                    : 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700'
                }`}
                variant="ghost"
              >
                <LogOut className="mr-3 h-5 w-5" />
                {t('auth.logout')}
              </Button>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Mobile menu - Hidden for pharmacy, doctor, and admin dashboards */}
      {!hideLayoutSidebar && (
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <div className="lg:hidden">
          {/* Mobile header */}
          <div className={`flex items-center justify-between h-16 px-4 shadow-sm transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center gap-2">
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <img 
                src="/heart-droplet-logo.svg" 
                alt="Nuviacare Logo" 
                className="h-8 w-8 object-contain"
              />
              <h1 className="text-xl font-black text-gray-800 dark:text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                NuviaCare
              </h1>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Dark Mode Toggle - Mobile */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleDarkMode}
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/dashboard#notifications')}
                className="relative hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                title="View Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-sm shadow-blue-500/30">
                    <span className="text-xs text-white font-medium">
                      {(user?.name || 'User')?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  {isPatient && (
                    <DropdownMenuItem onClick={() => navigate('/subscription')}>
                      <Crown className="mr-2 h-4 w-4" />
                      Upgrade to Premium
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('auth.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <SheetContent side="left" className={`w-64 p-0 transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-gradient-to-b from-gray-800 via-gray-800/95 to-gray-900' 
            : 'bg-gradient-to-b from-green-50 via-blue-50/90 to-purple-50/80'
        }`}>
          <div className="flex h-24 items-center justify-center px-4 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 shadow-lg shadow-blue-500/30">
            <h1 className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              NuviaCare
            </h1>
          </div>
          
          <nav className="flex-1 space-y-1 px-2 py-4">
            {displaySections.map((section) => {
              const SectionIcon = section.icon;
              const isCollapsed = collapsedSections[section.id];
              
              return (
                <div key={section.id} className="space-y-1">
                  {/* Section Header */}
                  {section.items.length > 1 || section.id !== 'dashboard' ? (
                    <button
                      onClick={() => toggleSection(section.id)}
                      className={`w-full flex items-center justify-between px-2 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors ${
                        isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <div className="flex items-center">
                        <SectionIcon className="mr-2 h-4 w-4" />
                        <span>{section.name}</span>
                      </div>
                      {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  ) : null}
                  
                  {/* Section Items */}
                  {(!isCollapsed || section.items.length === 1) && section.items.map((item) => {
                    const Icon = item.icon;
              return (
                <Link
                        key={item.href}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                        className={`group flex items-center px-2 py-2 ${section.items.length > 1 ? 'ml-4' : ''} text-sm font-medium rounded-lg transition-all duration-300 transform hover:-translate-x-1 ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30'
                      : isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white hover:bg-gradient-to-r hover:from-green-500/20 hover:via-blue-500/20 hover:to-purple-500/20'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:via-blue-50 hover:to-purple-50 hover:text-blue-700'
                  }`}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 ${
                      isActive(item.href) 
                        ? 'text-white' 
                        : isDarkMode 
                          ? 'text-gray-400 group-hover:text-gray-300'
                          : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
                    );
                  })}
                </div>
              );
            })}
          </nav>

          {showUpgradeBanner && (
            <div className="mx-2 mb-4 p-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
              <div className="flex items-center">
                <Crown className="h-5 w-5 text-white mr-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">
                    {trialDays > 0 ? `${trialDays} days left` : 'Trial expired'}
                  </p>
                  <p className="text-xs text-white opacity-90">Upgrade to Premium</p>
                </div>
              </div>
              <Button
                size="sm"
                className="w-full mt-2 bg-white text-orange-600 hover:bg-gray-100"
                onClick={() => {
                  navigate('/upgrade');
                  setIsMobileMenuOpen(false);
                }}
              >
                Upgrade Now
              </Button>
            </div>
          )}

          {/* Upgrade to Premium Button - Mobile - Only for patients */}
          {isPatient && (
            <div className="px-2 pb-2 mt-auto">
              <Button
                onClick={() => {
                  navigate('/subscription');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full justify-center bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50"
              >
                <Crown className="mr-2 h-5 w-5" />
                Upgrade to Premium
              </Button>
            </div>
          )}

          {/* Sign Out Button - Mobile */}
          <div className={`border-t px-2 py-4 transition-colors duration-300 ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <Button
              onClick={handleSignOut}
              className={`w-full justify-start text-left font-medium transition-all duration-300 transform hover:-translate-x-1 ${
                isDarkMode
                  ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40 hover:text-red-300'
                  : 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700'
              }`}
              variant="ghost"
            >
              <LogOut className="mr-3 h-5 w-5" />
              {t('auth.logout')}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      )}

      {/* Desktop Header - Hidden for pharmacy, doctor, and admin dashboards */}
      {!hideLayoutSidebar && (
      <div className="hidden lg:flex lg:pl-64">
        <div className={`flex flex-1 items-center justify-between h-16 px-6 shadow-sm transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex-1 flex items-center">
            <div className="max-w-lg w-full lg:max-w-xs">
              <GlobalSearch isDarkMode={isDarkMode} />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Premium Button - Prominent - Only for patients */}
            {isPatient && (
              <Button 
                onClick={() => navigate('/subscription')}
                className="hidden md:flex items-center bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                size="sm"
              >
                <Crown className="h-4 w-4 mr-2" />
                Premium
              </Button>
            )}

            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleDarkMode}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/dashboard#notifications')}
              className="relative hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              title="View Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <div className="relative">
                    <Avatar className="w-8 h-8 border-2 border-blue-500 dark:border-blue-400">
                      <AvatarImage 
                        src={user?.profile?.profilePicture || user?.avatar_url} 
                        alt={user?.name || 'User'} 
                      />
                      <AvatarFallback className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white text-sm font-medium">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {/* Live indicator */}
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full animate-pulse"></span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className={`text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>{user?.name || 'User'}</p>
                    <p className={`text-xs transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>{user?.email || 'user@example.com'}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                {isPatient && (
                  <DropdownMenuItem onClick={() => navigate('/subscription')}>
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade to Premium
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('auth.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      )}

      {/* Main content */}
      <div className={hideLayoutSidebar ? '' : 'lg:pl-64'}>
        <main className="flex-1 p-4 sm:p-6 pb-12">
  {children}
</main>
        
       {/* AdSense Banner - Fixed at bottom */}
<div className={`fixed bottom-0 left-0 ${hideLayoutSidebar ? '' : 'lg:left-64'} right-0 z-40 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700`}>
  <div className="max-w-7xl mx-auto px-2" style={{ height: '30px' }}>
    <AdSenseBanner />
  </div>
</div>
</div>
</div>
  );
};

export default Layout;
