import React, { useState } from 'react';
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
  Search
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { useSupabaseData } from '@/hooks/useSupabaseData';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { subscription, getRemainingTrialDays } = useSupabaseData();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Vitals', href: '/vitals', icon: Activity },
    { name: 'Medications', href: '/medications', icon: Pill },
    { name: 'Appointments', href: '/appointments', icon: Calendar },
    { name: 'Medication Request', href: '/medication-request', icon: FileText },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Wellness Guide', href: '/wellness', icon: Heart },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const isActive = (href: string) => location.pathname === href;

  const trialDays = getRemainingTrialDays();
  const showUpgradeBanner = subscription?.plan === 'free' && trialDays <= 7;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white shadow-xl">
          {/* Logo */}
          <div className="flex h-16 flex-shrink-0 items-center px-4 bg-gradient-to-r from-blue-600 to-purple-600">
            <Heart className="h-8 w-8 text-white" />
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
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md'
                    }`}
                  >
                    <Icon
                      className={`mr-3 h-5 w-5 transition-colors ${
                        isActive(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
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
          <div className="flex items-center justify-between h-16 px-4 bg-white shadow-sm">
            <div className="flex items-center">
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <div className="ml-2 flex items-center">
                <Heart className="h-6 w-6 text-blue-600" />
                <span className="ml-2 text-lg font-bold text-gray-900">HealthCare</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-medium">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
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

        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-16 items-center px-4 bg-gradient-to-r from-blue-600 to-purple-600">
            <Heart className="h-8 w-8 text-white" />
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
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 ${
                      isActive(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
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
        <div className="flex flex-1 items-center justify-between h-16 px-6 bg-white shadow-sm">
          <div className="flex-1 flex items-center">
            <div className="max-w-lg w-full lg:max-w-xs">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search..."
                  type="search"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {subscription?.plan === 'free' && (
              <Button
                onClick={() => navigate('/upgrade')}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white"
                size="sm"
              >
                <Crown className="mr-2 h-4 w-4" />
                Upgrade
              </Button>
            )}
            
            <Button variant="ghost" size="sm">
              <Bell className="h-5 w-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-100">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-sm text-white font-medium">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
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