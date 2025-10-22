import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Check, 
  Crown, 
  Zap, 
  Shield, 
  Heart, 
  Activity, 
  Users,
  Clock,
  Star,
  ArrowRight
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade?: () => void;
}

export default function SubscriptionModal({ isOpen, onClose, onUpgrade }: SubscriptionModalProps) {
  const { subscription } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

  if (!isOpen) return null;

  const handleUpgradeClick = () => {
    onClose();
    if (onUpgrade) {
      onUpgrade();
    }
  };

  const features = [
    { icon: Heart, text: 'Unlimited vital sign tracking' },
    { icon: Activity, text: 'Advanced health analytics' },
    { icon: Users, text: 'Family sharing & caregivers' },
    { icon: Shield, text: 'Priority customer support' },
    { icon: Clock, text: 'Real-time health monitoring' },
    { icon: Star, text: 'AI-powered health insights' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Crown className="w-8 h-8 text-yellow-500" />
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Upgrade to Premium
              </CardTitle>
            </div>
            <p className="text-gray-600">
              Unlock advanced health tracking and personalized insights
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Plan Toggle */}
          <div className="flex items-center justify-center">
            <div className="bg-gray-100 rounded-lg p-1 flex">
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  selectedPlan === 'monthly'
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedPlan('yearly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all relative ${
                  selectedPlan === 'yearly'
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
                <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1">
                  Save 17%
                </Badge>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free Plan */}
            <Card className="border-2 border-gray-200">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-lg">Free Plan</CardTitle>
                <div className="text-3xl font-bold">$0</div>
                <p className="text-sm text-gray-600">Basic health tracking</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Basic vital tracking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Limited data history</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Basic reports</span>
                </div>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="border-2 border-purple-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-500 to-pink-500 text-white px-3 py-1 text-xs font-medium">
                RECOMMENDED
              </div>
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-lg flex items-center justify-center space-x-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  <span>Premium Plan</span>
                </CardTitle>
                <div className="text-3xl font-bold">
                  ${selectedPlan === 'monthly' ? '20' : '200'}
                  <span className="text-lg text-gray-600">
                    /{selectedPlan === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
                {selectedPlan === 'yearly' && (
                  <p className="text-sm text-green-600 font-medium">
                    Save $40 per year!
                  </p>
                )}
              </CardHeader>
              
              <CardContent className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <feature.icon className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">{feature.text}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleUpgradeClick}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3"
            >
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>
                  Upgrade to Premium - ${selectedPlan === 'monthly' ? '20/month' : '200/year'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Button>
            
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              Maybe Later
            </Button>
          </div>

          {/* Features Highlight */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Why upgrade?</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Get detailed health insights and trends</li>
              <li>• Share data securely with family and doctors</li>
              <li>• Receive personalized health recommendations</li>
              <li>• Access premium support and priority features</li>
            </ul>
          </div>

          {/* Security Notice */}
          <div className="flex items-center space-x-2 text-xs text-gray-500 justify-center">
            <Shield className="w-4 h-4" />
            <span>Secure payment • Cancel anytime • 30-day money-back guarantee</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}