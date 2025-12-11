import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

import { API_BASE_URL } from '@/config/api';

const API_BASE = API_BASE_URL;

// Helper to get auth headers
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
}

// Types
export interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  hospital?: string;
  contact?: string;
  availableDays?: string[];
  availableTimes?: string[];
  isActive: boolean;
  zoomLink?: string;
  phoneNumber?: string;
  chatAvailable: boolean;
  email?: string;
  profileImage?: string;
  experience?: number;
  rating?: number;
  consultationFee?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorFilters {
  specialty?: string;
  isActive?: boolean;
  search?: string;
}

// API Functions
async function fetchDoctors(filters?: DoctorFilters): Promise<Doctor[]> {
  const params = new URLSearchParams();
  if (filters?.specialty) params.append('specialty', filters.specialty);
  if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
  if (filters?.search) params.append('search', filters.search);

  const url = `${API_BASE}/doctors${params.toString() ? `?${params}` : ''}`;
  
  const response = await fetch(url, {
    headers: getAuthHeaders()
  });

  if (!response.ok) throw new Error('Failed to fetch doctors');
  
  const result = await response.json();
  return result.data || [];
}

async function fetchDoctorById(id: string): Promise<Doctor> {
  const response = await fetch(`${API_BASE}/doctors/${id}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) throw new Error('Failed to fetch doctor');
  
  const result = await response.json();
  return result.data;
}

async function createDoctor(data: Partial<Doctor>): Promise<Doctor> {
  const response = await fetch(`${API_BASE}/doctors`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  if (!response.ok) throw new Error('Failed to create doctor');
  
  const result = await response.json();
  return result.data;
}

async function updateDoctor(id: string, data: Partial<Doctor>): Promise<Doctor> {
  const response = await fetch(`${API_BASE}/doctors/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  if (!response.ok) throw new Error('Failed to update doctor');
  
  const result = await response.json();
  return result.data;
}

async function deleteDoctor(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/doctors/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if (!response.ok) throw new Error('Failed to delete doctor');
}

async function fetchSpecialties(): Promise<string[]> {
  const response = await fetch(`${API_BASE}/doctors/specialties/list`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) throw new Error('Failed to fetch specialties');
  
  const result = await response.json();
  return result.data || [];
}

// Custom Hook
export function useDoctors(filters?: DoctorFilters) {
  const queryClient = useQueryClient();

  // Fetch all doctors
  const {
    data: doctors = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['doctors', filters],
    queryFn: () => fetchDoctors(filters),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true
  });

  // Fetch single doctor
  const getDoctorById = (id: string) => {
    return useQuery({
      queryKey: ['doctor', id],
      queryFn: () => fetchDoctorById(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000 // 5 minutes
    });
  };

  // Fetch specialties
  const {
    data: specialties = [],
    isLoading: isLoadingSpecialties
  } = useQuery({
    queryKey: ['specialties'],
    queryFn: fetchSpecialties,
    staleTime: 30 * 60 * 1000 // 30 minutes
  });

  // Create doctor mutation
  const createDoctorMutation = useMutation({
    mutationFn: createDoctor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['specialties'], refetchType: 'all' });
    }
  });

  // Update doctor mutation
  const updateDoctorMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Doctor> }) => updateDoctor(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['doctors'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['doctor', variables.id], refetchType: 'all' });
    }
  });

  // Delete doctor mutation
  const deleteDoctorMutation = useMutation({
    mutationFn: deleteDoctor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'], refetchType: 'all' });
    }
  });

  // Socket.IO for real-time updates
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!userId || !token) return;

    // Get Socket URL based on environment
    const socketUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:5001'
      : 'https://health-management-app-joj5.onrender.com';

    const socket: Socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('👨‍⚕️ Telehealth connected to Socket.IO');
      socket.emit('authenticate', { userId, token });
    });

    socket.on('doctor-updated', () => {
      console.log('👨‍⚕️ Doctor data updated');
      refetch();
      queryClient.invalidateQueries({ queryKey: ['doctors'], refetchType: 'all' });
    });

    socket.on('data-updated', (data: { type: string }) => {
      if (data.type === 'doctor' || data.type === 'all') {
        console.log('👨‍⚕️ Doctor data updated via broadcast');
        refetch();
        queryClient.invalidateQueries({ queryKey: ['doctors'], refetchType: 'all' });
      }
    });

    socket.on('disconnect', () => {
      console.log('👨‍⚕️ Telehealth disconnected from Socket.IO');
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient, refetch]);

  return {
    doctors,
    isLoading,
    error,
    refetch,
    specialties,
    isLoadingSpecialties,
    getDoctorById,
    createDoctor: createDoctorMutation.mutateAsync,
    updateDoctor: (id: string, data: Partial<Doctor>) => 
      updateDoctorMutation.mutateAsync({ id, data }),
    deleteDoctor: deleteDoctorMutation.mutateAsync,
    isCreating: createDoctorMutation.isPending,
    isUpdating: updateDoctorMutation.isPending,
    isDeleting: deleteDoctorMutation.isPending
  };
}

