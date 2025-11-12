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
  EyeOff
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
  const { user, logout, isAdmin, featurePreviewEnabled, toggleFeaturePreview } = useAuth();
  const { unreadCount } = useNotifications();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUpgradeBanner] = useState(false); // Set to false to hide upgrade banner
  const [trialDays] = useState(0); // Set to 0 since we're not using trial functionality
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  const navigationItems = [
    { name: t('dashboard.title'), nameKey: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Gamification', nameKey: 'Gamification', href: '/gamification', icon: Trophy },
    { name: 'AI Health Coach', nameKey: 'AI Health Coach', href: '/ai-chat', icon: Sparkles },
    { name: 'Analytics', nameKey: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: t('vitals.title'), nameKey: 'Vitals', href: '/vitals', icon: Activity },
    { name: t('medications.title'), nameKey: 'Medications', href: '/medications', icon: Pill },
    { name: t('devices.title'), nameKey: 'Devices', href: '/devices', icon: Smartphone },
    { name: 'Medication Request', nameKey: 'Medication Request', href: '/medication-request', icon: FileText },
    { name: t('caregivers.title'), nameKey: 'Caregivers', href: '/caregivers', icon: User },
    { name: t('carePlans.title'), nameKey: 'Care Plans', href: '/care-plans', icon: FileText },
    { name: 'Education', nameKey: 'Education', href: '/education', icon: FileText },
    { name: t('telehealth.title'), nameKey: 'Telehealth', href: '/telehealth', icon: Calendar },
    { name: t('wellness.title'), nameKey: 'Wellness Guide', href: '/wellness', icon: Heart },
    { name: t('settings.title'), nameKey: 'Settings', href: '/settings', icon: Settings },
    { name: t('profile.title'), nameKey: 'Profile', href: '/profile', icon: User },
  ];

  const handleSignOut = async () => {
    logout();
    navigate('/auth');
  };

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50'
    }`}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className={`flex min-h-0 flex-1 flex-col shadow-xl transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* Brand */}
          <div className="flex h-24 flex-shrink-0 items-center justify-center px-4 bg-gradient-to-r from-teal-600 to-cyan-600 shadow-lg shadow-teal-500/30">
            <h1 className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              NuviaCare
            </h1>
          </div>

          {/* Navigation */}
          <div className="flex flex-1 flex-col overflow-y-auto">
            <nav className="flex-1 space-y-1 px-2 py-4">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md transition-all duration-300 transform hover:-translate-x-1 ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30'
                        : isDarkMode 
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white hover:shadow-md'
                          : 'text-gray-600 hover:bg-teal-50 hover:text-teal-900 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon
                        className={`mr-3 h-5 w-5 transition-colors ${
                          isActive(item.href) 
                            ? 'text-white' 
                            : isDarkMode 
                              ? 'text-gray-400 group-hover:text-gray-300'
                              : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                      />
                      {item.name}
                    </div>
                    {item.badge && (
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
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

            {/* Upgrade to Premium Button */}
            <div className="px-2 pb-2">
              <Button
                onClick={() => navigate('/subscription')}
                className="w-full justify-center bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50"
              >
                <Crown className="mr-2 h-5 w-5" />
                Upgrade to Premium
              </Button>
            </div>

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

      {/* Mobile menu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <div className="lg:hidden">
          {/* Mobile header */}
          <div className={`flex items-center justify-between h-16 px-4 shadow-sm transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center">
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <h1 className="ml-3 text-xl font-black text-gray-800 dark:text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                NuviaCare
              </h1>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Premium Button - Mobile */}
              <Button 
                onClick={() => navigate('/subscription')}
                className="flex items-center bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg transition-all"
                size="sm"
              >
                <Crown className="h-4 w-4" />
              </Button>
              
              {isAdmin && (
                <Button
                  variant={featurePreviewEnabled ? 'default' : 'outline'}
                  size="sm"
                  onClick={toggleFeaturePreview}
                  className="flex items-center gap-1 px-3"
                  title="Toggle admin view for premium features"
                >
                  {featurePreviewEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  <span className="text-xs font-semibold">View</span>
                </Button>
              )}
              
              {/* Dark Mode Toggle - Mobile */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleDarkMode}
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                className="hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/dashboard#notifications')}
                className="relative hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
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
                  <div className="w-6 h-6 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center shadow-sm shadow-teal-500/30">
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
                  <DropdownMenuItem onClick={() => navigate('/subscription')}>
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade to Premium
                  </DropdownMenuItem>
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
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex h-24 items-center justify-center px-4 bg-gradient-to-r from-teal-600 to-cyan-600 shadow-lg shadow-teal-500/30">
            <h1 className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              NuviaCare
            </h1>
          </div>
          
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-300 transform hover:-translate-x-1 ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30'
                      : isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        : 'text-gray-600 hover:bg-teal-50 hover:text-teal-900'
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

          {/* Upgrade to Premium Button - Mobile */}
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

      {/* Desktop Header */}
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
            {/* Premium Button - Prominent */}
            <Button 
              onClick={() => navigate('/subscription')}
              className="hidden md:flex items-center bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              size="sm"
            >
              <Crown className="h-4 w-4 mr-2" />
              Premium
            </Button>

            {isAdmin && (
              <Button
                variant={featurePreviewEnabled ? 'default' : 'outline'}
                size="sm"
                onClick={toggleFeaturePreview}
                className="hidden md:flex items-center gap-2"
                title="Toggle admin view for premium features"
              >
                {featurePreviewEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                <span>View All Features</span>
                <span className="text-[11px] font-semibold tracking-wide">
                  {featurePreviewEnabled ? 'ON' : 'OFF'}
                </span>
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleDarkMode}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/dashboard#notifications')}
              className="relative hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
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
                    <Avatar className="w-8 h-8 border-2 border-teal-500 dark:border-teal-400">
                      <AvatarImage 
                        src={user?.profile?.profilePicture || user?.avatar_url} 
                        alt={user?.name || 'User'} 
                      />
                      <AvatarFallback className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-sm font-medium">
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
                <DropdownMenuItem onClick={() => navigate('/subscription')}>
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade to Premium
                </DropdownMenuItem>
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

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="flex-1 p-4 sm:p-6 pb-12">
  {children}
</main>
        
       {/* AdSense Banner - Fixed at bottom */}
<div className="fixed bottom-0 left-0 lg:left-64 right-0 z-40 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
  <div className="max-w-7xl mx-auto px-2" style={{ height: '30px' }}>
    <AdSenseBanner />
  </div>
</div>
</div>
</div>
  );
};

export default Layout;
