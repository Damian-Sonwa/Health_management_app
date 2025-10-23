import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthContext';
import { API_BASE_URL } from '@/config/api';

const API_BASE = API_BASE_URL;

interface DashboardStats {
  vitalsCount: number;
  medicationsCount: number;
  appointmentsCount: number;
  healthRecordsCount: number;
  unreadNotifications: number;
  recentVitals: any[];
  upcomingAppointments: any[];
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Fetch dashboard stats
const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const response = await fetch(`${API_BASE}/dashboard/stats`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) throw new Error('Failed to fetch dashboard stats');
  const result = await response.json();
  return result.data;
};

// Fetch data visualization
const fetchDataVisualization = async (): Promise<any[]> => {
  const response = await fetch(`${API_BASE}/data-visualization`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) throw new Error('Failed to fetch data visualization');
  const result = await response.json();
  return result.data || [];
};

// Custom hook for dashboard
export function useDashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading: isLoadingStats, error: statsError, refetch: refetchStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    enabled: !!user,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const { data: visualizations = [], isLoading: isLoadingViz, error: vizError } = useQuery({
    queryKey: ['dataVisualization'],
    queryFn: fetchDataVisualization,
    enabled: !!user,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  return {
    stats,
    visualizations,
    isLoading: isLoadingStats || isLoadingViz,
    error: statsError || vizError,
    refetchStats,
  };
}

