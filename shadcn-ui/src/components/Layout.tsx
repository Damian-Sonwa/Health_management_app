import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Smartphone
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Gamification', href: '/gamification', icon: Trophy, badge: 'New' },
    { name: 'AI Health Coach', href: '/ai-chat', icon: Sparkles, badge: 'New' },
    { name: 'Vitals', href: '/vitals', icon: Activity },
    { name: 'Medications', href: '/medications', icon: Pill },
    { name: 'Appointments', href: '/appointments', icon: Calendar },
    { name: 'Devices', href: '/devices', icon: Smartphone },
    { name: 'Medication Request', href: '/medication-request', icon: FileText },
    { name: 'Caregivers', href: '/caregivers', icon: User },
    { name: 'Care Plans', href: '/care-plans', icon: FileText },
    { name: 'Education', href: '/education', icon: FileText },
    { name: 'Telehealth', href: '/telehealth', icon: Calendar },
    { name: 'Wellness Guide', href: '/wellness', icon: Heart },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Profile', href: '/profile', icon: User },
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
          {/* Logo */}
          <div className="flex h-16 flex-shrink-0 items-center px-4 bg-gradient-to-r from-teal-600 to-cyan-600 shadow-lg shadow-teal-500/30">
            <Heart className="h-8 w-8 text-white animate-pulse-slow" />
            <span className="ml-2 text-xl font-bold text-white">HealthCare</span>
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
              <div className="ml-2 flex items-center">
                <Heart className="h-6 w-6 text-teal-600 animate-pulse-slow" />
                <span className={`ml-2 text-lg font-bold transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent'
                }`}>HealthCare</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
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
                  <DropdownMenuItem onClick={() => navigate('/upgrade')}>
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <SheetContent side="left" className={`w-64 p-0 transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex h-16 items-center px-4 bg-gradient-to-r from-teal-600 to-cyan-600 shadow-lg shadow-teal-500/30">
            <Heart className="h-8 w-8 text-white animate-pulse-slow" />
            <span className="ml-2 text-xl font-bold text-white">HealthCare</span>
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
        </SheetContent>
      </Sheet>

      {/* Desktop Header */}
      <div className="hidden lg:flex lg:pl-64">
        <div className={`flex flex-1 items-center justify-between h-16 px-6 shadow-sm transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex-1 flex items-center">
            <div className="max-w-lg w-full lg:max-w-xs">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md leading-5 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 hover:border-teal-300'
                  }`}
                  placeholder="Search..."
                  type="search"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleDarkMode}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="sm">
              <Bell className="h-5 w-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-100">
                  <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center shadow-md shadow-teal-500/30 transform transition-all duration-300 hover:scale-110">
                    <span className="text-sm text-white font-medium">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
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
                <DropdownMenuItem onClick={() => navigate('/upgrade')}>
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade Plan
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;