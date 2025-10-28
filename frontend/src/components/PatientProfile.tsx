import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Edit3, 
  Save, 
  X, 
  Plus,
  AlertCircle,
  CheckCircle,
  Heart,
  Activity
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  bloodType: string;
  height: string;
  weight: string;
  allergies: string[];
  medications: string[];
  conditions: string[];
}

export default function PatientProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading] = useState(false);
  
  // Mock user profile data
  const userProfile = {
    firstName: user?.name?.split(' ')[0] || 'John',
    lastName: user?.name?.split(' ')[1] || 'Doe',
    email: user?.email || 'demo@healthcare.com',
    phone: '+1-555-0123',
    dateOfBirth: '1990-01-01',
    address: '123 Main St, City, State 12345',
    emergencyContact: 'Jane Doe',
    emergencyPhone: '+1-555-0124',
    bloodType: 'O+',
    height: '5\'10"',
    weight: '175 lbs',
    allergies: ['Penicillin', 'Shellfish'],
    medications: ['Lisinopril', 'Metformin'],
    conditions: ['Hypertension', 'Type 2 Diabetes']
  };

  const updateUserProfile = async (data: any) => {
    console.log('Profile update:', data);
    // Mock update - in real app, this would call the backend API
    return Promise.resolve();
  };
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    bloodType: '',
    height: '',
    weight: '',
    allergies: [],
    medications: [],
    conditions: []
  });

  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [newCondition, setNewCondition] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ')[1] || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }

    if (userProfile) {
      setProfileData(prev => ({
        ...prev,
        firstName: userProfile.name?.split(' ')[0] || prev.firstName,
        lastName: userProfile.name?.split(' ')[1] || prev.lastName,
        email: userProfile.email || prev.email,
        phone: userProfile.phone || prev.phone,
        dateOfBirth: userProfile.dateOfBirth || prev.dateOfBirth,
        address: userProfile.address || prev.address,
        emergencyContact: userProfile.emergencyContact || prev.emergencyContact,
        allergies: userProfile.allergies || [],
        medications: userProfile.medications || [],
        conditions: userProfile.conditions || []
      }));
    }
  }, [user, userProfile]);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      await updateUserProfile({
        name: `${profileData.firstName} ${profileData.lastName}`,
        email: profileData.email,
        phone: profileData.phone,
        dateOfBirth: profileData.dateOfBirth,
        address: profileData.address,
        emergencyContact: profileData.emergencyContact,
        allergies: profileData.allergies,
        medications: profileData.medications,
        conditions: profileData.conditions,
        subscription_tier: 'free',
        created_at: new Date(),
        updated_at: new Date()
      });

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setMessage(null);
    // Reset to original data
    if (userProfile) {
      setProfileData(prev => ({
        ...prev,
        allergies: userProfile.allergies || [],
        medications: userProfile.medications || [],
        conditions: userProfile.conditions || []
      }));
    }
  };

  const addItem = (type: 'allergies' | 'medications' | 'conditions', value: string) => {
    if (!value.trim()) return;

    setProfileData(prev => ({
      ...prev,
      [type]: [...prev[type], value.trim()]
    }));

    // Clear the input
    if (type === 'allergies') setNewAllergy('');
    if (type === 'medications') setNewMedication('');
    if (type === 'conditions') setNewCondition('');
  };

  const removeItem = (type: 'allergies' | 'medications' | 'conditions', index: number) => {
    setProfileData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patient Profile</h1>
          <p className="text-gray-600 mt-1">Manage your personal and health information</p>
        </div>
        <div className="flex space-x-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700">
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button onClick={handleCancel} variant="outline" disabled={isSaving}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Message */}
      {message && (
        <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Profile Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user?.avatar_url} />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl">
                  {profileData.firstName[0]}{profileData.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900">
                  {profileData.firstName} {profileData.lastName}
                </h3>
                <p className="text-gray-600">{profileData.email}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{profileData.email}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{profileData.phone || 'Not provided'}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{profileData.dateOfBirth || 'Not provided'}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{profileData.address || 'Not provided'}</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Health Status</span>
                <Badge className="bg-green-100 text-green-800">Good</Badge>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>87% Health Score</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Activity className="w-4 h-4 text-blue-500" />
                  <span>Active</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={profileData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={profileData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={true} // Email usually shouldn't be editable
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bloodType">Blood Type</Label>
                <Input
                  id="bloodType"
                  value={profileData.bloodType}
                  onChange={(e) => handleInputChange('bloodType', e.target.value)}
                  disabled={!isEditing}
                  placeholder="e.g., A+, O-, B+"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={profileData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={!isEditing}
                placeholder="Enter your full address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  value={profileData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                <Input
                  id="emergencyPhone"
                  value={profileData.emergencyPhone}
                  onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Phone number"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  value={profileData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  disabled={!isEditing}
                  placeholder="e.g., 175"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  value={profileData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  disabled={!isEditing}
                  placeholder="e.g., 70"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allergies */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Allergies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {profileData.allergies.map((allergy, index) => (
                <Badge key={index} variant="outline" className="flex items-center space-x-1">
                  <span>{allergy}</span>
                  {isEditing && (
                    <button
                      onClick={() => removeItem('allergies', index)}
                      className="ml-1 text-red-500 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            {isEditing && (
              <div className="flex space-x-2">
                <Input
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  placeholder="Add allergy"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addItem('allergies', newAllergy);
                    }
                  }}
                />
                <Button
                  onClick={() => addItem('allergies', newAllergy)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Medications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Medications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {profileData.medications.map((medication, index) => (
                <Badge key={index} variant="outline" className="flex items-center space-x-1">
                  <span>{medication}</span>
                  {isEditing && (
                    <button
                      onClick={() => removeItem('medications', index)}
                      className="ml-1 text-red-500 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            {isEditing && (
              <div className="flex space-x-2">
                <Input
                  value={newMedication}
                  onChange={(e) => setNewMedication(e.target.value)}
                  placeholder="Add medication"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addItem('medications', newMedication);
                    }
                  }}
                />
                <Button
                  onClick={() => addItem('medications', newMedication)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Medical Conditions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Medical Conditions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {profileData.conditions.map((condition, index) => (
                <Badge key={index} variant="outline" className="flex items-center space-x-1">
                  <span>{condition}</span>
                  {isEditing && (
                    <button
                      onClick={() => removeItem('conditions', index)}
                      className="ml-1 text-red-500 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            {isEditing && (
              <div className="flex space-x-2">
                <Input
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  placeholder="Add condition"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addItem('conditions', newCondition);
                    }
                  }}
                />
                <Button
                  onClick={() => addItem('conditions', newCondition)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}