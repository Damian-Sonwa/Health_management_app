import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthContext';

import { API_BASE_URL } from '@/config/api';

const API_BASE = API_BASE_URL;

interface Subscription {
  _id: string;
  userId: string;
  tier: 'free' | 'premium';
  status: 'active' | 'inactive' | 'cancelled' | 'trial';
  startDate: string;
  endDate: string;
  paymentMethod?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export function useSubscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's subscription
  const { 
    data: subscription, 
    isLoading: loading, 
    error 
  } = useQuery({
    queryKey: ['subscription', user?.userId],
    queryFn: async () => {
      if (!user?.userId) return null;
      
      const response = await fetch(`${API_BASE}/subscriptions/${user.userId}`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 404) {
          // No subscription found, return free tier default
          return {
            tier: 'free',
            status: 'active'
          } as Subscription;
        }
        throw new Error('Failed to fetch subscription');
      }

      const data = await response.json();
      return data.subscription || data.data || null;
    },
    enabled: !!user?.userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update subscription
  const updateSubscriptionMutation = useMutation({
    mutationFn: async (subscriptionData: Partial<Subscription>) => {
      const response = await fetch(`${API_BASE}/subscriptions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(subscriptionData)
      });

      if (!response.ok) {
        throw new Error('Failed to update subscription');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    }
  });

  const isPremium = () => {
    if (!subscription) return false;
    
    const now = new Date();
    const endDate = subscription.endDate ? new Date(subscription.endDate) : null;
    
    return (
      subscription.status === 'active' && 
      subscription.tier === 'premium' &&
      (!endDate || endDate > now)
    );
  };

  const isTrialActive = () => {
    if (!subscription) return false;
    
    const now = new Date();
    const endDate = subscription.endDate ? new Date(subscription.endDate) : null;
    
    return subscription.status === 'trial' && (!endDate || endDate > now);
  };

  const getDaysUntilExpiry = () => {
    if (!subscription || !subscription.endDate) return 0;
    
    const now = new Date();
    const endDate = new Date(subscription.endDate);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  const hasFeatureAccess = (feature: string) => {
    if (isPremium() || isTrialActive()) {
      return true;
    }

    // Define free tier features
    const freeFeatures = [
      'basic_vitals',
      'basic_medications',
      'basic_appointments',
      'basic_records'
    ];

    return freeFeatures.includes(feature);
  };

  const getSubscriptionStatus = () => {
    if (!subscription) return 'free';
    
    if (isPremium()) return 'premium';
    if (isTrialActive()) return 'trial';
    
    return 'free';
  };

  const refreshSubscription = () => {
    queryClient.invalidateQueries({ queryKey: ['subscription'] });
  };

  const updateSubscription = async (subscriptionData: Partial<Subscription>) => {
    return updateSubscriptionMutation.mutateAsync(subscriptionData);
  };

  return {
    subscription,
    loading,
    error: error ? String(error) : null,
    isPremium: isPremium(),
    isTrialActive: isTrialActive(),
    daysUntilExpiry: getDaysUntilExpiry(),
    hasFeatureAccess,
    subscriptionStatus: getSubscriptionStatus(),
    refreshSubscription,
    updateSubscription,
  };
}
