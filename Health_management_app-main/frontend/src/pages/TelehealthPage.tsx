import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Video, 
  Phone, 
  MessageCircle, 
  Plus,
  Edit,
  Trash2,
  Star,
  MapPin,
  Mail,
  Calendar,
  Search,
  Filter,
  Loader2,
  PhoneCall,
  VideoIcon,
  MessageSquare,
  CalendarCheck,
  Check
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { useDoctors, type Doctor } from '@/hooks/useDoctors';
import { AddDoctorForm } from '@/components/AddDoctorForm';
import { ChatBox } from '@/components/ChatBox';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import { Crown, Lock } from 'lucide-react';

export default function TelehealthPage() {
  const { user, isAdmin, featurePreviewEnabled } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { subscription, isLoading: loadingSubscription } = useSubscription();
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  const [isActiveFilter, setIsActiveFilter] = useState<boolean>(true);
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [doctorToEdit, setDoctorToEdit] = useState<Doctor | null>(null);
  const [chatDoctorId, setChatDoctorId] = useState<string | null>(null);
  const [chatDoctorName, setChatDoctorName] = useState<string>('');

  // Check if user has premium subscription
  const subscriptionTier = (subscription?.tier || subscription?.plan || '').toString().toLowerCase();
  const isPremium = subscription?.status === 'active' && ['premium', 'family'].includes(subscriptionTier);

  const betaUsers = (import.meta.env.VITE_TELEHEALTH_BETA_USERS || '')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  const userIdentifier = [
    user?.email?.toLowerCase(),
    user?.id ? String(user.id).toLowerCase() : undefined,
    user?._id ? String(user._id).toLowerCase() : undefined,
  ].filter(Boolean) as string[];

  const hasPersonalAccess = userIdentifier.some((identifier) => betaUsers.includes(identifier));
  const adminBypass = isAdmin && featurePreviewEnabled;
  const hasTelehealthAccess = adminBypass || isPremium || hasPersonalAccess;

  const {
    doctors,
    isLoading,
    specialties,
    deleteDoctor,
    isDeleting
  } = useDoctors({
    specialty: specialtyFilter === 'all' ? undefined : specialtyFilter,
    isActive: isActiveFilter,
    search: searchQuery || undefined
  });

  // Filter doctors based on search query (client-side additional filter)
  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.hospital?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleVideoCall = (doctor: Doctor) => {
    if (doctor.zoomLink) {
      window.open(doctor.zoomLink, '_blank', 'noopener,noreferrer');
      toast({
        title: 'Starting Video Call',
        description: `Connecting to ${doctor.name}...`,
        variant: 'default'
      });
    } else {
      toast({
        title: 'No Video Link',
        description: 'This doctor has not set up a video consultation link',
        variant: 'destructive'
      });
    }
  };

  const handlePhoneCall = (doctor: Doctor) => {
    if (doctor.phoneNumber) {
      window.location.href = `tel:${doctor.phoneNumber}`;
      toast({
        title: 'Initiating Call',
        description: `Calling ${doctor.name}...`,
        variant: 'default'
      });
    } else {
      toast({
        title: 'No Phone Number',
        description: 'This doctor has not provided a phone number',
        variant: 'destructive'
      });
    }
  };

  const handleOpenChat = (doctor: Doctor) => {
    if (doctor.chatAvailable) {
      setChatDoctorId(doctor._id);
      setChatDoctorName(doctor.name);
    } else {
      toast({
        title: 'Chat Unavailable',
        description: 'This doctor is not available for chat',
        variant: 'destructive'
      });
    }
  };

  const handleEditDoctor = (doctor: Doctor) => {
    if (!isAdmin) {
      toast({
        title: 'Admin only',
        description: 'Only administrators can edit telehealth providers.',
      });
      return;
    }
    setDoctorToEdit(doctor);
    setIsAddDoctorOpen(true);
  };

  const handleDeleteDoctor = async (doctorId: string, doctorName: string) => {
    if (!isAdmin) {
      toast({
        title: 'Admin only',
        description: 'Only administrators can delete telehealth providers.',
      });
      return;
    }
    if (confirm(`Are you sure you want to delete Dr. ${doctorName}?`)) {
      try {
        await deleteDoctor(doctorId);
        toast({
          title: 'Doctor Deleted',
          description: `${doctorName} has been removed from the system`,
          variant: 'default'
        });
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete doctor',
          variant: 'destructive'
        });
      }
    }
  };

  const handleCloseAddDoctor = () => {
    setIsAddDoctorOpen(false);
    setDoctorToEdit(null);
  };

  const handleBookAppointment = (doctor: Doctor) => {
    // Navigate to appointments page with doctor info
    navigate('/appointments', { 
      state: { 
        doctor: {
          name: doctor.name,
          specialty: doctor.specialty,
          hospital: doctor.hospital
        }
      } 
    });
  };

  // Show premium gate if not subscribed
  if (!loadingSubscription && !hasTelehealthAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="text-center py-16 shadow-2xl border-2 border-purple-200 dark:border-purple-900">
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <Crown className="w-24 h-24 text-purple-500" />
                  <Lock className="w-10 h-10 text-purple-600 absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-1" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                  Premium Feature: Telehealth
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg mb-2">
                  Connect with healthcare professionals remotely
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  {isAdmin && !adminBypass
                    ? 'Toggle “View All Features” in the admin toolbar to bypass subscription gating for demos.'
                    : 'Upgrade to Premium to access video consultations, instant chat, and priority booking'}
                </p>
              </div>
              <div className="flex flex-col gap-4 max-w-md mx-auto">
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Premium Telehealth Includes:</h3>
                  <ul className="text-left space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Unlimited video consultations</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>24/7 instant chat with doctors</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Priority appointment booking</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Access to specialist consultations</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Extended 60-minute sessions</span>
                    </li>
                  </ul>
                  {betaUsers.length > 0 && (
                    <p className="mt-3 text-xs text-purple-600 dark:text-purple-200">
                      Early access users: ensure your email or user ID is listed in the Telehealth beta allowlist to unlock access.
                    </p>
                  )}
                </div>
                <Button 
                  onClick={() => navigate('/subscription')}
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Upgrade to Premium
                </Button>
                <Button 
                  onClick={() => navigate('/dashboard')}
                  variant="outline"
                  size="lg"
                  className="w-full"
                >
                  Return to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
              <Crown className="w-8 h-8 text-purple-500" />
              Telehealth
              {!(adminBypass || isPremium || hasPersonalAccess) && (
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">Premium</Badge>
              )}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Connect with healthcare professionals remotely
            </p>
            {isAdmin && !adminBypass && (
              <p className="text-sm text-amber-600 dark:text-amber-300 mt-1">
                Admin preview mode is off — premium features are hidden to match the subscriber experience.
              </p>
            )}
          </div>
          <Button
            onClick={() => {
              if (!isAdmin) {
                toast({
                  title: 'Admin only',
                  description: 'Only administrators can add or manage telehealth providers.',
                });
                return;
              }
              setIsAddDoctorOpen(true);
            }}
            size="lg"
            variant={isAdmin ? 'default' : 'outline'}
            className={!isAdmin ? 'opacity-80' : undefined}
            title={isAdmin ? 'Add a doctor' : 'Admins only'}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Doctor
          </Button>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search doctors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Specialty Filter */}
              <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Specialties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  {specialties.map(specialty => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Active Status Filter */}
              <Select
                value={isActiveFilter ? 'active' : 'all'}
                onValueChange={(value) => setIsActiveFilter(value === 'active')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Doctors List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          </div>
        ) : filteredDoctors.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-20">
              <Video className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No doctors found</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or add a new doctor</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor._id} className="hover:shadow-xl transition-shadow relative">
                {/* Active/Inactive Badge */}
                <div className="absolute top-4 right-4">
                  <Badge variant={doctor.isActive ? 'default' : 'secondary'}>
                    {doctor.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                      {doctor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl">{doctor.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {doctor.specialty}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Doctor Info */}
                  <div className="space-y-2 text-sm">
                    {doctor.hospital && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <MapPin className="w-4 h-4" />
                        {doctor.hospital}
                      </div>
                    )}
                    {doctor.email && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <Mail className="w-4 h-4" />
                        {doctor.email}
                      </div>
                    )}
                    {doctor.phoneNumber && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <Phone className="w-4 h-4" />
                        {doctor.phoneNumber}
                      </div>
                    )}
                    {doctor.experience !== undefined && doctor.experience > 0 && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {doctor.experience} years experience
                      </div>
                    )}
                  </div>

                  {/* Availability */}
                  {doctor.availableDays && doctor.availableDays.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">Available Days:</p>
                      <div className="flex flex-wrap gap-1">
                        {doctor.availableDays.map(day => (
                          <Badge key={day} variant="outline" className="text-xs">
                            {day.substring(0, 3)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Consultation Fee */}
                  {doctor.consultationFee !== undefined && doctor.consultationFee > 0 && (
                    <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                      Consultation Fee: ${doctor.consultationFee}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVideoCall(doctor)}
                      disabled={!doctor.zoomLink}
                      className="flex flex-col items-center gap-1 h-auto py-2"
                      title={doctor.zoomLink ? "Start Video Call" : "Video call not available"}
                    >
                      <VideoIcon className="w-4 h-4" />
                      <span className="text-xs">Video</span>
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePhoneCall(doctor)}
                      disabled={!doctor.phoneNumber}
                      className="flex flex-col items-center gap-1 h-auto py-2"
                      title={doctor.phoneNumber ? "Call Doctor" : "Phone number not available"}
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span className="text-xs">Call</span>
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenChat(doctor)}
                      disabled={!doctor.chatAvailable}
                      className="flex flex-col items-center gap-1 h-auto py-2"
                      title={doctor.chatAvailable ? "Start Chat" : "Chat not available"}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-xs">Chat</span>
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleBookAppointment(doctor)}
                      disabled={!doctor.isActive}
                      className="flex flex-col items-center gap-1 h-auto py-2 bg-blue-600 hover:bg-blue-700 text-white"
                      title={doctor.isActive ? "Book Appointment" : "Doctor not available"}
                    >
                      <CalendarCheck className="w-4 h-4" />
                      <span className="text-xs">Book</span>
                    </Button>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditDoctor(doctor)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteDoctor(doctor._id, doctor.name)}
                        disabled={isDeleting}
                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">{doctors.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total Doctors</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {doctors.filter(d => d.isActive).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Active Doctors</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">{specialties.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Specialties</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-orange-600">
                {doctors.filter(d => d.chatAvailable).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Chat Available</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add/Edit Doctor Dialog */}
      <AddDoctorForm
        isOpen={isAddDoctorOpen}
        onClose={handleCloseAddDoctor}
        doctorToEdit={doctorToEdit}
      />

      {/* Chat Dialog */}
      <ChatBox
        isOpen={!!chatDoctorId}
        onClose={() => {
          setChatDoctorId(null);
          setChatDoctorName('');
        }}
        doctorId={chatDoctorId}
        doctorName={chatDoctorName}
      />
    </div>
  );
}
