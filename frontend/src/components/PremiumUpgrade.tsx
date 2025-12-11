import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Crown, 
  Check, 
  X, 
  Calendar, 
  Clock, 
  Users, 
  BarChart3, 
  Heart, 
  FileText, 
  MessageCircle,
  Star,
  Zap,
  Shield
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://your-project-url.supabase.co';
const supabaseKey = 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

interface SubscriptionStatus {
  is_premium: boolean;
  plan_type: 'free' | 'monthly' | 'yearly';
  expires_at: string | null;
  features: string[];
}

interface PremiumUpgradeProps {
  isOpen: boolean;
  onClose: () => void;
}

const premiumFeatures = [
  {
    icon: Calendar,
    title: 'Priority Booking',
    description: 'Skip the wait with priority appointment scheduling',
    color: 'text-blue-600'
  },
  {
    icon: Clock,
    title: 'Extended Consultations',
    description: '45-minute sessions instead of standard 30-minute calls',
    color: 'text-green-600'
  },
  {
    icon: Users,
    title: 'Specialist Access',
    description: 'Direct access to specialists and expert consultations',
    color: 'text-purple-600'
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Detailed health insights and personalized recommendations',
    color: 'text-orange-600'
  },
  {
    icon: Heart,
    title: 'Family Support',
    description: 'Add unlimited caregivers and family member access',
    color: 'text-red-600'
  },
  {
    icon: FileText,
    title: 'Unlimited Records',
    description: 'Store unlimited health records and medical documents',
    color: 'text-indigo-600'
  },
  {
    icon: MessageCircle,
    title: '24/7 Chat Support',
    description: 'Round-the-clock support from healthcare professionals',
    color: 'text-teal-600'
  }
];

const comparisonFeatures = [
  { feature: 'Monthly Consultations', free: '2 included', premium: 'Unlimited' },
  { feature: 'Consultation Length', free: '30 minutes', premium: '45 minutes' },
  { feature: 'Appointment Booking', free: 'Standard queue', premium: 'Priority booking' },
  { feature: 'Specialist Access', free: 'Limited', premium: 'Full access' },
  { feature: 'Health Analytics', free: 'Basic reports', premium: 'Advanced insights' },
  { feature: 'Family Caregivers', free: '2 caregivers', premium: 'Unlimited' },
  { feature: 'Health Records Storage', free: '100 MB', premium: 'Unlimited' },
  { feature: 'Chat Support', free: 'Business hours', premium: '24/7 support' },
  { feature: 'Prescription Management', free: 'Basic tracking', premium: 'Smart reminders' },
  { feature: 'Telehealth Features', free: 'Standard video', premium: 'HD + recording' }
];

export default function PremiumUpgrade({ isOpen, onClose }: PremiumUpgradeProps) {
  const { user } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    is_premium: false,
    plan_type: 'free',
    expires_at: null,
    features: []
  });
  const [loading, setLoading] = useState(true);
  const [yearlyPlan, setYearlyPlan] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchSubscriptionStatus();
    }
  }, [isOpen, user]);

  const fetchSubscriptionStatus = async () => {
    try {
      setLoading(true);
      
      // In production, this would be an actual Supabase query
      // const { data, error } = await supabase
      //   .from('user_subscriptions')
      //   .select('*')
      //   .eq('user_id', user.id)
      //   .single();
      
      // For now, using sample data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const sampleStatus: SubscriptionStatus = {
        is_premium: false,
        plan_type: 'free',
        expires_at: null,
        features: ['basic_consultations', 'standard_booking', 'basic_analytics']
      };
      
      setSubscriptionStatus(sampleStatus);
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planType: 'monthly' | 'yearly') => {
    try {
      setUpgrading(true);
      
      // In production, this would integrate with Stripe or payment processor
      // const { data, error } = await supabase
      //   .from('user_subscriptions')
      //   .upsert({
      //     user_id: user.id,
      //     plan_type: planType,
      //     is_premium: true,
      //     expires_at: new Date(Date.now() + (planType === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString()
      //   });
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update local state
      setSubscriptionStatus({
        is_premium: true,
        plan_type: planType,
        expires_at: new Date(Date.now() + (planType === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
        features: ['all_premium_features']
      });
      
      alert(`Successfully upgraded to ${planType} premium plan!`);
      onClose();
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      alert('Error processing upgrade. Please try again.');
    } finally {
      setUpgrading(false);
    }
  };

  const monthlyPrice = 29;
  const yearlyPrice = 299; // 2 months free
  const monthlySavings = (monthlyPrice * 12) - yearlyPrice;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 text-white p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Crown className="w-12 h-12 text-yellow-300 mr-3" />
            <h2 className="text-4xl font-bold">Upgrade to Premium</h2>
          </div>
          <p className="text-xl text-blue-100">
            Unlock better care and more features for your health journey
          </p>
          <div className="flex items-center justify-center mt-4">
            <Star className="w-5 h-5 text-yellow-300 mr-1" />
            <Star className="w-5 h-5 text-yellow-300 mr-1" />
            <Star className="w-5 h-5 text-yellow-300 mr-1" />
            <Star className="w-5 h-5 text-yellow-300 mr-1" />
            <Star className="w-5 h-5 text-yellow-300 mr-2" />
            <span className="text-blue-100">Trusted by 50,000+ patients</span>
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20"
          >
            ×
          </Button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(95vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading subscription details...</p>
              </div>
            </div>
          ) : subscriptionStatus.is_premium ? (
            <div className="text-center py-12">
              <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">You're Already Premium!</h3>
              <p className="text-gray-600 mb-4">
                Enjoy all premium features until {new Date(subscriptionStatus.expires_at!).toLocaleDateString()}
              </p>
              <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
                Continue to Dashboard
              </Button>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Feature Highlights */}
              <div>
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium Features</h3>
                  <p className="text-gray-600">Everything you need for comprehensive healthcare management</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {premiumFeatures.map((feature, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow border-2 hover:border-blue-200">
                      <CardContent className="p-6 text-center">
                        <div className={`w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4`}>
                          <feature.icon className={`w-6 h-6 ${feature.color}`} />
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Pricing Toggle */}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Plan</h3>
                <div className="flex items-center justify-center space-x-4 mb-8">
                  <span className={`font-medium ${!yearlyPlan ? 'text-gray-900' : 'text-gray-500'}`}>
                    Monthly
                  </span>
                  <Switch
                    checked={yearlyPlan}
                    onCheckedChange={setYearlyPlan}
                    className="data-[state=checked]:bg-green-600"
                  />
                  <span className={`font-medium ${yearlyPlan ? 'text-gray-900' : 'text-gray-500'}`}>
                    Yearly
                  </span>
                  {yearlyPlan && (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Save ${monthlySavings}
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
                  <Card className="border-2 border-blue-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-sm font-medium">
                      Best Value
                    </div>
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-xl text-blue-900 flex items-center justify-center">
                        <Crown className="w-5 h-5 mr-2 text-yellow-500" />
                        Premium Plan
                      </CardTitle>
                      <div className="text-3xl font-bold text-blue-900">
                        ${yearlyPlan ? Math.round(yearlyPrice / 12) : monthlyPrice}
                        <span className="text-lg text-gray-600">/month</span>
                      </div>
                      {yearlyPlan && (
                        <p className="text-green-600 text-sm font-medium">
                          Billed annually (${yearlyPrice}/year)
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
                        <span className="text-sm font-medium">45-minute sessions</span>
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
                        onClick={() => handleUpgrade(yearlyPlan ? 'yearly' : 'monthly')}
                        disabled={upgrading}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 text-lg"
                      >
                        {upgrading ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
                          </div>
                        ) : (
                          <>
                            <Zap className="w-5 h-5 mr-2" />
                            Upgrade Now
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
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
          )}
        </div>
      </div>
    </div>
  );
}