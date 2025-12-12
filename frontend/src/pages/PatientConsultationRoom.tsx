import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Phone, 
  Video, 
  MessageCircle, 
  PhoneOff, 
  VideoOff, 
  Mic, 
  MicOff, 
  FileText,
  Image as ImageIcon,
  Download,
  Calendar,
  Clock,
  User,
  Plus,
  X,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  File
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { API_BASE_URL } from '@/config/api';
import { toast } from 'sonner';
import { useDoctors } from '@/hooks/useDoctors';

interface Appointment {
  _id: string;
  doctorName: string;
  doctorId?: string;
  specialty: string;
  appointmentDate: string;
  appointmentTime: string;
  type: 'video' | 'in_person' | 'phone';
  communicationMethod?: 'phone' | 'video';
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  reason: string;
  notes?: string;
  videoCall?: {
    meetingLink?: string;
    meetingId?: string;
  };
}

// REMOVED: Message, FileAttachment, Prescription interfaces - were part of chat interface

type ConsultationMode = 'phone' | 'video' | null; // REMOVED: 'chat' mode

export default function PatientConsultationRoom() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State management
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [activeMode, setActiveMode] = useState<ConsultationMode>(null);
  const [loading, setLoading] = useState(true);
  
  // Appointment scheduling
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    doctorId: '',
    doctorName: '',
    specialty: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    communicationMethod: 'video' as 'phone' | 'video'
  });
  
  // Phone call state
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  
  // Video call state
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  
  // REMOVED: Chat state - chat functionality removed
  // REMOVED: File sharing and prescriptions - were part of chat interface
  
  // Doctors list
  const { doctors, isLoading: doctorsLoading } = useDoctors({ isActive: true });

  useEffect(() => {
    fetchAppointments();
  }, []);

  // REMOVED: File fetching useEffect - was part of chat interface
  // REMOVED: Chat message fetching and polling useEffect - chat functionality removed
  // REMOVED: Chat scroll tracking useEffect - chat functionality removed

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch appointments:', response.status, errorText);
        throw new Error(`Failed to fetch appointments: ${response.status}`);
      }
      
      const text = await response.text();
      if (!text || text.trim() === '') {
        console.warn('Empty response from appointments endpoint');
        setAppointments([]);
        return;
      }
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('Error parsing appointments response:', parseError, 'Response text:', text);
        throw new Error('Invalid JSON response from server');
      }
      
      if (data.success || data.data || data.appointments) {
        const apps = data.appointments || data.data || [];
        // Filter to show only patient's appointments
        // Check both userId and patientId fields, and handle populated objects
        const currentUserId = (user?.id || user?._id)?.toString();
        const patientApps = apps.filter((apt: any) => {
          // Handle userId - could be ObjectId string or populated object
          const aptUserId = apt.userId?._id?.toString() || apt.userId?.toString() || apt.userId;
          // Handle patientId - could be ObjectId string or populated object
          const aptPatientId = apt.patientId?._id?.toString() || apt.patientId?.toString() || apt.patientId;
          // Match if either userId or patientId matches current user
          return aptUserId === currentUserId || aptPatientId === currentUserId;
        });
        console.log('📋 PatientConsultationRoom - Total appointments:', apps.length);
        console.log('📋 PatientConsultationRoom - Filtered patient appointments:', patientApps.length);
        console.log('📋 PatientConsultationRoom - Current user ID:', currentUserId);
        setAppointments(patientApps);
        if (patientApps.length > 0 && !selectedAppointment) {
          setSelectedAppointment(patientApps[0]);
        }
      } else {
        console.warn('⚠️ PatientConsultationRoom - No appointments data in response:', data);
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  // REMOVED: fetchMessages, fetchFiles, fetchPrescriptions, scrollToBottom - were part of chat interface

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAppointment.doctorId || !newAppointment.appointmentDate || !newAppointment.appointmentTime || !newAppointment.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const selectedDoctor = doctors.find(d => d._id === newAppointment.doctorId);
      
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorName: selectedDoctor?.name || newAppointment.doctorName,
          doctorId: newAppointment.doctorId,
          specialty: selectedDoctor?.specialty || newAppointment.specialty,
          appointmentDate: newAppointment.appointmentDate,
          appointmentTime: newAppointment.appointmentTime,
          type: newAppointment.communicationMethod,
          communicationMethod: newAppointment.communicationMethod,
          reason: newAppointment.reason,
          status: 'scheduled'
        })
      });

      const data = await response.json();
      
      if (data.success || response.ok) {
        toast.success('Appointment scheduled successfully!');
        setShowBookingForm(false);
        setNewAppointment({
          doctorId: '',
          doctorName: '',
          specialty: '',
          appointmentDate: '',
          appointmentTime: '',
          reason: '',
          communicationMethod: 'video'
        });
        await fetchAppointments();
      } else {
        throw new Error(data.message || 'Failed to schedule appointment');
      }
    } catch (error: any) {
      toast.error(`Failed to schedule appointment: ${error.message}`);
    }
  };

  // REMOVED: handleFileUpload, sendMessage, sendMessageWithFile - were part of chat interface

  const handleInitiatePhoneCall = async () => {
    if (!selectedAppointment?.doctorId) {
      toast.error('Doctor information not available');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      await fetch(`${API_BASE_URL}/consultation/call/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          appointmentId: selectedAppointment._id,
          doctorId: selectedAppointment.doctorId,
          callType: 'phone'
        })
      });

      // Get doctor's phone number (would need to fetch doctor details)
      toast.info('Initiating phone call...');
      setIsCallActive(true);
      setActiveMode('phone');
      
      const startTime = Date.now();
      const interval = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      (window as any).callInterval = interval;
    } catch (error) {
      console.error('Error initiating call:', error);
      toast.error('Failed to initiate call');
    }
  };

  const handleEndPhoneCall = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`${API_BASE_URL}/consultation/call/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          appointmentId: selectedAppointment?._id,
          callType: 'phone',
          duration: callDuration
        })
      });

      if ((window as any).callInterval) {
        clearInterval((window as any).callInterval);
      }
      
      setIsCallActive(false);
      setCallDuration(0);
      setActiveMode(null);
      toast.info('Call ended');
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  const handleInitiateVideoCall = async () => {
    try {
      setActiveMode('video');
      setIsVideoActive(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setLocalStream(stream);

      const token = localStorage.getItem('authToken');
      await fetch(`${API_BASE_URL}/consultation/video/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          appointmentId: selectedAppointment?._id,
          doctorId: selectedAppointment?.doctorId,
          meetingId: `meeting_${selectedAppointment?._id}_${Date.now()}`
        })
      });

      toast.success('Video call started');
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast.error('Failed to access camera/microphone. Please check permissions.');
      setIsVideoActive(false);
      setActiveMode(null);
    }
  };

  const handleEndVideoCall = async () => {
    try {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }

      const token = localStorage.getItem('authToken');
      await fetch(`${API_BASE_URL}/consultation/video/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          appointmentId: selectedAppointment?._id
        })
      });

      setIsVideoActive(false);
      setActiveMode(null);
      setLocalStream(null);
      toast.info('Video call ended');
    } catch (error) {
      console.error('Error ending video call:', error);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoMuted;
        setIsVideoMuted(!isVideoMuted);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioMuted;
        setIsAudioMuted(!isAudioMuted);
      }
    }
  };

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6">
          <Card className="bg-white shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Consultation Room
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Schedule appointments, communicate with doctors, and share medical files
                  </CardDescription>
                </div>
                <Dialog open={showBookingForm} onOpenChange={setShowBookingForm}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Schedule Appointment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Schedule New Appointment</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleBookAppointment} className="space-y-4">
                      <div>
                        <Label htmlFor="doctor">Doctor *</Label>
                        <Select
                          value={newAppointment.doctorId}
                          onValueChange={(value) => {
                            const doctor = doctors.find(d => d._id === value);
                            setNewAppointment({
                              ...newAppointment,
                              doctorId: value,
                              doctorName: doctor?.name || '',
                              specialty: doctor?.specialty || ''
                            });
                          }}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a doctor" />
                          </SelectTrigger>
                          <SelectContent>
                            {doctorsLoading ? (
                              <SelectItem value="loading" disabled>Loading doctors...</SelectItem>
                            ) : doctors.length > 0 ? (
                              doctors.map((doctor) => (
                                <SelectItem key={doctor._id} value={doctor._id}>
                                  {doctor.name} - {doctor.specialty}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-doctors" disabled>No doctors available</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="date">Date *</Label>
                          <Input
                            id="date"
                            type="date"
                            value={newAppointment.appointmentDate}
                            onChange={(e) => setNewAppointment({ ...newAppointment, appointmentDate: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="time">Time *</Label>
                          <Input
                            id="time"
                            type="time"
                            value={newAppointment.appointmentTime}
                            onChange={(e) => setNewAppointment({ ...newAppointment, appointmentTime: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="communicationMethod">Communication Method *</Label>
                        <Select
                          value={newAppointment.communicationMethod}
                          onValueChange={(value: 'phone' | 'video' | 'chat') => setNewAppointment({ ...newAppointment, communicationMethod: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="video">Video Call</SelectItem>
                            <SelectItem value="phone">Phone Call</SelectItem>
                            {/* REMOVED: Live Chat option - chat functionality removed */}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="reason">Reason for Appointment *</Label>
                        <Textarea
                          id="reason"
                          value={newAppointment.reason}
                          onChange={(e) => setNewAppointment({ ...newAppointment, reason: e.target.value })}
                          placeholder="Describe your reason for the appointment..."
                          required
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                          Schedule Appointment
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowBookingForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Appointments List */}
          <Card className="lg:col-span-1 bg-white shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">My Appointments</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-y-auto">
                {appointments.length > 0 ? (
                  <div className="divide-y">
                    {appointments.map((apt) => (
                      <button
                        key={apt._id}
                        onClick={() => {
                          setSelectedAppointment(apt);
                          setActiveMode(null);
                        }}
                        className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                          selectedAppointment?._id === apt._id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {apt.doctorName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {apt.doctorName}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {new Date(apt.appointmentDate).toLocaleDateString()} at {apt.appointmentTime}
                            </p>
                            <Badge className={
                              apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              apt.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              apt.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                              'bg-yellow-100 text-yellow-800'
                            }>
                              {apt.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No appointments scheduled</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {selectedAppointment ? (
              <>
                {/* Appointment Details */}
                <Card className="bg-white shadow-md">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">{selectedAppointment.doctorName}</CardTitle>
                        <CardDescription>
                          {selectedAppointment.specialty} • {new Date(selectedAppointment.appointmentDate).toLocaleDateString()} at {selectedAppointment.appointmentTime}
                        </CardDescription>
                      </div>
                      <Badge className={
                        selectedAppointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        selectedAppointment.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {selectedAppointment.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">
                      <strong>Reason:</strong> {selectedAppointment.reason}
                    </p>
                    
                    {/* Communication Buttons - Always visible for any appointment */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-blue-600" />
                        Communication Options
                      </h3>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                          onClick={handleInitiatePhoneCall}
                          disabled={isCallActive || (selectedAppointment.status !== 'confirmed' && selectedAppointment.status !== 'in_progress' && selectedAppointment.status !== 'scheduled')}
                          className={`flex-1 ${
                            activeMode === 'phone' 
                              ? 'bg-green-600 hover:bg-green-700 text-white' 
                              : selectedAppointment.status === 'confirmed' || selectedAppointment.status === 'in_progress' || selectedAppointment.status === 'scheduled'
                              ? 'bg-green-100 hover:bg-green-200 text-green-700'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                          title={selectedAppointment.status !== 'confirmed' && selectedAppointment.status !== 'in_progress' && selectedAppointment.status !== 'scheduled' ? 'Appointment must be scheduled first' : 'Initiate phone call'}
                        >
                          <Phone className="w-5 h-5 mr-2" />
                          {isCallActive ? `Call Active (${formatCallDuration(callDuration)})` : 'Phone Call'}
                        </Button>
                        
                        <Button
                          onClick={handleInitiateVideoCall}
                          disabled={isVideoActive || (selectedAppointment.status !== 'confirmed' && selectedAppointment.status !== 'in_progress' && selectedAppointment.status !== 'scheduled')}
                          className={`flex-1 ${
                            activeMode === 'video' 
                              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                              : selectedAppointment.status === 'confirmed' || selectedAppointment.status === 'in_progress' || selectedAppointment.status === 'scheduled'
                              ? 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                          title={selectedAppointment.status !== 'confirmed' && selectedAppointment.status !== 'in_progress' && selectedAppointment.status !== 'scheduled' ? 'Appointment must be scheduled first' : 'Start video call'}
                        >
                          <Video className="w-5 h-5 mr-2" />
                          {isVideoActive ? 'Video Active' : 'Video Call'}
                        </Button>
                        
                        {/* REMOVED: Live Chat button - chat functionality removed, use phone/video/email instead */}
                      </div>
                      {(selectedAppointment.status !== 'confirmed' && selectedAppointment.status !== 'in_progress') && (
                        <p className="text-sm text-gray-500 mt-2">
                          <AlertCircle className="w-4 h-4 inline mr-1" />
                          Communication features will be available once your appointment is confirmed by the doctor.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Communication Interfaces */}
                {activeMode === 'phone' && isCallActive && (
                  <Card className="bg-white shadow-lg">
                    <CardContent className="p-8">
                      <div className="flex flex-col items-center justify-center space-y-6">
                        <div className="w-32 h-32 rounded-full bg-green-100 flex items-center justify-center">
                          <Phone className="w-16 h-16 text-green-600" />
                        </div>
                        <div className="text-center">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {selectedAppointment.doctorName}
                          </h3>
                          <p className="text-3xl font-mono font-bold text-green-600">
                            {formatCallDuration(callDuration)}
                          </p>
                        </div>
                        <Button
                          onClick={handleEndPhoneCall}
                          size="lg"
                          className="bg-red-600 hover:bg-red-700 rounded-full w-20 h-20"
                        >
                          <PhoneOff className="w-8 h-8" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeMode === 'video' && isVideoActive && (
                  <Card className="bg-black shadow-lg">
                    <CardContent className="p-0">
                      <div className="relative h-[500px]">
                        <video
                          ref={remoteVideoRef}
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-4 right-4 w-48 h-36 rounded-lg overflow-hidden border-2 border-white shadow-lg bg-gray-900">
                          <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                          />
                          {isVideoMuted && (
                            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                              <VideoOff className="w-8 h-8 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                          <div className="flex items-center justify-center gap-4">
                            <Button
                              onClick={toggleAudio}
                              size="lg"
                              className={`rounded-full ${
                                isAudioMuted 
                                  ? 'bg-red-600 hover:bg-red-700' 
                                  : 'bg-gray-700 hover:bg-gray-600'
                              }`}
                            >
                              {isAudioMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                            </Button>
                            <Button
                              onClick={toggleVideo}
                              size="lg"
                              className={`rounded-full ${
                                isVideoMuted 
                                  ? 'bg-red-600 hover:bg-red-700' 
                                  : 'bg-gray-700 hover:bg-gray-600'
                              }`}
                            >
                              {isVideoMuted ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                            </Button>
                            <Button
                              onClick={handleEndVideoCall}
                              size="lg"
                              className="rounded-full bg-red-600 hover:bg-red-700"
                            >
                              <PhoneOff className="w-6 h-6" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* REMOVED: Chat Interface - chat functionality removed, use phone/video/email instead */}
                {/* REMOVED: File Sharing and Prescriptions sections - were part of chat interface */}
              </>
            ) : (
              <Card className="bg-white shadow-md">
                <CardContent className="p-12 text-center">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">Select an appointment to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

