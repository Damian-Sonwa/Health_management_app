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

  useEffect(() => {
    // Check if user is doctor
    if (!user || user.role !== 'doctor') {
      navigate('/auth', { replace: true });
      return;
    }

    // Check if already completed onboarding and approval status
    const checkOnboardingStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userId = user?.id || user?._id;
        if (!userId) return;

        // Check doctor record
        const response = await fetch(`${API_BASE_URL}/doctors?userId=${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
          const doctor = data.data[0];
          // If already approved, redirect to dashboard immediately
          if (doctor.status === 'approved' && doctor.onboardingCompleted) {
            navigate('/doctor-dashboard', { replace: true });
            return;
          }
          // If onboarding completed but pending, redirect to pending page
          if (doctor.onboardingCompleted && doctor.status === 'pending') {
            navigate('/doctor/pending-approval', { replace: true });
            return;
          }
          // If rejected, redirect to rejected page
          if (doctor.status === 'rejected') {
            navigate('/doctor/rejected', { replace: true });
            return;
          }
          // Pre-fill form if data exists
          setFormData({
            specialty: doctor.specialty || '',
            experience: doctor.experience?.toString() || '',
            licenseId: doctor.licenseId || '',
            phone: doctor.phoneNumber || user.phone || '',
            bio: doctor.bio || '',
            profileImage: doctor.profileImage || ''
          });
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    };

    checkOnboardingStatus();
    
    // Set up interval to check status periodically (in case admin approves while user is on this page)
    const statusInterval = setInterval(() => {
      checkOnboardingStatus();
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(statusInterval);
  }, [user, navigate]);

  const handleChange = (field: string, value: any) => {
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

      const data = await response.json();
      if (data.success && data.fileURL) {
        setFormData(prev => ({ ...prev, profileImage: data.fileURL }));
        toast.success('Profile image uploaded successfully');
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
        toast.success('Onboarding completed! Your account is pending admin approval.');
        
        // Update user context
        if (updateUser) {
          updateUser({
            ...user,
            phone: formData.phone,
            specialty: formData.specialty,
            experience: parseInt(formData.experience) || 0,
            licenseId: formData.licenseId
          });
        }
        
        // Update localStorage
        const updatedUser = {
          ...user,
          phone: formData.phone,
          specialty: formData.specialty,
          experience: parseInt(formData.experience) || 0,
          licenseId: formData.licenseId
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Redirect to pending approval page
        setTimeout(() => {
          navigate('/doctor/pending-approval', { replace: true });
        }, 1500);
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

