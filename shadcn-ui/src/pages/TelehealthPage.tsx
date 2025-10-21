import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Video, 
  Phone, 
  MessageCircle, 
  Calendar, 
  Clock, 
  User, 
  Camera, 
  Mic, 
  MicOff, 
  VideoOff, 
  PhoneOff,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Star,
  MapPin,
  Mail
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';

const API_BASE = 'http://localhost:5001/api';

interface Appointment {
  id: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorAvatar?: string;
  date: string;
  time: string;
  duration: number;
  type: 'video' | 'phone' | 'chat';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  meetingLink?: string;
}

interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  photoUrl?: string;
  rating: number;
  experience: number;
  languages: string[];
  isAvailable: boolean;
  consultationFee: number;
  bio?: string;
  clinic?: {
    name: string;
  };
}

export default function TelehealthPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/doctors`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const result = await response.json();
        setDoctors(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const [oldDoctorsState] = useState<any[]>([
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      rating: 4.9,
      experience: '15 years',
      availability: ['Mon', 'Wed', 'Fri'],
      languages: ['English', 'Spanish'],
      isOnline: true
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      specialty: 'Endocrinology',
      rating: 4.8,
      experience: '12 years',
      availability: ['Tue', 'Thu', 'Sat'],
      languages: ['English', 'Mandarin'],
      isOnline: true
    },
    {
      id: '3',
      name: 'Dr. Emily Rodriguez',
      specialty: 'General Practice',
      rating: 4.7,
      experience: '8 years',
      availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      languages: ['English', 'Spanish'],
      isOnline: false
    }
  ]);

  const [showBookForm, setShowBookForm] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    doctorId: '',
    date: '',
    time: '',
    type: 'video' as 'video' | 'phone' | 'chat',
    notes: ''
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'chat': return <MessageCircle className="w-4 h-4" />;
      default: return <Video className="w-4 h-4" />;
    }
  };

  const handleBookAppointment = () => {
    if (!newAppointment.doctorId || !newAppointment.date || !newAppointment.time) return;
    
    const doctor = doctors.find(d => d.id === newAppointment.doctorId);
    if (!doctor) return;
    
    const appointment: Appointment = {
      id: Date.now().toString(),
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
      date: newAppointment.date,
      time: newAppointment.time,
      duration: 30,
      type: newAppointment.type,
      status: 'scheduled',
      notes: newAppointment.notes
    };
    
    setAppointments(prev => [...prev, appointment]);
    setNewAppointment({
      doctorId: '',
      date: '',
      time: '',
      type: 'video',
      notes: ''
    });
    setShowBookForm(false);
  };

  const joinMeeting = (appointment: Appointment) => {
    if (appointment.type === 'video' && appointment.meetingLink) {
      window.open(appointment.meetingLink, '_blank');
    } else {
      alert(`${appointment.type === 'phone' ? 'Phone' : 'Chat'} appointment - ${appointment.doctorName} will contact you at ${appointment.time}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Telehealth
          </h1>
          <p className="text-gray-600 mt-1">Connect with healthcare providers remotely</p>
        </div>
        <Dialog open={showBookForm} onOpenChange={setShowBookForm}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Book Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Book Telehealth Appointment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="doctor">Select Doctor</Label>
                <Select value={newAppointment.doctorId} onValueChange={(value) => setNewAppointment(prev => ({ ...prev, doctorId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        <div className="flex items-center space-x-2">
                          <span>{doctor.name}</span>
                          <Badge variant="secondary">{doctor.specialty}</Badge>
                          {doctor.isOnline && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newAppointment.date}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={newAppointment.time}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="type">Appointment Type</Label>
                <Select value={newAppointment.type} onValueChange={(value: any) => setNewAppointment(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video Call</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="chat">Chat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={newAppointment.notes}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any specific concerns or questions..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleBookAppointment} className="flex-1">
                  Book Appointment
                </Button>
                <Button variant="outline" onClick={() => setShowBookForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Upcoming Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointments.filter(apt => apt.status === 'scheduled').map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {getTypeIcon(appointment.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{appointment.doctorName}</h3>
                    <p className="text-sm text-gray-500">{appointment.doctorSpecialty}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(appointment.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{appointment.time}</span>
                      </div>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => joinMeeting(appointment)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Join {appointment.type === 'video' ? 'Video' : appointment.type === 'phone' ? 'Call' : 'Chat'}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
            {appointments.filter(apt => apt.status === 'scheduled').length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No upcoming appointments</p>
                <p className="text-sm">Book an appointment to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available Doctors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            Available Doctors
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-500">Loading doctors...</p>
          ) : doctors.length === 0 ? (
            <p className="text-center text-gray-500">No doctors available at the moment.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.map((doctor) => (
                <div key={doctor._id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-3">
                    {doctor.photoUrl ? (
                      <img 
                        src={doctor.photoUrl} 
                        alt={doctor.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {doctor.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                      <p className="text-sm text-gray-500">{doctor.specialty}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${doctor.isAvailable ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span className="text-xs text-gray-500">{doctor.isAvailable ? 'Online' : 'Offline'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Rating:</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                        <span className="font-medium">{doctor.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Experience:</span>
                      <span className="font-medium">{doctor.experience} years</span>
                    </div>
                    {doctor.consultationFee && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Consultation Fee:</span>
                        <span className="font-medium">${doctor.consultationFee}</span>
                      </div>
                    )}
                    {doctor.languages && doctor.languages.length > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Languages:</span>
                        <span className="font-medium">{doctor.languages.join(', ')}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <Button 
                      size="sm" 
                      className="w-full bg-teal-600 hover:bg-teal-700" 
                      disabled={!doctor.isAvailable}
                      onClick={() => {
                        window.open('https://zoom.us/join', '_blank');
                      }}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Appointment
                    </Button>
                  </div>
              </div>
            ))}
          </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Video className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Video Consultations</h3>
                <p className="text-sm text-gray-500">Face-to-face appointments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Phone Consultations</h3>
                <p className="text-sm text-gray-500">Voice-only appointments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MessageCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Chat Consultations</h3>
                <p className="text-sm text-gray-500">Text-based appointments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
