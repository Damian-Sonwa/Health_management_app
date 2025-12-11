import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Stethoscope, GraduationCap, FileText, Phone, Loader2, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import { toast } from 'sonner';
import { useAuth } from '@/components/AuthContext';

export default function DoctorOnboarding() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    specialty: '',
    experience: '',
    licenseId: '',
    phone: '',
    bio: '',
    profileImage: ''
  });

  const [formInitialized, setFormInitialized] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    // Check if user is doctor
    if (!user || user.role !== 'doctor') {
      navigate('/auth', { replace: true });
      return;
    }

    // Check if already completed onboarding - ROUTE GUARD
    const checkOnboardingStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userId = user?.id || user?._id;
        if (!userId) {
          navigate('/auth', { replace: true });
          return;
        }

        // Check doctor record
        const response = await fetch(`${API_BASE_URL}/doctors?userId=${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
          const doctor = data.data[0];
          
          // ROUTE GUARD: If onboarding is already completed, redirect immediately - NEVER show form again
          if (doctor.onboardingCompleted) {
            setOnboardingCompleted(true);
            // Force logout immediately
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            
            // If approved, go to dashboard (but this shouldn't happen if they're accessing onboarding)
            if (doctor.status === 'approved') {
              navigate('/doctor-dashboard', { replace: true });
              return;
            }
            // If pending or rejected, redirect to auth with message
            if (doctor.status === 'rejected') {
              const reason = encodeURIComponent(doctor.rejectionReason || 'Your registration has been rejected.');
              navigate(`/auth?msg=rejected&reason=${reason}`, { replace: true });
            } else {
              navigate('/auth?msg=pending', { replace: true });
            }
            return;
          }
          
          // If rejected, handle rejection
          if (doctor.status === 'rejected') {
            const reason = doctor.rejectionReason || 'Your registration has been rejected.';
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            toast.error(reason);
            navigate('/auth', { replace: true });
            return;
          }
          
          // Pre-fill form ONLY if onboarding not completed and form hasn't been initialized
          if (!formInitialized && !doctor.onboardingCompleted) {
            setFormData({
              specialty: doctor.specialty || '',
              experience: doctor.experience?.toString() || '',
              licenseId: doctor.licenseId || '',
              phone: doctor.phoneNumber || user.phone || '',
              bio: doctor.bio || '',
              profileImage: doctor.profileImage || ''
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
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
          setFormData(prev => ({ ...prev, profileImage: fileUrl }));
          toast.success('Profile image uploaded successfully');
        } else {
          throw new Error('File URL not found in response');
        }
      } else {
        throw new Error(data.message || 'Failed to upload file');
      }
    } catch (error: any) {
      console.error('File upload error:', error);
      toast.error('Failed to upload image: ' + (error.message || 'Unknown error'));
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
    
    if (!formData.specialty.trim()) {
      toast.error('Medical specialty is required');
      return;
    }

    if (!formData.licenseId.trim()) {
      toast.error('Medical license ID is required');
      return;
    }

    if (!formData.phone.trim()) {
      toast.error('Phone number is required');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('authToken');
      
      // Update user profile
      const userResponse = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          phone: formData.phone,
          specialty: formData.specialty,
          experience: parseInt(formData.experience) || 0,
          licenseId: formData.licenseId
        })
      });

      const userData = await userResponse.json();
      
      if (!userResponse.ok && !userData.success) {
        throw new Error(userData.message || 'Failed to update user profile');
      }

      // Create or update doctor record with onboarding completed
      const doctorResponse = await fetch(`${API_BASE_URL}/doctors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          specialty: formData.specialty,
          experience: parseInt(formData.experience) || 0,
          licenseId: formData.licenseId,
          phoneNumber: formData.phone,
          profileImage: formData.profileImage,
          bio: formData.bio,
          onboardingCompleted: true,
          status: 'pending' // Set to pending for admin approval
        })
      });

      const doctorData = await doctorResponse.json();
      
      if (doctorResponse.ok || doctorData.success) {
        // Mark as completed immediately to prevent any further access
        setOnboardingCompleted(true);
        
        // Clear form data
        setFormData({
          specialty: '',
          experience: '',
          licenseId: '',
          phone: '',
          bio: '',
          profileImage: ''
        });
        
        toast.success('Your account is pending approval. You will be redirected to login.', {
          duration: 2000
        });
        
        // Logout immediately and redirect to auth page with pending message
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        
        // Redirect immediately with query param - use replace to prevent going back
        setTimeout(() => {
          navigate('/auth?msg=pending', { replace: true });
        }, 1000);
      } else {
        throw new Error(doctorData.message || 'Failed to complete onboarding');
      }
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to complete onboarding: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  if (!user || user.role !== 'doctor') {
    return null;
  }

  const specialties = [
    'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology', 'General Practice',
    'Internal Medicine', 'Neurology', 'Obstetrics & Gynecology', 'Oncology', 'Ophthalmology',
    'Orthopedics', 'Pediatrics', 'Psychiatry', 'Pulmonology', 'Radiology', 'Surgery', 'Urology', 'Other'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Card className="border-2 border-green-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Stethoscope className="w-6 h-6" />
              Doctor Onboarding
            </CardTitle>
            <CardDescription className="text-green-100 mt-2">
              Complete your professional registration. Your account will be reviewed by our admin team before approval.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Specialty */}
              <div className="space-y-2">
                <Label htmlFor="specialty" className="text-base font-semibold">
                  Medical Specialty *
                </Label>
                <Select
                  value={formData.specialty}
                  onValueChange={(value) => handleChange('specialty', value)}
                  required
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select your specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((spec) => (
                      <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Years of Experience */}
              <div className="space-y-2">
                <Label htmlFor="experience" className="text-base font-semibold">
                  Years of Experience *
                </Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  max="50"
                  value={formData.experience}
                  onChange={(e) => handleChange('experience', e.target.value)}
                  required
                  placeholder="e.g., 10"
                  className="h-11"
                />
              </div>

              {/* License ID */}
              <div className="space-y-2">
                <Label htmlFor="licenseId" className="text-base font-semibold">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Medical License Number *
                </Label>
                <Input
                  id="licenseId"
                  value={formData.licenseId}
                  onChange={(e) => handleChange('licenseId', e.target.value)}
                  required
                  placeholder="Enter your medical license number"
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

              {/* Profile Image */}
              <div className="space-y-2">
                <Label htmlFor="profileImage" className="text-base font-semibold">
                  <Upload className="w-4 h-4 inline mr-2" />
                  Profile Image (Optional)
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    className="hidden"
                    id="profile-upload"
                  />
                  <label htmlFor="profile-upload" className="cursor-pointer flex flex-col items-center">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      {formData.profileImage ? 'Image uploaded ✓' : 'Click to upload profile image'}
                    </p>
                  </label>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-base font-semibold">
                  Professional Bio (Optional)
                </Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  placeholder="Tell patients about your background and expertise (optional)"
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
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
            
            {/* Navigation Buttons */}
            <div className="flex gap-4 justify-center pt-6 border-t mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/auth')}
                className="min-w-[150px]"
              >
                Return to Login Page
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/')}
                className="min-w-[150px]"
              >
                Back to Landing Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

