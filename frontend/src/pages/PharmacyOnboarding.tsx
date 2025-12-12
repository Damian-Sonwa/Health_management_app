import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building, MapPin, Phone, FileText, Loader2, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import { toast } from 'sonner';
import { useAuth } from '@/components/AuthContext';

export default function PharmacyOnboarding() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    pharmacyName: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    },
    licenseId: '',
    reasonForJoining: '',
    logo: ''
  });

  const [formInitialized, setFormInitialized] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    // Check if user is pharmacy
    if (!user || user.role !== 'pharmacy') {
      navigate('/auth', { replace: true });
      return;
    }

    // Check if already completed onboarding - ROUTE GUARD
    const checkOnboardingStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const pharmacyId = user?.id || user?._id;
        if (!pharmacyId) {
          navigate('/auth', { replace: true });
          return;
        }

        const response = await fetch(`${API_BASE_URL}/pharmacies/${pharmacyId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success && data.data) {
          const pharmacy = data.data;
          
          // ROUTE GUARD: If approved, redirect immediately to dashboard - NEVER show form
          if (pharmacy.status === 'approved') {
            navigate('/pharmacy-dashboard', { replace: true });
            return;
          }
          
          // ROUTE GUARD: If onboarding is already completed, redirect immediately - NEVER show form again
          if (pharmacy.onboardingCompleted) {
            setOnboardingCompleted(true);
            // Force logout immediately
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            
            // If pending or rejected, redirect to auth with message
            if (pharmacy.status === 'rejected') {
              const reason = encodeURIComponent(pharmacy.rejectionReason || 'Your registration has been rejected.');
              navigate(`/auth?msg=rejected&reason=${reason}`, { replace: true });
            } else {
              navigate('/auth?msg=pending', { replace: true });
            }
            return;
          }
          
          // If rejected, handle rejection
          if (pharmacy.status === 'rejected') {
            const reason = pharmacy.rejectionReason || 'Your registration has been rejected.';
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            toast.error(reason);
            navigate('/auth', { replace: true });
            return;
          }
          
          // Pre-fill form ONLY if onboarding not completed and form hasn't been initialized
          if (!formInitialized && pharmacy.pharmacyName && pharmacy.pharmacyName !== 'Pending Pharmacy Name') {
            setFormData({
              pharmacyName: pharmacy.pharmacyName || '',
              phone: pharmacy.phone || user.phone || '',
              address: pharmacy.address || {
                street: '',
                city: '',
                state: '',
                zipCode: '',
                country: 'USA'
              },
              licenseId: pharmacy.licenseId || '',
              reasonForJoining: '',
              logo: pharmacy.logo || ''
            });
            setFormInitialized(true);
          }
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // On error, allow user to continue (don't block them)
      }
    };

    // Check once on mount - no intervals
    checkOnboardingStatus();
  }, [user, navigate, formInitialized]);

  const handleChange = (field: string, value: any) => {
    // Prevent changes if onboarding is already completed
    if (onboardingCompleted) {
      return;
    }
    
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setFormData(prev => {
        // Preserve existing address object - don't recreate it
        const currentAddress = prev.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'USA'
        };
        
        // Only update the specific field, preserve all others
        return {
          ...prev,
          address: {
            ...currentAddress,
            [addressField]: value
          }
        };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/file-attachments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || 'Failed to upload file' };
        }
        throw new Error(errorData.message || 'Failed to upload file');
      }

      const data = await response.json();
      if (data.success) {
        // Try multiple possible response formats
        const fileUrl = data.fileURL || data.data?.fileURL || data.data?.fileUrl || data.fileUrl;
        if (fileUrl) {
          setFormData(prev => ({ ...prev, logo: fileUrl }));
          toast.success('Logo uploaded successfully');
        } else {
          throw new Error('File URL not found in response');
        }
      } else {
        throw new Error(data.message || 'Failed to upload file');
      }
    } catch (error: any) {
      console.error('File upload error:', error);
      toast.error('Failed to upload logo: ' + (error.message || 'Unknown error'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent duplicate submissions
    if (onboardingCompleted) {
      toast.info('Onboarding already completed. Please wait for admin approval.');
      navigate('/auth', { replace: true });
      return;
    }
    
    if (!formData.pharmacyName.trim()) {
      toast.error('Pharmacy name is required');
      return;
    }

    if (!formData.phone.trim()) {
      toast.error('Phone number is required');
      return;
    }

    // Validate address fields safely - ensure address object exists
    const address = formData.address || {};
    const street = (address.street || '').trim();
    const city = (address.city || '').trim();
    const state = (address.state || '').trim();
    
    if (!street || !city || !state) {
      toast.error('Complete address (street, city, state) is required');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('authToken');
      
      // Ensure address object is properly structured for user update
      const address = formData.address || {};
      const addressData = {
        street: (address.street || '').trim(),
        city: (address.city || '').trim(),
        state: (address.state || '').trim(),
        zipCode: (address.zipCode || '').trim(),
        country: address.country || 'USA'
      };
      
      // Double-check validation before sending
      if (!addressData.street || !addressData.city || !addressData.state) {
        toast.error('Complete address (street, city, state) is required');
        setSaving(false);
        return;
      }
      
      // Update user profile
      const userResponse = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          phone: formData.phone,
          pharmacyName: formData.pharmacyName,
          address: addressData,
          licenseId: formData.licenseId
        })
      });

      const userData = await userResponse.json();
      
      if (!userResponse.ok && !userData.success) {
        throw new Error(userData.message || 'Failed to update user profile');
      }

      // Create or update pharmacy record with onboarding completed
      // Reuse addressData from above
      const pharmacyResponse = await fetch(`${API_BASE_URL}/pharmacies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          pharmacyName: formData.pharmacyName,
          phone: formData.phone,
          address: addressData,
          licenseId: formData.licenseId,
          logo: formData.logo,
          onboardingCompleted: true,
          status: 'pending' // Set to pending for admin approval
        })
      });

      const pharmacyData = await pharmacyResponse.json();
      
      if (pharmacyResponse.ok || pharmacyData.success) {
        // Mark as completed immediately to prevent any further access
        setOnboardingCompleted(true);
        
        // Clear form data
        setFormData({
          pharmacyName: '',
          phone: '',
          address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'USA'
          },
          licenseId: '',
          reasonForJoining: '',
          logo: ''
        });
        
        toast.success('Your account is pending approval. You will be redirected to login.', {
          duration: 2000
        });
        
        // Logout immediately and redirect to auth page with pending message
        // Clear all auth data
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        
        // Force redirect immediately - don't wait for timeout
        // Use window.location to force a hard redirect and break any loops
        setTimeout(() => {
          window.location.href = '/auth?msg=pending';
        }, 1500);
      } else {
        throw new Error(pharmacyData.message || 'Failed to complete onboarding');
      }
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to complete onboarding: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  if (!user || user.role !== 'pharmacy') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Card className="border-2 border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Building className="w-6 h-6" />
              Pharmacy Onboarding
            </CardTitle>
            <CardDescription className="text-blue-100 mt-2">
              Complete your pharmacy registration. Your account will be reviewed by our admin team before approval.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Navigation Buttons - Moved to Top */}
            <div className="flex gap-4 justify-center mb-6 pb-4 border-b">
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  localStorage.removeItem('authToken');
                  localStorage.removeItem('user');
                  window.location.href = '/auth';
                }}
                className="min-w-[150px]"
              >
                Return to Login Page
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  localStorage.removeItem('authToken');
                  localStorage.removeItem('user');
                  window.location.href = '/';
                }}
                className="min-w-[150px]"
              >
                Back to Landing Page
              </Button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Pharmacy Name */}
              <div className="space-y-2">
                <Label htmlFor="pharmacyName" className="text-base font-semibold">
                  <Building className="w-4 h-4 inline mr-2" />
                  Pharmacy Name *
                </Label>
                <Input
                  id="pharmacyName"
                  value={formData.pharmacyName}
                  onChange={(e) => handleChange('pharmacyName', e.target.value)}
                  required
                  placeholder="Enter your pharmacy name"
                  className="h-11"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-base font-semibold">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Contact Phone *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  required
                  placeholder="+1234567890"
                  className="h-11"
                />
              </div>

              {/* Address */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Address *
                </Label>
                <Input
                  placeholder="Street Address *"
                  value={formData.address?.street || ''}
                  onChange={(e) => handleChange('address.street', e.target.value)}
                  required
                  className="h-11"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="City *"
                    value={formData.address?.city || ''}
                    onChange={(e) => handleChange('address.city', e.target.value)}
                    required
                    className="h-11"
                  />
                  <Input
                    placeholder="State *"
                    value={formData.address?.state || ''}
                    onChange={(e) => handleChange('address.state', e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                <Input
                  placeholder="Zip Code"
                  value={formData.address?.zipCode || ''}
                  onChange={(e) => handleChange('address.zipCode', e.target.value)}
                  className="h-11"
                />
              </div>

              {/* License ID */}
              <div className="space-y-2">
                <Label htmlFor="licenseId" className="text-base font-semibold">
                  <FileText className="w-4 h-4 inline mr-2" />
                  License Number
                </Label>
                <Input
                  id="licenseId"
                  value={formData.licenseId}
                  onChange={(e) => handleChange('licenseId', e.target.value)}
                  placeholder="Enter your pharmacy license number (optional)"
                  className="h-11"
                />
              </div>

              {/* Logo Upload */}
              <div className="space-y-2">
                <Label htmlFor="logo" className="text-base font-semibold">
                  <Upload className="w-4 h-4 inline mr-2" />
                  Pharmacy Logo (Optional)
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.svg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload" className="cursor-pointer flex flex-col items-center">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      {formData.logo ? 'Logo uploaded ✓' : 'Click to upload pharmacy logo'}
                    </p>
                  </label>
                </div>
              </div>

              {/* Reason for Joining */}
              <div className="space-y-2">
                <Label htmlFor="reasonForJoining" className="text-base font-semibold">
                  Reason for Joining (Optional)
                </Label>
                <Textarea
                  id="reasonForJoining"
                  value={formData.reasonForJoining}
                  onChange={(e) => handleChange('reasonForJoining', e.target.value)}
                  placeholder="Tell us why you want to join our platform (optional)"
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Onboarding
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

