import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthContext';

import { API_BASE_URL } from '@/config/api';

const API_BASE = API_BASE_URL;

interface CarePlan {
  _id: string;
  title: string;
  category: string;
  description?: string;
  goals: {
    goal: string;
    targetDate?: Date;
    achieved: boolean;
    progress: number;
  }[];
  tasks: {
    task: string;
    frequency: string;
    time?: string;
    completed: boolean;
    dueDate?: Date;
  }[];
  status: string;
  priority: string;
  startDate: Date;
  endDate?: Date;
  notes?: string;
}

interface CarePlanFormData {
  title: string;
  category: string;
  description: string;
  status: string;
  priority: string;
  startDate: string;
  endDate: string;
  notes: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Fetch care plans
const fetchCarePlans = async (): Promise<CarePlan[]> => {
  const response = await fetch(`${API_BASE}/care-plans`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch care plans');
  }
  
  const result = await response.json();
  return result.data || [];
};

// Create care plan
const createCarePlan = async (data: CarePlanFormData): Promise<CarePlan> => {
  const response = await fetch(`${API_BASE}/care-plans`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('Failed to create care plan');
  }

  const result = await response.json();
  return result.data;
};

// Update care plan
const updateCarePlan = async ({ id, data }: { id: string; data: Partial<CarePlanFormData> }): Promise<CarePlan> => {
  const response = await fetch(`${API_BASE}/care-plans/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('Failed to update care plan');
  }

  const result = await response.json();
  return result.data;
};

// Delete care plan
const deleteCarePlan = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/care-plans/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error('Failed to delete care plan');
  }
};

// Custom hook for care plans
export function useCarePlans() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: carePlans = [], isLoading, error } = useQuery({
    queryKey: ['carePlans', user?.userId],
    queryFn: fetchCarePlans,
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: createCarePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carePlans'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateCarePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carePlans'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCarePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carePlans'] });
    },
  });

  return {
    carePlans,
    isLoading,
    error,
    createCarePlan: createMutation.mutateAsync,
    updateCarePlan: updateMutation.mutateAsync,
    deleteCarePlan: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

