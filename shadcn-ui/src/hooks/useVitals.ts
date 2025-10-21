import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthContext';

const API_BASE = 'http://localhost:5001/api';

interface Vital {
  _id: string;
  type: string;
  value: number;
  unit: string;
  notes?: string;
  recordedAt: Date;
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
  const response = await fetch(`${API_BASE}/vitals`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) throw new Error('Failed to fetch vitals');
  const result = await response.json();
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

  const { data: vitals = [], isLoading, error } = useQuery({
    queryKey: ['vitals', user?.userId],
    queryFn: fetchVitals,
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: createVital,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vitals'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateVital,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vitals'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVital,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vitals'] });
    },
  });

  return {
    vitals,
    isLoading,
    error,
    createVital: createMutation.mutateAsync,
    updateVital: updateMutation.mutateAsync,
    deleteVital: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

