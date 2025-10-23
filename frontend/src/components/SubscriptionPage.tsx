import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Crown, 
  Check, 
  X, 
  Star, 
  Clock, 
  Users, 
  BarChart3, 
  MessageCircle, 
  FileText, 
  Calendar,
  Zap,
  Shield,
  Sparkles,
  CreditCard,
  Lock
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe (using Vite env variables)
// Note: In Vite, use import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY in your .env file
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'inactive' | 'cancelled' | 'trial';
  start_date: string;
  end_date: string;
  payment_reference: string;
  created_at: string;
}

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  stripePriceId: string;
  originalPrice?: number;
  badge?: string;
  features: string[];
}

const premiumFeatures = [
  {
    icon: <Sparkles className="w-6 h-6 text-purple-600" />,
    title: '🏥 Full Telehealth Access',
    description: 'Unlimited video consultations, instant chat with doctors, and priority booking',
    free: false,
    premium: true
  },
  {
    icon: <Calendar className="w-5 h-5 text-blue-600" />,
    title: 'Video Consultations',
    description: 'Connect face-to-face with healthcare providers anytime, anywhere',
    free: false,
    premium: true
  },
  {
    icon: <Clock className="w-5 h-5 text-green-600" />,
    title: 'Extended 60-Min Sessions',
    description: 'Up to 60-minute sessions with healthcare providers',
    free: false,
    premium: true
  },
  {
    icon: <Users className="w-5 h-5 text-purple-600" />,
    title: 'Specialist Access',
    description: 'Direct access to specialists and expert consultations',
    free: false,
    premium: true
  },
  {
    icon: <BarChart3 className="w-5 h-5 text-orange-600" />,
    title: 'Advanced Analytics',
    description: 'Detailed health insights and personalized reports',
    free: false,
    premium: true
  },
  {
    icon: <Shield className="w-5 h-5 text-indigo-600" />,
    title: 'Family Caregiver Support',
    description: 'Add unlimited caregivers with full access permissions',
    free: false,
    premium: true
  },
  {
    icon: <FileText className="w-5 h-5 text-teal-600" />,
    title: 'Unlimited Health Records',
    description: 'Store and access all your medical history',
    free: false,
    premium: true
  },
  {
    icon: <MessageCircle className="w-5 h-5 text-pink-600" />,
    title: '24/7 Doctor Chat',
    description: 'Round-the-clock chat assistance from healthcare experts',
    free: false,
    premium: true
  }
];

const comparisonFeatures = [
  { feature: 'Monthly Consultations', free: '2 included', premium: 'Unlimited' },
  { feature: 'Consultation Length', free: '30 minutes', premium: '60 minutes' },
  { feature: 'Appointment Booking', free: 'Standard queue', premium: 'Priority booking' },
  { feature: 'Specialist Access', free: 'Limited', premium: 'Full access' },
  { feature: 'Health Analytics', free: 'Basic reports', premium: 'Advanced insights' },
  { feature: 'Family Caregivers', free: '2 caregivers', premium: 'Unlimited' },
  { feature: 'Health Records Storage', free: '100 MB', premium: 'Unlimited' },
  { feature: 'Chat Support', free: 'Business hours', premium: '24/7 support' },
  { feature: 'Prescription Management', free: 'Basic tracking', premium: 'Smart reminders' },
  { feature: 'Telehealth Features', free: 'Standard video', premium: 'HD + recording' }
];

export default function SubscriptionPage() {
  const { user } = useAuth();
  const { subscription, isLoading: loading } = useSubscription();
  const [isYearly, setIsYearly] = useState(false); // Default to Monthly
  const [processing, setProcessing] = useState(false);

  const pricingPlans: PricingPlan[] = [
    {
      id: 'monthly',
      name: 'Monthly Premium',
      price: 29.99,
      period: 'month',
      stripePriceId: 'price_monthly_premium', // Replace with actual Stripe price ID
      features: ['All Premium Features', 'Cancel Anytime', 'Instant Access']
    },
    {
      id: 'yearly',
      name: 'Yearly Premium',
      price: 299.99,
      period: 'year',
      stripePriceId: 'price_yearly_premium', // Replace with actual Stripe price ID
      originalPrice: 359.88,
      badge: 'Best Value',
      features: ['All Premium Features', '2 Months Free', 'Priority Support', 'Exclusive Health Reports']
    }
  ];

  const handleUpgrade = async (plan: PricingPlan) => {
    if (!user) {
      alert('Please log in to upgrade your subscription');
      return;
    }

    try {
      setProcessing(true);
      
      // Create checkout session via backend API
      const API_URL = import.meta.env.VITE_API_URL || 'https://health-management-app-joj5.onrender.com';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          userId: user.id,
          planId: plan.id,
          successUrl: `${window.location.origin}/subscription/success`,
          cancelUrl: `${window.location.origin}/subscription/cancel`,
        }),
      });

      const session = await response.json();

      if (session.error) {
        throw new Error(session.error);
      }

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({
          sessionId: session.sessionId,
        });

        if (error) {
          throw new Error(error.message);
        }
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Error processing payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const isPremium = subscription?.status === 'active' && subscription?.tier === 'premium';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  if (isPremium) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-lg">
          <CardContent className="text-center p-12">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-green-800 mb-4">You're Premium!</h2>
            <p className="text-green-700 text-lg mb-6">
              Enjoy all the exclusive features and priority healthcare services.
            </p>
            <div className="space-y-2 text-sm text-green-600">
              <p>Plan: {subscription?.plan === 'yearly' ? 'Yearly Premium' : 'Monthly Premium'}</p>
              <p>Status: {subscription?.status || 'Active'}</p>
              <p>Tier: {subscription?.tier || 'Premium'}</p>
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-200 px-4 py-2 text-lg mt-4">
              <Sparkles className="w-4 h-4 mr-2" />
              Premium Member
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Crown className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Upgrade to Premium</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Unlock better care and more features with our premium healthcare experience
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {premiumFeatures.map((feature, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow border-2 border-gray-100 hover:border-blue-200">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pricing Toggle */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Choose Your Plan</h3>
        <div className="flex flex-col items-center space-y-4 mb-8">
          <div className="flex items-center justify-center space-x-4 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-6 py-3 rounded-md font-semibold transition-all duration-300 ${
                !isYearly 
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Monthly - $29.99/mo
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-6 py-3 rounded-md font-semibold transition-all duration-300 relative ${
                isYearly 
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Yearly - $299.99/yr
              {isYearly && (
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Save 17%
                </span>
              )}
            </button>
          </div>
          {isYearly && (
            <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 text-sm px-4 py-2">
              🎉 Save $59.89 with yearly plan!
            </Badge>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card className="border-2 border-gray-200">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl text-gray-900">Free Plan</CardTitle>
              <div className="text-3xl font-bold text-gray-900">$0</div>
              <p className="text-gray-600">Basic healthcare features</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">2 consultations per month</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">30-minute sessions</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">Basic health analytics</span>
              </div>
              <div className="flex items-center space-x-2">
                <X className="w-4 h-4 text-red-500" />
                <span className="text-sm text-gray-500">Telehealth access</span>
              </div>
              <div className="flex items-center space-x-2">
                <X className="w-4 h-4 text-red-500" />
                <span className="text-sm text-gray-500">Priority booking</span>
              </div>
              <div className="flex items-center space-x-2">
                <X className="w-4 h-4 text-red-500" />
                <span className="text-sm text-gray-500">Specialist access</span>
              </div>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          {pricingPlans
            .filter(plan => (isYearly && plan.id === 'yearly') || (!isYearly && plan.id === 'monthly'))
            .map((plan) => (
              <Card key={plan.id} className="border-2 border-blue-500 relative overflow-hidden bg-gradient-to-b from-blue-50 to-white">
                {plan.badge && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-sm font-medium">
                    {plan.badge}
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl text-blue-900 flex items-center justify-center">
                    <Crown className="w-5 h-5 mr-2 text-yellow-500" />
                    Premium Plan
                  </CardTitle>
                  <div className="text-3xl font-bold text-blue-900">
                    ${plan.price}
                    <span className="text-lg text-gray-600">/{plan.period}</span>
                  </div>
                  {plan.originalPrice && (
                    <p className="text-green-600 text-sm font-medium">
                      Save ${(plan.originalPrice - plan.price).toFixed(2)}
                    </p>
                  )}
                  <p className="text-gray-600">Complete healthcare solution</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2 bg-purple-50 p-2 rounded-md border border-purple-200">
                    <Check className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-bold text-purple-900">🏥 Full Telehealth Access</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Unlimited video consultations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">24/7 doctor chat</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">60-minute sessions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Priority booking</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Specialist access</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Advanced analytics</span>
                  </div>
                </CardContent>
                <div className="p-6 pt-4">
                  <Button
                    onClick={() => handleUpgrade(plan)}
                    disabled={processing}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 text-lg"
                  >
                    {processing ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        Upgrade Now
                      </>
                    )}
                  </Button>
                  <div className="flex items-center justify-center mt-2 text-xs text-gray-500">
                    <Lock className="w-3 h-3 mr-1" />
                    Secure payment with Stripe
                  </div>
                </div>
              </Card>
            ))}
        </div>
      </div>

      {/* Detailed Comparison Table */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Feature Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 p-4 text-left font-semibold">Feature</th>
                <th className="border border-gray-200 p-4 text-center font-semibold">Free</th>
                <th className="border border-gray-200 p-4 text-center font-semibold bg-blue-50">
                  <div className="flex items-center justify-center">
                    <Crown className="w-4 h-4 text-yellow-500 mr-1" />
                    Premium
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-200 p-4 font-medium">{item.feature}</td>
                  <td className="border border-gray-200 p-4 text-center text-gray-600">{item.free}</td>
                  <td className="border border-gray-200 p-4 text-center bg-blue-50 font-medium text-blue-900">
                    {item.premium}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-green-600 mr-2" />
          <h4 className="text-xl font-semibold text-gray-900">Secure & Trusted</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
          <div>
            <div className="font-semibold text-gray-900 mb-1">HIPAA Compliant</div>
            <div>Your health data is protected with enterprise-grade security</div>
          </div>
          <div>
            <div className="font-semibold text-gray-900 mb-1">30-Day Money Back</div>
            <div>Not satisfied? Get a full refund within 30 days</div>
          </div>
          <div>
            <div className="font-semibold text-gray-900 mb-1">Cancel Anytime</div>
            <div>No long-term commitments, cancel your subscription anytime</div>
          </div>
        </div>
      </div>
    </div>
  );
}