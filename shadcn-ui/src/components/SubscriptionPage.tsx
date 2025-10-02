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
import { createClient } from '@supabase/supabase-js';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_stripe_key');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

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
    icon: <Calendar className="w-5 h-5 text-blue-600" />,
    title: 'Priority Booking',
    description: 'Skip the wait and book appointments instantly',
    free: false,
    premium: true
  },
  {
    icon: <Clock className="w-5 h-5 text-green-600" />,
    title: 'Extended Consultations',
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
    title: '24/7 Chat Support',
    description: 'Round-the-clock assistance from healthcare experts',
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
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [isYearly, setIsYearly] = useState(true);
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

  useEffect(() => {
    if (user) {
      fetchCurrentSubscription();
    }
  }, [user]);

  const fetchCurrentSubscription = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
        return;
      }

      setCurrentSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan: PricingPlan) => {
    if (!user) {
      alert('Please log in to upgrade your subscription');
      return;
    }

    try {
      setProcessing(true);
      
      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

  const isPremium = currentSubscription?.status === 'active' && 
    (currentSubscription?.plan_id === 'monthly' || currentSubscription?.plan_id === 'yearly');

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
              <p>Plan: {currentSubscription?.plan_id === 'yearly' ? 'Yearly Premium' : 'Monthly Premium'}</p>
              <p>Status: Active</p>
              <p>Expires: {new Date(currentSubscription?.end_date || '').toLocaleDateString()}</p>
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
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Plan</h3>
        <div className="flex items-center justify-center space-x-4 mb-8">
          <span className={`font-medium ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
            Monthly
          </span>
          <Switch
            checked={isYearly}
            onCheckedChange={setIsYearly}
            className="data-[state=checked]:bg-green-600"
          />
          <span className={`font-medium ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
            Yearly
          </span>
          {isYearly && (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              Save $59.89
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
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Unlimited consultations</span>
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
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">24/7 chat support</span>
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