import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthContext';
import { API_BASE_URL } from '@/config/api';

const API_BASE = API_BASE_URL;

interface Vital {
  _id: string;
  type: string;
  value: string | number; // Can be string like "120/80" or number like 98
  unit: string;
  notes?: string;
  recordedAt?: string | Date;
  createdAt?: string | Date;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Fetch vitals
const fetchVitals = async (): Promise<Vital[]> => {
  console.log('🔄 Fetching vitals from API...');
  const response = await fetch(`${API_BASE}/vitals`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) throw new Error('Failed to fetch vitals');
  const result = await response.json();
  console.log('✅ Vitals fetched:', result.data?.length || 0, 'items');
  return result.data || [];
};

// Create vital
const createVital = async (data: any): Promise<Vital> => {
  const response = await fetch(`${API_BASE}/vitals`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  if (!response.ok) throw new Error('Failed to create vital');
  const result = await response.json();
  return result.data;
};

// Update vital
const updateVital = async ({ id, data }: { id: string; data: any }): Promise<Vital> => {
  const response = await fetch(`${API_BASE}/vitals/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  if (!response.ok) throw new Error('Failed to update vital');
  const result = await response.json();
  return result.data;
};

// Delete vital
const deleteVital = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/vitals/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if (!response.ok) throw new Error('Failed to delete vital');
};

// Custom hook
export function useVitals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: vitals = [], isLoading, error, refetch } = useQuery({
    queryKey: ['vitals'],
    queryFn: fetchVitals,
    enabled: !!user,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    staleTime: 0, // Always refetch on mount/focus
  });

  const createMutation = useMutation({
    mutationFn: createVital,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vitals'], refetchType: 'all' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateVital,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vitals'], refetchType: 'all' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVital,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vitals'], refetchType: 'all' });
    },
  });

  return {
    vitals,
    isLoading,
    error,
    refetch,
    createVital: createMutation.mutateAsync,
    updateVital: updateMutation.mutateAsync,
    deleteVital: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

