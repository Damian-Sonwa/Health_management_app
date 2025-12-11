import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthContext';

import { API_BASE_URL } from '@/config/api';

const API_BASE = API_BASE_URL;

interface Device {
  _id: string;
  name: string;
  type: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  status: string;
  lastSync?: Date;
  batteryLevel?: number;
  notes?: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Fetch devices
const fetchDevices = async (): Promise<Device[]> => {
  const response = await fetch(`${API_BASE}/devices`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) throw new Error('Failed to fetch devices');
  const result = await response.json();
  return result.data || [];
};

// Create device
const createDevice = async (data: any): Promise<Device> => {
  const response = await fetch(`${API_BASE}/devices`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  if (!response.ok) throw new Error('Failed to create device');
  const result = await response.json();
  return result.data;
};

// Update device
const updateDevice = async ({ id, data }: { id: string; data: any }): Promise<Device> => {
  const response = await fetch(`${API_BASE}/devices/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  if (!response.ok) throw new Error('Failed to update device');
  const result = await response.json();
  return result.data;
};

// Delete device
const deleteDevice = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/devices/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if (!response.ok) throw new Error('Failed to delete device');
};

// Custom hook
export function useDevices() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: devices = [], isLoading, error } = useQuery({
    queryKey: ['devices', user?.userId],
    queryFn: fetchDevices,
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: createDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });

  return {
    devices,
    isLoading,
    error,
    createDevice: createMutation.mutateAsync,
    updateDevice: updateMutation.mutateAsync,
    deleteDevice: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

