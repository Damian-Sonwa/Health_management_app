import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthContext';

const API_BASE = 'http://localhost:5001/api';

interface Medication {
  _id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  notes?: string;
  prescribedBy?: string;
  status: string;
  isActive: boolean;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Fetch medications
const fetchMedications = async (): Promise<Medication[]> => {
  const response = await fetch(`${API_BASE}/medications`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) throw new Error('Failed to fetch medications');
  const result = await response.json();
  return result.data || [];
};

// Create medication
const createMedication = async (data: any): Promise<Medication> => {
  const response = await fetch(`${API_BASE}/medications`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  if (!response.ok) throw new Error('Failed to create medication');
  const result = await response.json();
  return result.data;
};

// Update medication
const updateMedication = async ({ id, data }: { id: string; data: any }): Promise<Medication> => {
  const response = await fetch(`${API_BASE}/medications/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  if (!response.ok) throw new Error('Failed to update medication');
  const result = await response.json();
  return result.data;
};

// Delete medication
const deleteMedication = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/medications/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if (!response.ok) throw new Error('Failed to delete medication');
};

// Custom hook
export function useMedications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: medications = [], isLoading, error } = useQuery({
    queryKey: ['medications', user?.userId],
    queryFn: fetchMedications,
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: createMedication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateMedication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMedication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });

  return {
    medications,
    isLoading,
    error,
    createMedication: createMutation.mutateAsync,
    updateMedication: updateMutation.mutateAsync,
    deleteMedication: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

