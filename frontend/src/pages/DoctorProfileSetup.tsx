import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Stethoscope, GraduationCap, FileText, Award, MapPin, Phone, Loader2, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import { toast } from 'sonner';
import { useAuth } from '@/components/AuthContext';

export default function DoctorProfileSetup() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    specialty: '',
    experience: '',
    licenseId: '',
    licenseImage: '',
    medicalSchool: '',
    graduationYear: '',
    boardCertifications: '',
    hospitalAffiliations: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    },
    bio: '',
    yearsOfExperience: ''
  });

  useEffect(() => {
    // Pre-fill form with existing user data if available
    if (user) {
      setFormData({
        specialty: user.specialty || '',
        experience: user.experience?.toString() || '',
        licenseId: user.licenseId || '',
        licenseImage: '',
        medicalSchool: '',
        graduationYear: '',
        boardCertifications: '',
        hospitalAffiliations: '',
        phone: user.phone || '',
        address: typeof user.address === 'object' ? user.address : {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'USA'
        },
        bio: '',
        yearsOfExperience: user.experience?.toString() || ''
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

  const handleFileUpload = async (field: string, file: File) => {
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
        setFormData(prev => ({ ...prev, [field]: data.fileURL }));
        toast.success('File uploaded successfully');
      } else {
        throw new Error(data.message || 'Failed to upload file');
      }
    } catch (error: any) {
      console.error('File upload error:', error);
      toast.error('Failed to upload file: ' + (error.message || 'Unknown error'));
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
      
      // First, update the user profile
      const userResponse = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          phone: formData.phone,
          specialty: formData.specialty,
          experience: parseInt(formData.experience) || parseInt(formData.yearsOfExperience) || 0,
          licenseId: formData.licenseId,
          address: formData.address
        })
      });

      const userData = await userResponse.json();
      
      if (!userResponse.ok && !userData.success) {
        throw new Error(userData.message || 'Failed to update user profile');
      }

      // Then, create or update the doctor record
      const doctorResponse = await fetch(`${API_BASE_URL}/doctors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          specialty: formData.specialty,
          experience: parseInt(formData.experience) || parseInt(formData.yearsOfExperience) || 0,
          licenseId: formData.licenseId,
          licenseImage: formData.licenseImage,
          medicalSchool: formData.medicalSchool,
          graduationYear: formData.graduationYear,
          boardCertifications: formData.boardCertifications,
          hospitalAffiliations: formData.hospitalAffiliations,
          phone: formData.phone,
          address: formData.address,
          bio: formData.bio
        })
      });

      const doctorData = await doctorResponse.json();
      
      if (doctorResponse.ok || doctorData.success) {
        toast.success('Doctor profile setup completed successfully!');
        
        // Update user context
        if (updateUser) {
          updateUser({
            ...user,
            phone: formData.phone,
            specialty: formData.specialty,
            experience: parseInt(formData.experience) || parseInt(formData.yearsOfExperience) || 0,
            licenseId: formData.licenseId,
            address: formData.address
          });
        }
        
        // Redirect to doctor dashboard
        setTimeout(() => {
          navigate('/doctor-dashboard');
        }, 1500);
      } else {
        throw new Error(doctorData.message || 'Failed to create doctor profile');
      }
    } catch (error: any) {
      console.error('Error setting up doctor profile:', error);
      toast.error('Failed to setup doctor profile: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  if (!user || user.role !== 'doctor') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">This page is only available for doctor users.</p>
            <Button onClick={() => navigate('/dashboard')} className="mt-4">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const specialties = [
    'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology', 'General Practice',
    'Internal Medicine', 'Neurology', 'Obstetrics & Gynecology', 'Oncology', 'Ophthalmology',
    'Orthopedics', 'Pediatrics', 'Psychiatry', 'Pulmonology', 'Radiology', 'Surgery', 'Urology', 'Other'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="border-2 border-green-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Stethoscope className="w-6 h-6" />
              Complete Your Professional Profile
            </CardTitle>
            <CardDescription className="text-green-100 mt-2">
              Please provide your professional information and credentials to verify your medical license. 
              This information will be reviewed by our admin team before approval.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Professional Information */}
              <div className="space-y-4 border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-green-600" />
                  Professional Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div className="space-y-2">
                    <Label htmlFor="yearsOfExperience" className="text-base font-semibold">
                      Years of Experience *
                    </Label>
                    <Input
                      id="yearsOfExperience"
                      type="number"
                      min="0"
                      max="50"
                      value={formData.yearsOfExperience}
                      onChange={(e) => {
                        handleChange('yearsOfExperience', e.target.value);
                        handleChange('experience', e.target.value);
                      }}
                      required
                      placeholder="e.g., 10"
                      className="h-11"
                    />
                  </div>
                </div>

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

                <div className="space-y-2">
                  <Label htmlFor="licenseImage" className="text-base font-semibold">
                    <Upload className="w-4 h-4 inline mr-2" />
                    Upload License Document (Optional)
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload('licenseImage', file);
                      }}
                      className="hidden"
                      id="license-upload"
                    />
                    <label htmlFor="license-upload" className="cursor-pointer flex flex-col items-center">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">
                        {formData.licenseImage ? 'License uploaded ✓' : 'Click to upload license document'}
                      </p>
                    </label>
                  </div>
                </div>
              </div>

              {/* Education */}
              <div className="space-y-4 border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  Education & Credentials
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="medicalSchool" className="text-base font-semibold">
                      Medical School
                    </Label>
                    <Input
                      id="medicalSchool"
                      value={formData.medicalSchool}
                      onChange={(e) => handleChange('medicalSchool', e.target.value)}
                      placeholder="Name of medical school"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="graduationYear" className="text-base font-semibold">
                      Graduation Year
                    </Label>
                    <Input
                      id="graduationYear"
                      type="number"
                      min="1950"
                      max={new Date().getFullYear()}
                      value={formData.graduationYear}
                      onChange={(e) => handleChange('graduationYear', e.target.value)}
                      placeholder="e.g., 2010"
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="boardCertifications" className="text-base font-semibold">
                    <Award className="w-4 h-4 inline mr-2" />
                    Board Certifications
                  </Label>
                  <Textarea
                    id="boardCertifications"
                    value={formData.boardCertifications}
                    onChange={(e) => handleChange('boardCertifications', e.target.value)}
                    placeholder="List your board certifications (e.g., American Board of Internal Medicine, 2015)"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hospitalAffiliations" className="text-base font-semibold">
                    Hospital Affiliations
                  </Label>
                  <Textarea
                    id="hospitalAffiliations"
                    value={formData.hospitalAffiliations}
                    onChange={(e) => handleChange('hospitalAffiliations', e.target.value)}
                    placeholder="List hospitals or medical centers where you have privileges"
                    rows={3}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4 border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-purple-600" />
                  Contact Information
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-base font-semibold">
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

                <div className="space-y-4">
                  <Label className="text-base font-semibold">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Address
                  </Label>
                  <Input
                    placeholder="Street Address"
                    value={formData.address.street}
                    onChange={(e) => handleChange('address.street', e.target.value)}
                    className="h-11"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="City"
                      value={formData.address.city}
                      onChange={(e) => handleChange('address.city', e.target.value)}
                      className="h-11"
                    />
                    <Input
                      placeholder="State"
                      value={formData.address.state}
                      onChange={(e) => handleChange('address.state', e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <Input
                    placeholder="Zip Code"
                    value={formData.address.zipCode}
                    onChange={(e) => handleChange('address.zipCode', e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-base font-semibold">
                  Professional Bio
                </Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  placeholder="Tell patients about your background, expertise, and approach to care (optional)"
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/doctor-dashboard')}
                  className="flex-1"
                  disabled={saving}
                >
                  Skip for Now
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
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

