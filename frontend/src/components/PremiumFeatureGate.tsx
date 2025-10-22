import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Lock, Zap } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

interface PremiumFeatureGateProps {
  children: ReactNode;
  feature: string;
  fallback?: ReactNode;
  showUpgrade?: boolean;
  onUpgrade?: () => void;
}

export default function PremiumFeatureGate({ 
  children, 
  feature, 
  fallback, 
  showUpgrade = true,
  onUpgrade 
}: PremiumFeatureGateProps) {
  const { hasFeatureAccess, isPremium, isTrialActive, daysUntilExpiry } = useSubscription();

  // If user has access to the feature, render children
  if (hasFeatureAccess(feature)) {
    return <>{children}</>;
  }

  // If custom fallback is provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default premium gate UI
  return (
    <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
      <CardHeader className="text-center pb-4">
        <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="flex items-center justify-center space-x-2">
          <Lock className="w-5 h-5 text-gray-600" />
          <span>Premium Feature</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-gray-600">
          This feature is available for Premium subscribers only.
        </p>
        
        {isTrialActive && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 mb-2">
              <Zap className="w-3 h-3 mr-1" />
              Trial Active
            </Badge>
            <p className="text-sm text-blue-700">
              Your trial expires in {daysUntilExpiry} days. Upgrade to continue accessing premium features.
            </p>
          </div>
        )}

        {showUpgrade && (
          <div className="space-y-3">
            <div className="text-sm text-gray-500">
              Upgrade to Premium to unlock:
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Unlimited consultations</li>
              <li>• Priority booking</li>
              <li>• Advanced analytics</li>
              <li>• 24/7 support</li>
            </ul>
            
            <Button
              onClick={onUpgrade}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}