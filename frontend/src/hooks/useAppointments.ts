import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthContext';
import { API_BASE_URL } from '@/config/api';

const API_BASE = API_BASE_URL;

interface Appointment {
  _id: string;
  doctorName: string;
  doctorSpecialty?: string;
  appointmentDate: Date;
  appointmentTime?: string;
  appointmentType: string;
  status: string;
  reason?: string;
  notes?: string;
  location?: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Fetch appointments
const fetchAppointments = async (): Promise<Appointment[]> => {
  const response = await fetch(`${API_BASE}/appointments`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) throw new Error('Failed to fetch appointments');
  const result = await response.json();
  return result.data || [];
};

// Create appointment
const createAppointment = async (data: any): Promise<Appointment> => {
  const response = await fetch(`${API_BASE}/appointments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  if (!response.ok) throw new Error('Failed to create appointment');
  const result = await response.json();
  return result.data;
};

// Update appointment
const updateAppointment = async ({ id, data }: { id: string; data: any }): Promise<Appointment> => {
  const response = await fetch(`${API_BASE}/appointments/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  if (!response.ok) throw new Error('Failed to update appointment');
  const result = await response.json();
  return result.data;
};

// Delete appointment
const deleteAppointment = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/appointments/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if (!response.ok) throw new Error('Failed to delete appointment');
};

// Custom hook
export function useAppointments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading, error, refetch } = useQuery({
    queryKey: ['appointments'],
    queryFn: fetchAppointments,
    enabled: !!user,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    staleTime: 0, // Always refetch on mount/focus
  });

  const createMutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'], refetchType: 'all' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'], refetchType: 'all' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'], refetchType: 'all' });
    },
  });

  return {
    appointments,
    isLoading,
    error,
    refetch,
    createAppointment: createMutation.mutateAsync,
    updateAppointment: updateMutation.mutateAsync,
    deleteAppointment: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

