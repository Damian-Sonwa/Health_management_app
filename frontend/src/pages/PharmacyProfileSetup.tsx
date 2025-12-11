import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building, MapPin, Phone, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import { toast } from 'sonner';
import { useAuth } from '@/components/AuthContext';

export default function PharmacyProfileSetup() {
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
    description: ''
  });

  useEffect(() => {
    // Pre-fill form with existing user data if available
    if (user) {
      setFormData({
        pharmacyName: user.pharmacyName || '',
        phone: user.phone || '',
        address: typeof user.address === 'object' ? user.address : {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'USA'
        },
        licenseId: user.licenseId || '',
        description: ''
      });
    }
  }, [user]);

  const handleChange = (field: string, value: any) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.pharmacyName.trim()) {
      toast.error('Pharmacy name is required');
      return;
    }

    if (!formData.phone.trim()) {
      toast.error('Phone number is required');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('authToken');
      
      // First, update the user profile
      const userResponse = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          phone: formData.phone,
          pharmacyName: formData.pharmacyName,
          address: formData.address,
          licenseId: formData.licenseId
        })
      });

      const userData = await userResponse.json();
      
      if (!userResponse.ok && !userData.success) {
        throw new Error(userData.message || 'Failed to update user profile');
      }

      // Then, create or update the pharmacy record
      const pharmacyResponse = await fetch(`${API_BASE_URL}/pharmacies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          pharmacyName: formData.pharmacyName,
          phone: formData.phone,
          address: formData.address,
          licenseId: formData.licenseId,
          description: formData.description
        })
      });

      const pharmacyData = await pharmacyResponse.json();
      
      if (pharmacyResponse.ok || pharmacyData.success) {
        toast.success('Pharmacy profile setup completed successfully!');
        
        // Update user context
        if (updateUser) {
          updateUser({
            ...user,
            phone: formData.phone,
            pharmacyName: formData.pharmacyName,
            address: formData.address,
            licenseId: formData.licenseId
          });
        }
        
        // Update localStorage user data
        const updatedUser = {
          ...user,
          phone: formData.phone,
          pharmacyName: formData.pharmacyName,
          address: formData.address,
          licenseId: formData.licenseId
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Redirect to pharmacy dashboard
        setTimeout(() => {
          navigate('/pharmacy-dashboard', { replace: true });
        }, 1500);
      } else {
        throw new Error(pharmacyData.message || 'Failed to create pharmacy profile');
      }
    } catch (error: any) {
      console.error('Error setting up pharmacy profile:', error);
      toast.error('Failed to setup pharmacy profile: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  if (!user || user.role !== 'pharmacy') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">This page is only available for pharmacy users.</p>
            <Button onClick={() => navigate('/dashboard')} className="mt-4">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Card className="border-2 border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Building className="w-6 h-6" />
              Complete Your Pharmacy Profile
            </CardTitle>
            <CardDescription className="text-blue-100 mt-2">
              Please provide the following information to complete your pharmacy registration. 
              This information will be used to verify and display your pharmacy to patients.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
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
                  Phone Number *
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
                  placeholder="Street Address"
                  value={formData.address.street}
                  onChange={(e) => handleChange('address.street', e.target.value)}
                  required
                  className="h-11"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="City"
                    value={formData.address.city}
                    onChange={(e) => handleChange('address.city', e.target.value)}
                    required
                    className="h-11"
                  />
                  <Input
                    placeholder="State"
                    value={formData.address.state}
                    onChange={(e) => handleChange('address.state', e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                <Input
                  placeholder="Zip Code"
                  value={formData.address.zipCode}
                  onChange={(e) => handleChange('address.zipCode', e.target.value)}
                  required
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

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Tell patients about your pharmacy (optional)"
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/pharmacy-dashboard')}
                  className="flex-1"
                  disabled={saving}
                >
                  Skip for Now
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Setup
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


