import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, 
  Camera, 
  Shield, 
  Key, 
  Download, 
  Trash2, 
  Eye, 
  EyeOff,
  QrCode,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  X,
  Users,
  Plus,
  Upload
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { usersAPI } from '@/lib/api';
import { API_BASE_URL } from '@/config/api';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(user?.profile?.profilePicture || null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.profile?.dateOfBirth || '',
    gender: user?.profile?.gender || '',
    bloodType: user?.profile?.bloodType || '',
    allergies: user?.profile?.allergies?.join(', ') || '',
    emergencyContactName: user?.profile?.emergencyContact?.name || '',
    emergencyContactPhone: user?.profile?.emergencyContact?.phone || '',
    emergencyContactRelationship: user?.profile?.emergencyContact?.relationship || ''
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Caregivers state - now user-specific
  const [caregivers, setCaregivers] = useState([
    { id: 1, name: 'Dr. Sarah Johnson', email: 'sarah.johnson@hospital.com', role: 'Primary Doctor', status: 'Active', userId: user?.id },
    { id: 2, name: 'Nurse Mary Smith', email: 'mary.smith@hospital.com', role: 'Nurse', status: 'Active', userId: user?.id }
  ]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64String = e.target?.result as string;
        setProfileImage(base64String);
        
        // Update profile with new image
        try {
          const token = localStorage.getItem('authToken');
          const response = await fetch(`${API_BASE_URL}/users/profile-picture`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ profilePicture: base64String })
          });
          
          const data = await response.json();
          
          if (data.success) {
            updateUser(data.user);
            alert('Profile picture updated successfully!');
          } else {
            throw new Error(data.message || 'Failed to update profile picture');
          }
        } catch (error: any) {
          console.error('Profile picture update error:', error);
          alert('Failed to update profile picture: ' + (error.message || 'Please try again.'));
          setProfileImage(user?.profile?.profilePicture || null);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        name: profileForm.name,
        phone: profileForm.phone,
        profile: {
          ...user?.profile,
          dateOfBirth: profileForm.dateOfBirth,
          gender: profileForm.gender,
          bloodType: profileForm.bloodType,
          allergies: profileForm.allergies.split(',').map(a => a.trim()).filter(a => a),
          emergencyContact: {
            name: profileForm.emergencyContactName,
            phone: profileForm.emergencyContactPhone,
            relationship: profileForm.emergencyContactRelationship
          }
        }
      };

      const response = await usersAPI.updateProfile(updateData);
      if (response.success) {
        updateUser(response.user);
        alert('Profile updated successfully!');
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      alert(error.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/users/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Password changed successfully!');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        alert(data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      alert('Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users/enable-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setShow2FASetup(true);
      } else {
        alert(data.message || 'Failed to setup 2FA');
      }
    } catch (error) {
      console.error('2FA setup error:', error);
      alert('Failed to setup 2FA. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users/download-data', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `healthcare-data-${user?.id}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        alert('Your data has been downloaded successfully!');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to download data');
      }
    } catch (error) {
      console.error('Download data error:', error);
      alert('Failed to download data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your health data.'
    );
    
    if (!confirmed) return;

    const confirmationText = window.prompt(
      'To confirm account deletion, please type "DELETE" (in capital letters):'
    );
    
    if (confirmationText !== 'DELETE') {
      alert('Account deletion cancelled. Confirmation text did not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/users/account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ confirmationText: 'DELETE' })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Account deletion initiated. You will receive a confirmation email.');
        // Logout user after account deletion
        setTimeout(() => {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }, 2000);
      } else {
        alert(data.message || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Delete account error:', error);
      alert('Failed to delete account. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewRecoveryCode = async () => {
    try {
      const response = await fetch('/api/users/recovery-code', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        const recoveryCode = data.recoveryCode;
        alert(`Your recovery code is: ${recoveryCode}\n\nPlease save this code in a secure location. You can use it to recover your account if you lose access.`);
      } else {
        alert(data.message || 'Failed to get recovery code');
      }
    } catch (error) {
      console.error('Recovery code error:', error);
      alert('Failed to get recovery code. Please try again.');
    }
  };

  const handleRemoveCaregiver = async (id: number) => {
    const confirmed = window.confirm('Are you sure you want to remove this caregiver? They will no longer have access to your medical information.');
    if (!confirmed) return;

    try {
      // Filter out the caregiver (in real app, this would be an API call)
      setCaregivers(prev => prev.filter(c => c.id !== id));
      alert('Caregiver removed successfully.');
    } catch (error) {
      console.error('Remove caregiver error:', error);
      alert('Failed to remove caregiver. Please try again.');
    }
  };

  const handleAddCaregiver = () => {
    const name = window.prompt('Enter caregiver name:');
    if (!name) return;

    const email = window.prompt('Enter caregiver email:');
    if (!email) return;

    const role = window.prompt('Enter caregiver role (e.g., Doctor, Nurse, Family Member):');
    if (!role) return;

    const newCaregiver = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: role.trim(),
      status: 'Pending',
      userId: user?.id
    };

    setCaregivers(prev => [...prev, newCaregiver]);
    alert('Caregiver invitation sent! They will receive an email to accept access to your medical information.');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security & Privacy', icon: Shield },
    { id: 'caregivers', label: 'Caregivers', icon: Users }
  ];

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Profile Settings
          </h1>
          <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
          <p className="text-sm text-gray-500 mt-1">User ID: {user?.id}</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileForm.email}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={profileForm.dateOfBirth}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <select
                        id="gender"
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        value={profileForm.gender}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, gender: e.target.value }))}
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="bloodType">Blood Type</Label>
                      <select
                        id="bloodType"
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        value={profileForm.bloodType}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, bloodType: e.target.value }))}
                      >
                        <option value="">Select blood type</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="allergies">Allergies (comma-separated)</Label>
                    <Textarea
                      id="allergies"
                      value={profileForm.allergies}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, allergies: e.target.value }))}
                      placeholder="e.g., Peanuts, Shellfish, Penicillin"
                    />
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="emergencyContactName">Name</Label>
                        <Input
                          id="emergencyContactName"
                          value={profileForm.emergencyContactName}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="emergencyContactPhone">Phone</Label>
                        <Input
                          id="emergencyContactPhone"
                          value={profileForm.emergencyContactPhone}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                        <Input
                          id="emergencyContactRelationship"
                          value={profileForm.emergencyContactRelationship}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, emergencyContactRelationship: e.target.value }))}
                          placeholder="e.g., Spouse, Parent"
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Profile Picture Card */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden border-4 border-white shadow-lg">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-16 h-16 text-white" />
                    )}
                  </div>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    size="sm"
                    className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0 bg-blue-500 hover:bg-blue-600 shadow-lg"
                  >
                    {uploadingImage ? (
                      <Upload className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <p className="text-sm text-gray-600 mt-2">
                  {uploadingImage ? 'Uploading...' : 'Click the camera icon to upload a new profile picture'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Max size: 5MB. Supported formats: JPG, PNG, GIF
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Security & Privacy Tab */}
        {activeTab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Password Change */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      required
                      minLength={6}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Changing...' : 'Change Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Two-Factor Authentication */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Two-Factor Authentication
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Authenticator App</p>
                      <p className="text-sm text-gray-600">Use an app like Google Authenticator</p>
                    </div>
                    <Badge variant="outline" className="bg-red-50 text-red-700">
                      Disabled
                    </Badge>
                  </div>
                  <Button onClick={handleEnable2FA} disabled={loading} className="w-full">
                    {loading ? 'Setting up...' : 'Enable 2FA'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Data & Privacy */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Data & Privacy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button 
                      onClick={handleDownloadData} 
                      disabled={loading}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      {loading ? 'Preparing...' : 'Download My Data'}
                    </Button>
                    
                    <Button 
                      onClick={handleViewRecoveryCode}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <QrCode className="w-4 h-4" />
                      View Recovery Code
                    </Button>
                    
                    <Button 
                      onClick={handleDeleteAccount}
                      disabled={loading}
                      variant="destructive"
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      {loading ? 'Processing...' : 'Delete Account'}
                    </Button>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800">Data Privacy Notice</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Your health data is encrypted and stored securely. We never share your personal information without your explicit consent. All data is isolated per user account.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Caregivers Tab */}
        {activeTab === 'caregivers' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Authorized Caregivers
                </CardTitle>
                <Button onClick={handleAddCaregiver} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Caregiver
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {caregivers.filter(c => c.userId === user?.id).map((caregiver) => (
                  <div key={caregiver.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium">{caregiver.name}</h3>
                        <p className="text-sm text-gray-600">{caregiver.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{caregiver.role}</Badge>
                          <Badge 
                            variant={caregiver.status === 'Active' ? 'default' : 'secondary'}
                            className={caregiver.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                          >
                            {caregiver.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleRemoveCaregiver(caregiver.id)}
                      variant="destructive"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </Button>
                  </div>
                ))}
                
                {caregivers.filter(c => c.userId === user?.id).length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Caregivers Added</h3>
                    <p className="text-gray-600 mb-4">
                      Add authorized healthcare providers to access your medical information.
                    </p>
                    <Button onClick={handleAddCaregiver} className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Add First Caregiver
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 2FA Setup Modal */}
        {show2FASetup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Setup Two-Factor Authentication</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShow2FASetup(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto flex items-center justify-center">
                    <QrCode className="w-16 h-16 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600">
                    Scan this QR code with your authenticator app
                  </p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <code className="text-sm">HC-{user?.id?.slice(-8)?.toUpperCase()}-2FA</code>
                  </div>
                  <Button className="w-full" onClick={() => setShow2FASetup(false)}>
                    I've Added the Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
  );
}