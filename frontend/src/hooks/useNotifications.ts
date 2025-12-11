import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthContext';
import { API_BASE_URL } from '@/config/api';

const API_BASE = API_BASE_URL;

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  priority: string;
  icon?: string;
  scheduledFor?: Date;
  createdAt: Date;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Fetch notifications
const fetchNotifications = async (): Promise<Notification[]> => {
  const response = await fetch(`${API_BASE}/notifications`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) throw new Error('Failed to fetch notifications');
  const result = await response.json();
  return result.data || [];
};

// Create notification
const createNotification = async (data: any): Promise<Notification> => {
  const response = await fetch(`${API_BASE}/notifications`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  if (!response.ok) throw new Error('Failed to create notification');
  const result = await response.json();
  return result.data;
};

// Mark as read
const markAsRead = async (id: string): Promise<Notification> => {
  const response = await fetch(`${API_BASE}/notifications/${id}/read`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });

  if (!response.ok) throw new Error('Failed to mark notification as read');
  const result = await response.json();
  return result.data;
};

// Mark all as read
const markAllAsRead = async (): Promise<void> => {
  const response = await fetch(`${API_BASE}/notifications/mark-all-read`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });

  if (!response.ok) throw new Error('Failed to mark all as read');
};

// Delete notification
const deleteNotification = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/notifications/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if (!response.ok) throw new Error('Failed to delete notification');
};

// Custom hook
export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading, error, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    enabled: !!user,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 10000, // Poll every 10 seconds for real-time updates
    staleTime: 0,
  });

  const createMutation = useMutation({
    mutationFn: createNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'], refetchType: 'all' });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'], refetchType: 'all' });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'], refetchType: 'all' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'], refetchType: 'all' });
    },
  });

  // Computed values
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refetch,
    createNotification: createMutation.mutateAsync,
    markAsRead: markAsReadMutation.mutateAsync,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
    deleteNotification: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isMarking: markAsReadMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

