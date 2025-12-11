import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthContext';
import { toast } from 'sonner';

import { API_BASE_URL } from '@/config/api';

const API_BASE = API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Fetch user progress
const fetchProgress = async (): Promise<any> => {
  const response = await fetch(`${API_BASE}/gamification/progress`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) throw new Error('Failed to fetch progress');
  const result = await response.json();
  return result.data;
};

// Update progress (award points)
const updateProgress = async (data: any): Promise<any> => {
  const response = await fetch(`${API_BASE}/gamification/progress/update`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  if (!response.ok) throw new Error('Failed to update progress');
  const result = await response.json();
  return result;
};

// Fetch achievements
const fetchAchievements = async (): Promise<any[]> => {
  const response = await fetch(`${API_BASE}/gamification/achievements`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) throw new Error('Failed to fetch achievements');
  const result = await response.json();
  return result.data || [];
};

// Fetch leaderboard
const fetchLeaderboard = async (): Promise<any[]> => {
  const response = await fetch(`${API_BASE}/gamification/leaderboard`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) throw new Error('Failed to fetch leaderboard');
  const result = await response.json();
  return result.data || [];
};

// Custom hook
export function useGamification() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: progress, isLoading: isLoadingProgress, error: progressError } = useQuery({
    queryKey: ['gamification', 'progress', user?.userId],
    queryFn: fetchProgress,
    enabled: !!user,
  });

  const { data: achievements = [], isLoading: isLoadingAchievements } = useQuery({
    queryKey: ['gamification', 'achievements', user?.userId],
    queryFn: fetchAchievements,
    enabled: !!user,
  });

  const { data: leaderboard = [], isLoading: isLoadingLeaderboard } = useQuery({
    queryKey: ['gamification', 'leaderboard'],
    queryFn: fetchLeaderboard,
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const updateProgressMutation = useMutation({
    mutationFn: updateProgress,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['gamification', 'progress'] });
      queryClient.invalidateQueries({ queryKey: ['gamification', 'achievements'] });
      
      if (data.leveledUp) {
        toast.success(`🎉 Level Up! You're now level ${data.data.level}!`, {
          duration: 5000,
        });
      }
      
      if (data.newAchievement) {
        toast.success(`${data.newAchievement.icon} Achievement Unlocked: ${data.newAchievement.name}!`, {
          duration: 5000,
        });
      }
    },
    onError: (err: any) => {
      toast.error('Failed to update progress: ' + err.message);
    },
  });

  const awardPoints = async (category: string, points: number, action?: string) => {
    try {
      await updateProgressMutation.mutateAsync({ category, points, action });
    } catch (error) {
      console.error('Error awarding points:', error);
    }
  };

  return {
    progress,
    achievements,
    leaderboard,
    isLoading: isLoadingProgress || isLoadingAchievements,
    isLoadingLeaderboard,
    progressError,
    awardPoints,
    isUpdating: updateProgressMutation.isPending,
  };
}

