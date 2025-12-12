import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Calendar, Activity, Pill, FileText, User, Heart, Sparkles, Trophy, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { API_BASE_URL } from '@/config/api';

interface SearchResult {
  id: string;
  type: 'vital' | 'medication' | 'appointment' | 'caregiver' | 'care-plan' | 'health-record' | 'page';
  title: string;
  subtitle?: string;
  date?: string;
  link: string;
  data?: any;
}

interface GlobalSearchProps {
  isDarkMode?: boolean;
}

export default function GlobalSearch({ isDarkMode = false }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search function
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setResults([]);
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch data from all endpoints
      const [vitals, medications, appointments, caregivers, carePlans, healthRecords] = await Promise.all([
        fetch(`${API_BASE_URL}/vitals`, { headers }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch(`${API_BASE_URL}/medications`, { headers }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch(`${API_BASE_URL}/appointments`, { headers }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch(`${API_BASE_URL}/caregivers`, { headers }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch(`${API_BASE_URL}/care-plans`, { headers }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch(`${API_BASE_URL}/health-records`, { headers }).then(r => r.json()).catch(() => ({ data: [] }))
      ]);

      const searchLower = searchQuery.toLowerCase();
      const foundResults: SearchResult[] = [];

      // Search vitals
      (vitals.data || []).forEach((vital: any) => {
        if (
          vital.type?.toLowerCase().includes(searchLower) ||
          vital.value?.toString().includes(searchLower) ||
          vital.notes?.toLowerCase().includes(searchLower)
        ) {
          foundResults.push({
            id: vital._id,
            type: 'vital',
            title: `${vital.type}: ${vital.value} ${vital.unit || ''}`,
            subtitle: vital.notes || 'No notes',
            date: new Date(vital.recordedAt || vital.createdAt).toLocaleDateString(),
            link: '/vitals',
            data: vital
          });
        }
      });

      // Search medications
      (medications.data || []).forEach((med: any) => {
        if (
          med.name?.toLowerCase().includes(searchLower) ||
          med.dosage?.toLowerCase().includes(searchLower) ||
          med.frequency?.toLowerCase().includes(searchLower) ||
          med.notes?.toLowerCase().includes(searchLower)
        ) {
          foundResults.push({
            id: med._id,
            type: 'medication',
            title: med.name,
            subtitle: `${med.dosage} - ${med.frequency}`,
            date: med.startDate ? new Date(med.startDate).toLocaleDateString() : undefined,
            link: '/medications',
            data: med
          });
        }
      });

      // Search appointments
      (appointments.data || []).forEach((apt: any) => {
        if (
          apt.doctorName?.toLowerCase().includes(searchLower) ||
          apt.specialty?.toLowerCase().includes(searchLower) ||
          apt.hospital?.toLowerCase().includes(searchLower) ||
          apt.reason?.toLowerCase().includes(searchLower)
        ) {
          foundResults.push({
            id: apt._id,
            type: 'appointment',
            title: `Dr. ${apt.doctorName}`,
            subtitle: `${apt.specialty} - ${apt.hospital || 'Hospital'}`,
            date: new Date(apt.date).toLocaleDateString(),
            link: '/appointments',
            data: apt
          });
        }
      });

      // Search caregivers
      (caregivers.data || []).forEach((cg: any) => {
        if (
          cg.name?.toLowerCase().includes(searchLower) ||
          cg.relationship?.toLowerCase().includes(searchLower) ||
          cg.phone?.includes(searchLower) ||
          cg.email?.toLowerCase().includes(searchLower)
        ) {
          foundResults.push({
            id: cg._id,
            type: 'caregiver',
            title: cg.name,
            subtitle: `${cg.relationship} - ${cg.phone || cg.email}`,
            link: '/caregivers',
            data: cg
          });
        }
      });

      // Search care plans
      (carePlans.data || []).forEach((cp: any) => {
        if (
          cp.title?.toLowerCase().includes(searchLower) ||
          cp.description?.toLowerCase().includes(searchLower) ||
          cp.goals?.some((g: string) => g.toLowerCase().includes(searchLower))
        ) {
          foundResults.push({
            id: cp._id,
            type: 'care-plan',
            title: cp.title,
            subtitle: cp.description || 'No description',
            date: cp.startDate ? new Date(cp.startDate).toLocaleDateString() : undefined,
            link: '/care-plans',
            data: cp
          });
        }
      });

      // Search health records
      (healthRecords.data || []).forEach((hr: any) => {
        if (
          hr.title?.toLowerCase().includes(searchLower) ||
          hr.description?.toLowerCase().includes(searchLower) ||
          hr.category?.toLowerCase().includes(searchLower)
        ) {
          foundResults.push({
            id: hr._id,
            type: 'health-record',
            title: hr.title,
            subtitle: hr.category || 'Health Record',
            date: hr.date ? new Date(hr.date).toLocaleDateString() : undefined,
            link: '/dashboard#health-records-section',
            data: hr
          });
        }
      });

      // Add page/feature results - Include ALL navigation items from sidebar
      // This ensures search finds everything, including grouped items
      const pages = [
        // Dashboard Section
        { name: 'Dashboard', keywords: ['home', 'overview', 'summary', 'dashboard'], link: '/dashboard' },
        { name: 'Pharmacy Dashboard', keywords: ['pharmacy dashboard', 'pharmacy'], link: '/pharmacy-dashboard' },
        { name: 'Doctor Dashboard', keywords: ['doctor dashboard', 'doctor'], link: '/doctor-dashboard' },
        { name: 'Admin Dashboard', keywords: ['admin dashboard', 'admin'], link: '/admin-dashboard' },
        // Services Section
        { name: 'Vitals Tracking', keywords: ['vitals', 'blood pressure', 'glucose', 'heart rate', 'bp', 'vitals tracking'], link: '/vitals' },
        { name: 'Medications', keywords: ['medications', 'medicine', 'pills', 'drugs', 'prescription'], link: '/medications' },
        { name: 'Medication Request', keywords: ['medication request', 'prescription request', 'refill', 'request medication'], link: '/medication-request' },
        { name: 'Chat Center', keywords: ['chat center', 'chat', 'messaging', 'customer care', 'support'], link: '/patient/chat-center' },
        { name: 'Consultation Room', keywords: ['consultation room', 'consultation', 'appointment'], link: '/patient-consultation-room' },
        { name: 'Devices', keywords: ['devices', 'monitors', 'equipment', 'integration'], link: '/devices' },
        { name: 'Caregivers', keywords: ['caregivers', 'family', 'contacts', 'emergency'], link: '/caregivers' },
        { name: 'Care Plans', keywords: ['care plans', 'treatment', 'therapy', 'goals'], link: '/care-plans' },
        // Learning & Resources Section
        { name: 'Education', keywords: ['education', 'learn', 'resources', 'knowledge', 'courses'], link: '/education' },
        { name: 'Wellness Guide', keywords: ['wellness', 'wellness guide', 'tips', 'articles', 'health tips'], link: '/wellness' },
        { name: 'AI Health Coach', keywords: ['ai', 'ai health coach', 'chatbot', 'coach', 'assistant', 'help'], link: '/ai-chat' },
        { name: 'Gamification', keywords: ['gamification', 'achievements', 'badges', 'points', 'rewards'], link: '/gamification' },
        // Reports & Analytics Section
        { name: 'Analytics', keywords: ['analytics', 'charts', 'graphs', 'trends', 'statistics', 'reports'], link: '/analytics' },
        // Settings Section
        { name: 'Profile', keywords: ['profile', 'personal', 'information', 'details', 'account'], link: '/profile' },
        { name: 'Settings', keywords: ['settings', 'preferences', 'configuration', 'account settings', 'logout', 'log out', 'sign out', 'signout'], link: '/settings' },
        // Other pages
        { name: 'Appointments', keywords: ['appointments', 'schedule', 'calendar', 'booking'], link: '/appointments' },
        { name: 'Telehealth', keywords: ['telehealth', 'doctors', 'video call'], link: '/telehealth' },
        { name: 'Upgrade to Premium', keywords: ['upgrade', 'premium', 'subscription', 'pricing', 'plans', 'paid'], link: '/subscription' },
      ];

      pages.forEach(page => {
        if (
          page.name.toLowerCase().includes(searchLower) ||
          page.keywords.some(kw => kw.includes(searchLower))
        ) {
          foundResults.push({
            id: page.link,
            type: 'page',
            title: page.name,
            subtitle: 'Navigate to page',
            link: page.link
          });
        }
      });

      setResults(foundResults.slice(0, 10)); // Limit to 10 results
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleResultClick = (result: SearchResult) => {
    navigate(result.link);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'vital':
        return <Activity className="w-4 h-4" />;
      case 'medication':
        return <Pill className="w-4 h-4" />;
      case 'appointment':
        return <Calendar className="w-4 h-4" />;
      case 'caregiver':
        return <User className="w-4 h-4" />;
      case 'care-plan':
        return <FileText className="w-4 h-4" />;
      case 'health-record':
        return <FileText className="w-4 h-4" />;
      case 'page':
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      'vital': { label: 'Vital', className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200' },
      'medication': { label: 'Med', className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' },
      'appointment': { label: 'Apt', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' },
      'caregiver': { label: 'Contact', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200' },
      'care-plan': { label: 'Plan', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200' },
      'health-record': { label: 'Record', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200' },
      'page': { label: 'Page', className: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-200' },
    };

    const badge = badges[type] || { label: 'Item', className: 'bg-gray-100 text-gray-700' };
    return <Badge className={`text-xs ${badge.className}`}>{badge.label}</Badge>;
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          ref={inputRef}
          className={`block w-full pl-10 pr-10 py-2 border rounded-md leading-5 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
              : 'bg-white border-gray-300 hover:border-teal-300'
          }`}
          placeholder="Search vitals, meds, appointments..."
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className={`absolute z-50 mt-2 w-full rounded-lg shadow-2xl border ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <ScrollArea className="max-h-96">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500 mx-auto"></div>
                <p className="mt-2 text-sm">Searching...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className={`w-full px-4 py-3 text-left hover:bg-teal-50 dark:hover:bg-gray-700 transition-colors border-b last:border-b-0 ${
                      isDarkMode ? 'border-gray-700' : 'border-gray-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 p-2 rounded-full ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        {getIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`font-medium text-sm truncate ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {result.title}
                          </p>
                          {getTypeBadge(result.type)}
                        </div>
                        <p className={`text-xs truncate ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {result.subtitle}
                        </p>
                        {result.date && (
                          <p className={`text-xs mt-1 ${
                            isDarkMode ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                            {result.date}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : query ? (
              <div className="p-8 text-center">
                <Search className={`h-12 w-12 mx-auto mb-3 ${
                  isDarkMode ? 'text-gray-600' : 'text-gray-300'
                }`} />
                <p className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  No results found
                </p>
                <p className={`text-xs mt-1 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  Try searching for vitals, medications, or appointments
                </p>
              </div>
            ) : null}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

