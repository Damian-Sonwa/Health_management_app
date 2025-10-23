import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, 
  Phone, 
  Calendar, 
  UserCircle, 
  Droplet, 
  AlertCircle,
  UserPlus,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getAuthHeaders } from '@/utils/auth';
import { API_BASE_URL } from '@/config/api';

const steps = [
  { id: 1, name: 'Basic Info', icon: User },
  { id: 2, name: 'Health Details', icon: Droplet },
  { id: 3, name: 'Emergency Contact', icon: UserPlus }
];

export default function ProfileOnboarding() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    phone: '',
    dateOfBirth: '',
    gender: '',
    
    // Step 2: Health Details
    bloodType: '',
    allergies: '',
    
    // Step 3: Emergency Contact
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      // Basic info is optional, can proceed
      return true;
    }
    if (step === 2) {
      // Health details are optional
      return true;
    }
    if (step === 3) {
      // Emergency contact is optional but if started, should be complete
      if (formData.emergencyContactName || formData.emergencyContactPhone || formData.emergencyContactRelationship) {
        return !!(formData.emergencyContactName && formData.emergencyContactPhone && formData.emergencyContactRelationship);
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    } else {
      toast({
        title: "Incomplete Information",
        description: "Please complete all required fields before proceeding.",
        variant: "destructive"
      });
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSkip = () => {
    navigate('/dashboard');
    toast({
      title: "Welcome to NuviaCare! 🎉",
      description: "You can complete your profile anytime from the Profile page.",
    });
  };

  const handleComplete = async () => {
    if (!validateStep(currentStep)) {
      toast({
        title: "Incomplete Information",
        description: "Please complete all required fields or skip this step.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          phone: formData.phone,
          profile: {
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            bloodType: formData.bloodType,
            allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()) : [],
            emergencyContact: formData.emergencyContactName ? {
              name: formData.emergencyContactName,
              phone: formData.emergencyContactPhone,
              relationship: formData.emergencyContactRelationship
            } : undefined
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await response.json();
      
      // Update user context
      if (updateUser) {
        updateUser(updatedUser);
      }

      toast({
        title: "Profile Updated! ✅",
        description: "Your health profile has been successfully created.",
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. You can update it later from the Profile page.",
        variant: "destructive"
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Basic Information</h3>
              <p className="text-gray-600 dark:text-gray-400">Let's start with some basic details about you</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="pl-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="dob" className="text-gray-700 dark:text-gray-300">
                  Date of Birth
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="pl-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="gender" className="text-gray-700 dark:text-gray-300">
                  Gender
                </Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                    <div className="flex items-center">
                      <UserCircle className="h-5 w-5 text-gray-400 mr-2" />
                      <SelectValue placeholder="Select gender" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                    <SelectItem value="male" className="dark:text-white dark:focus:bg-gray-700">Male</SelectItem>
                    <SelectItem value="female" className="dark:text-white dark:focus:bg-gray-700">Female</SelectItem>
                    <SelectItem value="other" className="dark:text-white dark:focus:bg-gray-700">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say" className="dark:text-white dark:focus:bg-gray-700">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Droplet className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Health Details</h3>
              <p className="text-gray-600 dark:text-gray-400">Help us provide better care with your health information</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="bloodType" className="text-gray-700 dark:text-gray-300">
                  Blood Type
                </Label>
                <Select value={formData.bloodType} onValueChange={(value) => handleInputChange('bloodType', value)}>
                  <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                    <div className="flex items-center">
                      <Droplet className="h-5 w-5 text-gray-400 mr-2" />
                      <SelectValue placeholder="Select blood type" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                    <SelectItem value="A+" className="dark:text-white dark:focus:bg-gray-700">A+</SelectItem>
                    <SelectItem value="A-" className="dark:text-white dark:focus:bg-gray-700">A-</SelectItem>
                    <SelectItem value="B+" className="dark:text-white dark:focus:bg-gray-700">B+</SelectItem>
                    <SelectItem value="B-" className="dark:text-white dark:focus:bg-gray-700">B-</SelectItem>
                    <SelectItem value="AB+" className="dark:text-white dark:focus:bg-gray-700">AB+</SelectItem>
                    <SelectItem value="AB-" className="dark:text-white dark:focus:bg-gray-700">AB-</SelectItem>
                    <SelectItem value="O+" className="dark:text-white dark:focus:bg-gray-700">O+</SelectItem>
                    <SelectItem value="O-" className="dark:text-white dark:focus:bg-gray-700">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="allergies" className="text-gray-700 dark:text-gray-300">
                  Allergies
                </Label>
                <div className="relative">
                  <AlertCircle className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Textarea
                    id="allergies"
                    placeholder="e.g., Penicillin, Peanuts, Latex (separate with commas)"
                    value={formData.allergies}
                    onChange={(e) => handleInputChange('allergies', e.target.value)}
                    className="pl-10 min-h-[100px] dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Separate multiple allergies with commas</p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Emergency Contact</h3>
              <p className="text-gray-600 dark:text-gray-400">Who should we contact in case of emergency?</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="emergencyName" className="text-gray-700 dark:text-gray-300">
                  Contact Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="emergencyName"
                    type="text"
                    placeholder="Full name"
                    value={formData.emergencyContactName}
                    onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                    className="pl-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="emergencyPhone" className="text-gray-700 dark:text-gray-300">
                  Contact Phone
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="emergencyPhone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                    className="pl-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="relationship" className="text-gray-700 dark:text-gray-300">
                  Relationship
                </Label>
                <Select value={formData.emergencyContactRelationship} onValueChange={(value) => handleInputChange('emergencyContactRelationship', value)}>
                  <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                    <div className="flex items-center">
                      <UserCircle className="h-5 w-5 text-gray-400 mr-2" />
                      <SelectValue placeholder="Select relationship" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                    <SelectItem value="spouse" className="dark:text-white dark:focus:bg-gray-700">Spouse</SelectItem>
                    <SelectItem value="parent" className="dark:text-white dark:focus:bg-gray-700">Parent</SelectItem>
                    <SelectItem value="child" className="dark:text-white dark:focus:bg-gray-700">Child</SelectItem>
                    <SelectItem value="sibling" className="dark:text-white dark:focus:bg-gray-700">Sibling</SelectItem>
                    <SelectItem value="friend" className="dark:text-white dark:focus:bg-gray-700">Friend</SelectItem>
                    <SelectItem value="other" className="dark:text-white dark:focus:bg-gray-700">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="text-center border-b dark:border-gray-700 pb-6">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-teal-600 dark:text-teal-400" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome to NuviaCare!
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400 text-base mt-2">
            Let's set up your health profile to get you started
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;

                return (
                  <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCompleted 
                          ? 'bg-green-500 text-white' 
                          : isCurrent 
                            ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/50' 
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : (
                          <StepIcon className="w-6 h-6" />
                        )}
                      </div>
                      <span className={`text-xs mt-2 font-medium ${
                        isCurrent 
                          ? 'text-teal-600 dark:text-teal-400' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {step.name}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-1 mx-2 rounded transition-all duration-300 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <div className="mb-8">
            {renderStepContent()}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-4">
            <Button
              onClick={handleSkip}
              variant="ghost"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Skip for now
            </Button>

            <div className="flex gap-3">
              {currentStep > 1 && (
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Back
                </Button>
              )}

              {currentStep < steps.length ? (
                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={loading}
                  className="bg-gradient-to-r from-green-600 to-teal-600 text-white hover:from-green-700 hover:to-teal-700"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Complete Setup
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

