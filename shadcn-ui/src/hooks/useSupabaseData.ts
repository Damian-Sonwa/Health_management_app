import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthContext';

export interface UserProfile {
  id: string;
  user_id: string;
  age: number | null;
  blood_type: string | null;
  health_status: 'excellent' | 'good' | 'fair' | 'poor';
  allergies: string[];
  medications: string[];
  conditions: string[];
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: 'free' | 'premium';
  status: 'active' | 'trial' | 'cancelled';
  trial_end_date: string | null;
  billing_cycle: 'monthly' | 'yearly' | null;
  created_at: string;
  updated_at: string;
}

export const useSupabaseData = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    } else {
      setProfile(null);
      setSubscription(null);
      setLoading(false);
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile fetch error:', profileError);
      } else {
        setProfile(profileData);
      }

      // Fetch subscription
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (subscriptionError && subscriptionError.code !== 'PGRST116') {
        console.error('Subscription fetch error:', subscriptionError);
      } else {
        setSubscription(subscriptionData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSubscription = async (plan: 'premium', billingCycle: 'monthly' | 'yearly') => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          plan,
          status: 'active',
          billing_cycle: billingCycle,
          trial_end_date: null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setSubscription(data);
      return data;
    } catch (error) {
      console.error('Subscription update error:', error);
      throw error;
    }
  };

  const getRemainingTrialDays = () => {
    if (!subscription?.trial_end_date) return 0;
    
    const trialEnd = new Date(subscription.trial_end_date);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  const shouldShowAds = () => {
    return subscription?.plan === 'free' && subscription?.status !== 'trial';
  };

  return {
    profile,
    subscription,
    loading,
    updateSubscription,
    getRemainingTrialDays,
    shouldShowAds,
    refetch: fetchUserData,
  };
};