import { useRouter } from 'next/router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, Crown } from 'lucide-react';

export default function SubscriptionCancel() {
  const router = useRouter();

  const handleGoBack = () => {
    router.push('/subscription');
  };

  const handleTryAgain = () => {
    router.push('/subscription');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-2xl text-red-800 mb-2">
            Payment Cancelled
          </CardTitle>
          <p className="text-gray-600">
            Your subscription upgrade was cancelled. No charges were made.
          </p>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">
              Still interested in Premium?
            </h3>
            <p className="text-sm text-blue-700 mb-3">
              Unlock unlimited consultations, priority booking, and advanced health analytics.
            </p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>✓ 60-minute consultation sessions</li>
              <li>✓ Direct access to specialists</li>
              <li>✓ Advanced health insights</li>
              <li>✓ 24/7 premium support</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleTryAgain}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Crown className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <Button
              onClick={handleGoBack}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
            <p><strong>Need help?</strong></p>
            <p>Contact our support team if you experienced any issues during checkout.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}