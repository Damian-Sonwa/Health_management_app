import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthContext';

import { API_BASE_URL } from '@/config/api';

const API_BASE = API_BASE_URL;

interface Caregiver {
  _id: string;
  name: string;
  relationship: string;
  phone?: string;
  email?: string;
  emergencyContact: boolean;
  primaryCaregiver: boolean;
  availability?: string;
  specialization?: string;
  notes?: string;
  photoUrl?: string;
  isActive: boolean;
}

interface CaregiverFormData {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  emergencyContact: boolean;
  primaryCaregiver: boolean;
  availability: string;
  specialization: string;
  notes: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Fetch caregivers
const fetchCaregivers = async (): Promise<Caregiver[]> => {
  const response = await fetch(`${API_BASE}/caregivers`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch caregivers');
  }
  
  const result = await response.json();
  return result.data || [];
};

// Create caregiver
const createCaregiver = async (data: CaregiverFormData): Promise<Caregiver> => {
  const response = await fetch(`${API_BASE}/caregivers`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('Failed to create caregiver');
  }

  const result = await response.json();
  return result.data;
};

// Update caregiver
const updateCaregiver = async ({ id, data }: { id: string; data: Partial<CaregiverFormData> }): Promise<Caregiver> => {
  const response = await fetch(`${API_BASE}/caregivers/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('Failed to update caregiver');
  }

  const result = await response.json();
  return result.data;
};

// Delete caregiver
const deleteCaregiver = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/caregivers/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error('Failed to delete caregiver');
  }
};

// Custom hook for caregivers
export function useCaregivers() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: caregivers = [], isLoading, error } = useQuery({
    queryKey: ['caregivers', user?.userId],
    queryFn: fetchCaregivers,
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: createCaregiver,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caregivers'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateCaregiver,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caregivers'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCaregiver,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caregivers'] });
    },
  });

  return {
    caregivers,
    isLoading,
    error,
    createCaregiver: createMutation.mutateAsync,
    updateCaregiver: updateMutation.mutateAsync,
    deleteCaregiver: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

