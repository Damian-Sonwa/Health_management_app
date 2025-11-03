// ===== Caregiver Hook with React Query =====
// This file helps manage caregivers (family, nurses, doctors) for each user
// Uses React Query to get data from server and keep it up to date

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthContext';

import { API_BASE_URL } from '@/config/api';

const API_BASE = API_BASE_URL;

// What information we store for each caregiver
interface Caregiver {
  _id: string;              // Unique ID
  name: string;             // Full name
  relationship: string;      // How they're related (spouse, daughter, nurse, etc.)
  phone?: string;           // Phone number (optional)
  email?: string;           // Email address (optional)
  emergencyContact: boolean; // Can they be called in emergencies?
  primaryCaregiver: boolean; // Are they the main caregiver?
  availability?: string;     // When are they available (optional)
  specialization?: string;   // What they specialize in (optional)
  notes?: string;           // Extra notes (optional)
  photoUrl?: string;        // Profile picture URL (optional)
  isActive: boolean;        // Is this caregiver still active?
}

// Form data when creating/editing a caregiver
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

// Get login token to prove user is logged in
const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Get all caregivers for the logged-in user
const fetchCaregivers = async (): Promise<Caregiver[]> => {
  const response = await fetch(`${API_BASE}/caregivers`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch caregivers');
  }
  
  const result = await response.json();
  // Return the caregivers list (empty if user has none)
  return result.data || [];
};

// Add a new caregiver to the database
const createCaregiver = async (data: CaregiverFormData): Promise<Caregiver> => {
  const response = await fetch(`${API_BASE}/caregivers`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || `Failed to create caregiver (${response.status})`;
    console.error('❌ Create caregiver error:', errorMessage);
    throw new Error(errorMessage);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || 'Failed to create caregiver');
  }
  
  console.log('✅ Caregiver created successfully:', result.data?.name);
  return result.data;
};

// Update an existing caregiver's information
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

// Remove a caregiver from the database
const deleteCaregiver = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/caregivers/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error('Failed to delete caregiver');
  }
};

// ===== Main Hook - Use This in Components =====
// This gives you everything you need to work with caregivers
export function useCaregivers() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get caregivers from server (only if user is logged in)
  // Each user gets their own caregiver list - starts empty for new users
  const { data: caregivers = [], isLoading, error } = useQuery({
    queryKey: ['caregivers', user?.userId],  // Unique key for this user's caregivers
    queryFn: fetchCaregivers,                 // Function to get data
    enabled: !!user,                          // Only run if user is logged in
  });

  // Set up mutation for adding caregiver
  const createMutation = useMutation({
    mutationFn: createCaregiver,
    onSuccess: () => {
      // Refresh caregiver list after adding
      queryClient.invalidateQueries({ queryKey: ['caregivers'] });
    },
  });

  // Set up mutation for updating caregiver
  const updateMutation = useMutation({
    mutationFn: updateCaregiver,
    onSuccess: () => {
      // Refresh caregiver list after updating
      queryClient.invalidateQueries({ queryKey: ['caregivers'] });
    },
  });

  // Set up mutation for deleting caregiver
  const deleteMutation = useMutation({
    mutationFn: deleteCaregiver,
    onSuccess: () => {
      // Refresh caregiver list after deleting
      queryClient.invalidateQueries({ queryKey: ['caregivers'] });
    },
  });

  // Return everything components need
  return {
    caregivers,           // List of caregivers (empty for new users)
    isLoading,            // Is data loading?
    error,                // Any errors?
    createCaregiver: createMutation.mutateAsync,  // Function to add caregiver
    updateCaregiver: updateMutation.mutateAsync,  // Function to update caregiver
    deleteCaregiver: deleteMutation.mutateAsync,  // Function to delete caregiver
    isCreating: createMutation.isPending,         // Is adding in progress?
    isUpdating: updateMutation.isPending,         // Is updating in progress?
    isDeleting: deleteMutation.isPending,         // Is deleting in progress?
  };
}

