import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthContext';

import { API_BASE_URL } from '@/config/api';

const API_BASE = API_BASE_URL;

interface HealthRecord {
  _id: string;
  type: string;
  title: string;
  description?: string;
  date: Date;
  doctorName?: string;
  file?: string;
  fileType?: string;
  fileName?: string;
  uploadedAt: Date;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Fetch health records
const fetchHealthRecords = async (): Promise<HealthRecord[]> => {
  const response = await fetch(`${API_BASE}/health-records`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) throw new Error('Failed to fetch health records');
  const result = await response.json();
  return result.data || [];
};

// Create health record
const createHealthRecord = async (data: any): Promise<HealthRecord> => {
  const response = await fetch(`${API_BASE}/health-records`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  if (!response.ok) throw new Error('Failed to create health record');
  const result = await response.json();
  return result.data;
};

// Update health record
const updateHealthRecord = async ({ id, data }: { id: string; data: any }): Promise<HealthRecord> => {
  const response = await fetch(`${API_BASE}/health-records/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  if (!response.ok) throw new Error('Failed to update health record');
  const result = await response.json();
  return result.data;
};

// Delete health record
const deleteHealthRecord = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/health-records/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if (!response.ok) throw new Error('Failed to delete health record');
};

// Custom hook
export function useHealthRecords() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: healthRecords = [], isLoading, error, refetch } = useQuery({
    queryKey: ['healthRecords'],
    queryFn: fetchHealthRecords,
    enabled: !!user,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const createMutation = useMutation({
    mutationFn: createHealthRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['healthRecords'], refetchType: 'all' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateHealthRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['healthRecords'], refetchType: 'all' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHealthRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['healthRecords'], refetchType: 'all' });
    },
  });

  return {
    healthRecords,
    isLoading,
    error,
    refetch,
    createHealthRecord: createMutation.mutateAsync,
    updateHealthRecord: updateMutation.mutateAsync,
    deleteHealthRecord: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

