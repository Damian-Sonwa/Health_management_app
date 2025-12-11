import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, User, Plus, X, Loader2, Edit, Trash2, Phone, Video, MessageCircle, RefreshCw, AlertCircle, UserPlus } from 'lucide-react';
import { useAppointments } from '@/hooks/useAppointments';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/config/api';
import { useAuth } from '@/components/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Doctor {
  id: string;
  _id: string;
  name: string;
  specialty: string;
  profileImage?: string;
  isActive: boolean;
  available: boolean;
}

export default function AppointmentsPage() {
  const { appointments, isLoading, createAppointment, updateAppointment, deleteAppointment, isCreating, isDeleting } = useAppointments();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [doctorsError, setDoctorsError] = useState<string | null>(null);
  const [newAppointment, setNewAppointment] = useState({
    doctorId: '',
    doctorName: '',
    doctorSpecialty: '',
    appointmentDate: '',
    appointmentTime: '',
    appointmentType: 'video',
    communicationMethod: 'video',
    reason: '',
    notes: ''
  });

  // Fetch available doctors
  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      setDoctorsError(null);
      
      console.log('🔵 Fetching doctors from:', `${API_BASE_URL}/doctors/available`);
      const response = await fetch(`${API_BASE_URL}/doctors/available`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🔵 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('🔵 Doctors data received:', data);
      
      // Handle multiple response formats
      const doctorsList = data.data || data.doctors || data || [];
      
      if (Array.isArray(doctorsList) && doctorsList.length > 0) {
        // Normalize doctor objects to ensure consistent field names
        const normalizedDoctors = doctorsList.map((doctor: any) => ({
          id: doctor.id || doctor._id,
          _id: doctor._id || doctor.id,
          name: doctor.name || doctor.fullName || 'Unknown Doctor',
          fullName: doctor.fullName || doctor.name || 'Unknown Doctor',
          specialty: doctor.specialty || doctor.specialization || 'General Practice',
          specialization: doctor.specialization || doctor.specialty || 'General Practice',
          profileImage: doctor.profileImage || doctor.profilePhoto,
          isActive: doctor.isActive !== false,
          available: doctor.available !== false || doctor.isAvailable !== false,
          isAvailable: doctor.isAvailable !== false || doctor.available !== false
        }));
        
        console.log('🔵 Normalized doctors:', normalizedDoctors);
        setDoctors(normalizedDoctors);
      } else if (data.success && Array.isArray(data.data) && data.data.length === 0) {
        console.warn('⚠️ No doctors found in database');
        setDoctors([]);
        setDoctorsError('No doctors are currently available. Please try again later.');
      } else {
        throw new Error(data.message || 'Invalid response format from server');
      }
    } catch (error: any) {
      console.error('❌ Error fetching doctors:', error);
      const errorMessage = error.message || 'Unable to load doctors';
      setDoctorsError(errorMessage);
      setDoctors([]);
      // Only show toast if we had previous data or if it's a critical error
      if (doctors.length === 0) {
        toast.error(`Failed to load doctors: ${errorMessage}`);
      }
    } finally {
      setLoadingDoctors(false);
    }
  };

  // Fetch doctors on component mount and when booking form opens
  useEffect(() => {
    fetchDoctors();
  }, []); // Fetch on mount

  useEffect(() => {
    if (showBookingForm) {
      fetchDoctors(); // Also refresh when form opens
    }
  }, [showBookingForm]);

  // Auto-refresh doctors every 30 seconds when form is open
  useEffect(() => {
    if (!showBookingForm) return;
    
    const interval = setInterval(() => {
      fetchDoctors();
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [showBookingForm]);

  const handleDoctorSelect = (doctorId: string) => {
    const selectedDoctor = doctors.find(d => d.id === doctorId || d._id === doctorId);
    if (selectedDoctor) {
      setNewAppointment({
        ...newAppointment,
        doctorId: doctorId,
        doctorName: selectedDoctor.name,
        doctorSpecialty: selectedDoctor.specialty
      });
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newAppointment.doctorId && !newAppointment.doctorName) {
        toast.error('Please select a doctor');
        return;
      }

      // Map appointmentType to backend format
      const typeMapping: Record<string, string> = {
        'video': 'video',
        'in-person': 'in_person',
        'phone': 'phone',
        'chat': 'chat'
      };
      
      await createAppointment({
        doctorId: newAppointment.doctorId, // Include doctorId in the request
        doctorName: newAppointment.doctorName,
        specialty: newAppointment.doctorSpecialty,
        appointmentDate: newAppointment.appointmentDate,
        appointmentTime: newAppointment.appointmentTime,
        type: typeMapping[newAppointment.appointmentType] || newAppointment.appointmentType,
        communicationMethod: newAppointment.communicationMethod || newAppointment.appointmentType,
        reason: newAppointment.reason,
        notes: newAppointment.notes,
        status: 'scheduled' // Backend accepts: scheduled, confirmed, in_progress, completed, cancelled, no_show
      });
      
      toast.success('Appointment booked successfully!');
      setShowBookingForm(false);
      setNewAppointment({
        doctorId: '',
        doctorName: '',
        doctorSpecialty: '',
        appointmentDate: '',
        appointmentTime: '',
        appointmentType: 'video',
        communicationMethod: 'video',
        reason: '',
        notes: ''
      });
    } catch (error: any) {
      toast.error('Failed to book appointment: ' + error.message);
    }
  };

  const handleUpdateAppointment = async (id: string, updates: any) => {
    try {
      await updateAppointment({ id, data: updates });
      toast.success('Appointment updated successfully!');
      setEditingAppointment(null);
    } catch (error: any) {
      toast.error('Failed to update appointment: ' + error.message);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await deleteAppointment(id);
      toast.success('Appointment cancelled successfully!');
    } catch (error: any) {
      toast.error('Failed to cancel appointment: ' + error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return '📹';
      case 'in_person': 
      case 'in-person': return '🏥';
      case 'phone': return '📞';
      case 'chat': return '💬';
      default: return '📅';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Appointments</h1>
          <p className="text-gray-600 mt-1">Manage your medical appointments</p>
        </div>

        <Dialog open={showBookingForm} onOpenChange={setShowBookingForm}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Book Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Book New Appointment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleBookAppointment} className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="doctorSelect">Select Doctor*</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={fetchDoctors}
                      disabled={loadingDoctors}
                      className="h-7 px-2"
                      title="Refresh doctors list"
                    >
                      <RefreshCw className={`w-3 h-3 ${loadingDoctors ? 'animate-spin' : ''}`} />
                    </Button>
                    {(user?.role === 'admin' || user?.role === 'doctor') && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowBookingForm(false);
                          navigate('/admin-dashboard');
                        }}
                        className="h-7 px-2 text-xs"
                        title="Add Doctor"
                      >
                        <UserPlus className="w-3 h-3 mr-1" />
                        Add Doctor
                      </Button>
                    )}
                  </div>
                </div>
                <Select
                  value={newAppointment.doctorId}
                  onValueChange={handleDoctorSelect}
                  disabled={loadingDoctors || doctors.length === 0}
                  required
                >
                  <SelectTrigger id="doctorSelect" aria-label="Select a doctor">
                    <SelectValue placeholder={
                      loadingDoctors 
                        ? "Loading doctors..." 
                        : doctors.length === 0 
                          ? "No doctors available"
                          : "Choose a doctor"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingDoctors ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                        <span className="ml-2 text-sm text-gray-500">Loading doctors...</span>
                      </div>
                    ) : doctors.length === 0 ? (
                      <div className="p-4 text-center">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600 mb-2">
                          No doctors are available right now.
                        </p>
                        <p className="text-xs text-gray-500 mb-3">
                          Try again later or contact support.
                        </p>
                        {doctorsError && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={fetchDoctors}
                            className="mt-2"
                          >
                            <RefreshCw className="w-3 h-3 mr-2" />
                            Retry
                          </Button>
                        )}
              </div>
                    ) : (
                      doctors
                        .filter((doctor) => {
                          // Filter out any doctors with invalid or empty IDs
                          const doctorId = doctor.id || doctor._id;
                          return doctorId && typeof doctorId === 'string' && doctorId.trim() !== '';
                        })
                        .map((doctor) => {
                          const doctorId = (doctor.id || doctor._id)?.toString().trim();
                          const doctorName = doctor.name || doctor.fullName || 'Unknown Doctor';
                          const doctorSpecialty = doctor.specialty || doctor.specialization || 'General Practice';
                          
                          return (
                            <SelectItem key={doctorId} value={doctorId}>
                              <div className="flex items-center gap-2">
                                {doctor.profileImage ? (
                                  <Avatar className="w-6 h-6">
                                    <AvatarImage src={doctor.profileImage} alt={doctorName} />
                                    <AvatarFallback className="text-xs">
                                      {doctorName.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs">
                                    {doctorName.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <span>{doctorName} — {doctorSpecialty}</span>
                              </div>
                            </SelectItem>
                          );
                        })
                    )}
                  </SelectContent>
                </Select>
                {doctorsError && doctors.length === 0 && !loadingDoctors && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-red-800 font-medium">Unable to load doctors</p>
                        <p className="text-xs text-red-600 mt-1">{doctorsError}</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={fetchDoctors}
                          className="mt-2"
                        >
                          <RefreshCw className="w-3 h-3 mr-2" />
                          Retry
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                {newAppointment.doctorName && (
                  <p className="text-xs text-gray-500 mt-1">
                    Selected: {newAppointment.doctorName} ({newAppointment.doctorSpecialty})
                  </p>
                )}
              </div>

              {/* Date and Time in one row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="appointmentDate">Date*</Label>
                  <Input
                    id="appointmentDate"
                    type="date"
                    value={newAppointment.appointmentDate}
                    onChange={(e) => setNewAppointment({...newAppointment, appointmentDate: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="appointmentTime">Time*</Label>
                  <Input
                    id="appointmentTime"
                    type="time"
                    value={newAppointment.appointmentTime}
                    onChange={(e) => setNewAppointment({...newAppointment, appointmentTime: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="type">Appointment Type*</Label>
                <Select 
                  value={newAppointment.appointmentType}
                  onValueChange={(value) => setNewAppointment({...newAppointment, appointmentType: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select appointment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">
                      <span className="flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        Video Call
                      </span>
                    </SelectItem>
                    <SelectItem value="in-person">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        In-Person
                      </span>
                    </SelectItem>
                    <SelectItem value="phone">
                      <span className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Phone Call
                      </span>
                    </SelectItem>
                    <SelectItem value="chat">
                      <span className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Live Chat
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="communicationMethod">Preferred Communication Method*</Label>
                <Select 
                  value={newAppointment.communicationMethod || newAppointment.appointmentType}
                  onValueChange={(value) => setNewAppointment({...newAppointment, communicationMethod: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select communication method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Phone Call
                      </div>
                    </SelectItem>
                    <SelectItem value="video">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        Video Call
                      </div>
                    </SelectItem>
                    <SelectItem value="chat">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Live Chat
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">Select how you'd like to communicate during the appointment</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reason">Reason for Visit</Label>
                <Textarea
                  id="reason"
                  placeholder="Describe your reason..."
                  value={newAppointment.reason}
                  onChange={(e) => setNewAppointment({...newAppointment, reason: e.target.value})}
                  rows={2}
                  className="resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional info..."
                  value={newAppointment.notes}
                  onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                  rows={2}
                  className="resize-none"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit"
                  disabled={!newAppointment.doctorId || !newAppointment.appointmentDate || !newAppointment.appointmentTime || isCreating || doctors.length === 0}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    'Book Appointment'
                  )}
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowBookingForm(false);
                    setNewAppointment({
                      doctorId: '',
                      doctorName: '',
                      doctorSpecialty: '',
                      appointmentDate: '',
                      appointmentTime: '',
                      appointmentType: 'video',
                      communicationMethod: 'video',
                      reason: '',
                      notes: ''
                    });
                    setDoctorsError(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Appointments List */}
      <div className="grid gap-4">
        {appointments.length > 0 ? (
          appointments.map((appointment: any) => (
            <Card key={appointment._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-3xl">
                        {appointment.type === 'video' || appointment.communicationMethod === 'video' ? '📹' :
                         appointment.type === 'phone' || appointment.communicationMethod === 'phone' ? '📞' :
                         appointment.type === 'chat' || appointment.communicationMethod === 'chat' ? '💬' :
                         appointment.type === 'in_person' || appointment.type === 'in-person' ? '🏥' :
                         getTypeIcon(appointment.appointmentType)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{appointment.doctorName}</h3>
                        {appointment.doctorSpecialty && (
                          <p className="text-sm text-gray-600">{appointment.doctorSpecialty}</p>
                        )}
                        {(appointment.communicationMethod || appointment.type) && (
                          <p className="text-xs text-gray-500 mt-1">
                            {appointment.communicationMethod === 'phone' ? '📞 Phone Call' :
                             appointment.communicationMethod === 'video' ? '📹 Video Call' :
                             appointment.communicationMethod === 'chat' ? '💬 Live Chat' :
                             appointment.type === 'phone' ? '📞 Phone Call' :
                             appointment.type === 'video' ? '📹 Video Call' :
                             appointment.type === 'chat' ? '💬 Live Chat' :
                             appointment.type === 'in_person' ? '🏥 In-Person' : ''}
                          </p>
                        )}
                      </div>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status === 'scheduled' ? 'Pending' : 
                         appointment.status === 'confirmed' ? 'Confirmed' :
                         appointment.status === 'cancelled' ? 'Declined' :
                         appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(appointment.appointmentDate).toLocaleDateString()}</span>
                      </div>
                      {appointment.appointmentTime && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{appointment.appointmentTime}</span>
                        </div>
                      )}
                    </div>

                    {appointment.reason && (
                      <div className="mt-3 p-3 bg-gray-50 rounded">
                        <p className="text-sm font-medium text-gray-700">Reason:</p>
                        <p className="text-sm text-gray-600 mt-1">{appointment.reason}</p>
                      </div>
                    )}

                    {appointment.notes && (
                      <div className="mt-2 p-3 bg-blue-50 rounded">
                        <p className="text-sm font-medium text-blue-700">Notes:</p>
                        <p className="text-sm text-blue-600 mt-1">{appointment.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {(appointment.status === 'confirmed' || appointment.status === 'accepted' || appointment.status === 'in_progress') && (
                          <Button
                            size="sm"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white mb-2"
                        onClick={() => navigate(`/consultation-room/${appointment._id}`)}
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                        Open Consultation Room
                          </Button>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingAppointment(appointment)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteAppointment(appointment._id)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No appointments yet</h3>
              <p className="text-gray-600 mb-4">Book your first appointment to get started.</p>
              <Button 
                onClick={() => setShowBookingForm(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Book First Appointment
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      {editingAppointment && (
        <Dialog open={!!editingAppointment} onOpenChange={() => setEditingAppointment(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Appointment</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateAppointment(editingAppointment._id, editingAppointment);
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={editingAppointment.status}
                  onValueChange={(value) => setEditingAppointment({...editingAppointment, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={editingAppointment.notes || ''}
                  onChange={(e) => setEditingAppointment({...editingAppointment, notes: e.target.value})}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  Update
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setEditingAppointment(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
