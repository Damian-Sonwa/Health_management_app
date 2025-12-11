import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Crown, Sparkles } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

export default function SubscriptionSuccess() {
  const router = useRouter();
  const { refreshSubscription, subscription } = useSubscription();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Refresh subscription data after successful payment
    const timer = setTimeout(() => {
      refreshSubscription();
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [refreshSubscription]);

  const handleContinue = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-2xl text-green-800 mb-2">
            Payment Successful!
          </CardTitle>
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2">
            <Crown className="w-4 h-4 mr-2" />
            Welcome to Premium
          </Badge>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">
              Your Premium Features Are Now Active!
            </h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>✓ Unlimited consultations</li>
              <li>✓ Priority appointment booking</li>
              <li>✓ Advanced health analytics</li>
              <li>✓ 24/7 chat support</li>
              <li>✓ Unlimited family caregivers</li>
            </ul>
          </div>

          {subscription && (
            <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
              <p><strong>Plan:</strong> {subscription.plan_id === 'yearly' ? 'Yearly Premium' : 'Monthly Premium'}</p>
              <p><strong>Status:</strong> Active</p>
              <p><strong>Next billing:</strong> {new Date(subscription.end_date).toLocaleDateString()}</p>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Continue to Dashboard
            </Button>
            
            <p className="text-xs text-gray-500">
              You will receive a confirmation email shortly with your receipt and subscription details.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}