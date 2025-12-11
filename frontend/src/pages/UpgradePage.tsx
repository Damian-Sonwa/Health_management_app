import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Crown, 
  Check, 
  ArrowLeft, 
  CreditCard, 
  Shield, 
  Heart, 
  Activity, 
  Users, 
  Clock, 
  Star,
  Zap,
  Lock,
  Calendar,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';

interface UpgradePageProps {
  onBack: () => void;
}

export default function UpgradePage({ onBack }: UpgradePageProps) {
  const { user } = useAuth();
  const { updateSubscription } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPayment, setSelectedPayment] = useState<'stripe' | 'paypal' | 'payoneer' | 'bank'>('stripe');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'plan' | 'payment' | 'confirmation'>('plan');
  
  // Payment form states
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: '',
    city: '',
    zipCode: '',
    country: ''
  });

  const [paypalForm, setPaypalForm] = useState({
    email: user?.email || '',
    password: ''
  });

  const [payoneerForm, setPayoneerForm] = useState({
    email: user?.email || '',
    password: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const planDetails = {
    monthly: {
      price: 20,
      period: 'month',
      savings: null,
      description: 'Perfect for getting started'
    },
    yearly: {
      price: 200,
      period: 'year',
      savings: 40,
      description: 'Best value - 2 months free!'
    }
  };

  const features = [
    { icon: Heart, text: 'Unlimited vital sign tracking', premium: true },
    { icon: Activity, text: 'Advanced health analytics & AI insights', premium: true },
    { icon: Users, text: 'Family sharing & caregiver access', premium: true },
    { icon: Clock, text: 'Real-time health monitoring', premium: true },
    { icon: Star, text: 'Priority customer support', premium: true },
    { icon: Shield, text: 'Enhanced data security & encryption', premium: true },
  ];

  const paymentMethods = [
    {
      id: 'stripe',
      name: 'Credit/Debit Card',
      description: 'Visa, MasterCard, American Express',
      icon: CreditCard,
      popular: true
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Pay with your PayPal account',
      icon: DollarSign,
      popular: false
    },
    {
      id: 'payoneer',
      name: 'Payoneer',
      description: 'Global payment platform',
      icon: DollarSign,
      popular: false
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      description: 'Direct bank account transfer',
      icon: DollarSign,
      popular: false
    }
  ];

  const validateCardForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!cardForm.cardNumber || cardForm.cardNumber.length < 16) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }
    if (!cardForm.expiryDate || !/^\d{2}\/\d{2}$/.test(cardForm.expiryDate)) {
      newErrors.expiryDate = 'Please enter MM/YY format';
    }
    if (!cardForm.cvv || cardForm.cvv.length < 3) {
      newErrors.cvv = 'Please enter a valid CVV';
    }
    if (!cardForm.cardholderName) {
      newErrors.cardholderName = 'Cardholder name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Validate payment method
      if (selectedPayment === 'stripe' || selectedPayment === 'bank') {
        if (!validateCardForm()) {
          setIsProcessing(false);
          return;
        }
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update subscription
      await updateSubscription('premium', selectedPlan);
      
      setCurrentStep('confirmation');
    } catch (error) {
      console.error('Payment failed:', error);
      setErrors({ general: 'Payment failed. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  if (currentStep === 'confirmation') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to Premium!
            </h2>
            <p className="text-gray-600 mb-6">
              Your subscription has been activated successfully. You now have access to all premium features.
            </p>
            <Button onClick={onBack} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Button>
          <div className="flex items-center space-x-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Upgrade to Premium
            </h1>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep === 'plan' ? 'bg-blue-500 text-white' : 'bg-blue-500 text-white'
            }`}>
              1
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep === 'payment' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
          </div>
        </div>

        {currentStep === 'plan' && (
          <div className="space-y-8">
            {/* Plan Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Choose Your Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Plan Toggle */}
                <div className="flex items-center justify-center">
                  <div className="bg-gray-100 rounded-lg p-1 flex">
                    <button
                      onClick={() => setSelectedPlan('monthly')}
                      className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                        selectedPlan === 'monthly'
                          ? 'bg-white shadow-sm text-gray-900'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setSelectedPlan('yearly')}
                      className={`px-6 py-2 rounded-md text-sm font-medium transition-all relative ${
                        selectedPlan === 'yearly'
                          ? 'bg-white shadow-sm text-gray-900'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Yearly
                      <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1">
                        Save $40
                      </Badge>
                    </button>
                  </div>
                </div>

                {/* Selected Plan Details */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    ${planDetails[selectedPlan].price}
                    <span className="text-lg text-gray-600">/{planDetails[selectedPlan].period}</span>
                  </div>
                  <p className="text-gray-600">{planDetails[selectedPlan].description}</p>
                  {planDetails[selectedPlan].savings && (
                    <p className="text-green-600 font-medium mt-2">
                      Save ${planDetails[selectedPlan].savings} per year!
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-500" />
                      <feature.icon className="w-5 h-5 text-purple-500" />
                      <span className="text-sm">{feature.text}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={() => setCurrentStep('payment')}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3"
                >
                  Continue to Payment
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 'payment' && (
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Order Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Premium Plan ({selectedPlan})</p>
                    <p className="text-sm text-gray-600">{planDetails[selectedPlan].description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">${planDetails[selectedPlan].price}</p>
                    <p className="text-sm text-gray-600">per {planDetails[selectedPlan].period}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Payment Method</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Payment Method Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setSelectedPayment(method.id as any)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all relative ${
                        selectedPayment === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {method.popular && (
                        <Badge className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs">
                          Popular
                        </Badge>
                      )}
                      <div className="flex items-center space-x-3">
                        <method.icon className="w-6 h-6 text-gray-600" />
                        <div>
                          <p className="font-medium">{method.name}</p>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Payment Forms */}
                <div className="mt-6">
                  {(selectedPayment === 'stripe' || selectedPayment === 'bank') && (
                    <div className="space-y-4">
                      <h3 className="font-medium">Card Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <Label htmlFor="cardNumber">Card Number</Label>
                          <Input
                            id="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            value={cardForm.cardNumber}
                            onChange={(e) => setCardForm({
                              ...cardForm,
                              cardNumber: formatCardNumber(e.target.value)
                            })}
                            className={errors.cardNumber ? 'border-red-500' : ''}
                          />
                          {errors.cardNumber && (
                            <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input
                            id="expiryDate"
                            placeholder="MM/YY"
                            value={cardForm.expiryDate}
                            onChange={(e) => setCardForm({...cardForm, expiryDate: e.target.value})}
                            className={errors.expiryDate ? 'border-red-500' : ''}
                          />
                          {errors.expiryDate && (
                            <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={cardForm.cvv}
                            onChange={(e) => setCardForm({...cardForm, cvv: e.target.value})}
                            className={errors.cvv ? 'border-red-500' : ''}
                          />
                          {errors.cvv && (
                            <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>
                          )}
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="cardholderName">Cardholder Name</Label>
                          <Input
                            id="cardholderName"
                            placeholder="John Doe"
                            value={cardForm.cardholderName}
                            onChange={(e) => setCardForm({...cardForm, cardholderName: e.target.value})}
                            className={errors.cardholderName ? 'border-red-500' : ''}
                          />
                          {errors.cardholderName && (
                            <p className="text-red-500 text-xs mt-1">{errors.cardholderName}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedPayment === 'paypal' && (
                    <div className="space-y-4">
                      <h3 className="font-medium">PayPal Account</h3>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="paypalEmail">PayPal Email</Label>
                          <Input
                            id="paypalEmail"
                            type="email"
                            value={paypalForm.email}
                            onChange={(e) => setPaypalForm({...paypalForm, email: e.target.value})}
                          />
                        </div>
                        <p className="text-sm text-gray-600">
                          You will be redirected to PayPal to complete your payment securely.
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedPayment === 'payoneer' && (
                    <div className="space-y-4">
                      <h3 className="font-medium">Payoneer Account</h3>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="payoneerEmail">Payoneer Email</Label>
                          <Input
                            id="payoneerEmail"
                            type="email"
                            value={payoneerForm.email}
                            onChange={(e) => setPayoneerForm({...payoneerForm, email: e.target.value})}
                          />
                        </div>
                        <p className="text-sm text-gray-600">
                          You will be redirected to Payoneer to complete your payment securely.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {errors.general && (
                  <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-700">{errors.general}</span>
                  </div>
                )}

                {/* Security Notice */}
                <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg border border-green-200">
                  <Lock className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-700">
                    Your payment information is encrypted and secure. We never store your card details.
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep('plan')}
                    className="flex-1"
                  >
                    Back to Plan
                  </Button>
                  <Button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    {isProcessing ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4" />
                        <span>Complete Payment</span>
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}