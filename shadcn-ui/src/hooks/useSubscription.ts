import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/components/AuthContext';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'inactive' | 'cancelled' | 'pending' | 'trial';
  start_date: string;
  end_date: string;
  payment_reference: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  created_at: string;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    } else {
      setSubscription(null);
      setLoading(false);
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      setSubscription(data);
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError('Failed to fetch subscription');
    } finally {
      setLoading(false);
    }
  };

  const isPremium = () => {
    if (!subscription) return false;
    
    const now = new Date();
    const endDate = new Date(subscription.end_date);
    
    return subscription.status === 'active' && 
           (subscription.plan_id === 'monthly' || subscription.plan_id === 'yearly') &&
           endDate > now;
  };

  const isTrialActive = () => {
    if (!subscription) return false;
    
    const now = new Date();
    const endDate = new Date(subscription.end_date);
    
    return subscription.status === 'trial' && endDate > now;
  };

  const getDaysUntilExpiry = () => {
    if (!subscription) return 0;
    
    const now = new Date();
    const endDate = new Date(subscription.end_date);
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
      'basic_consultations',
      'basic_vitals',
      'basic_medications',
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
    if (user) {
      fetchSubscription();
    }
  };

  return {
    subscription,
    loading,
    error,
    isPremium: isPremium(),
    isTrialActive: isTrialActive(),
    daysUntilExpiry: getDaysUntilExpiry(),
    hasFeatureAccess,
    subscriptionStatus: getSubscriptionStatus(),
    refreshSubscription,
  };
}