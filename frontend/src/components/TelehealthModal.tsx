import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Video, 
  Phone, 
  Calendar, 
  Clock, 
  Star, 
  MessageCircle, 
  X,
  VideoIcon,
  PhoneCall,
  Users
} from 'lucide-react';
import { API_BASE_URL } from '@/config/api';

interface TelehealthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const doctors = [
  {
    id: 1,
    name: "Dr. Sarah Wilson",
    specialty: "Cardiologist",
    rating: 4.9,
    nextAvailable: "Today 2:30 PM",
    avatar: "/images/doctor.jpg",
    status: "online"
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialty: "General Practitioner",
    rating: 4.8,
    nextAvailable: "Tomorrow 10:00 AM",
    avatar: "/images/profilepicture.jpg",
    status: "busy"
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    specialty: "Endocrinologist",
    rating: 4.9,
    nextAvailable: "Today 4:15 PM",
    avatar: "/images/PatientAvatar.jpg",
    status: "online"
  }
];

export default function TelehealthModal({ isOpen, onClose }: TelehealthModalProps) {
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);

  const handleVideoCall = (doctorName: string) => {
    // Generate Zoom meeting link
    const zoomLink = `https://zoom.us/j/${Date.now()}?pwd=${btoa(doctorName)}`;
    alert(`Starting video call with ${doctorName}...\n\nJoining Zoom meeting:\n${zoomLink}`);
    // Open Zoom in new window
    window.open(zoomLink, '_blank');
  };

  const handleAudioCall = (doctorName: string) => {
    alert(`Initiating audio call with ${doctorName}...\n\nYou will receive a call shortly.`);
  };

  const handleSchedule = async (doctorName: string, specialty: string) => {
    // Create an appointment
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    const appointmentData = {
      doctorName,
      specialty,
      appointmentDate: dateStr,
      appointmentTime: '10:00',
      type: 'video',
      reason: 'Consultation'
    };
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(appointmentData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`Appointment scheduled with ${doctorName}!\n\nDate: ${dateStr}\nTime: 10:00 AM\n\nYou can view or modify this appointment in the Appointments page.`);
      } else {
        throw new Error(data.message || 'Failed to schedule appointment');
      }
    } catch (error: any) {
      alert(`Failed to schedule appointment: ${error.message}`);
    }
  };

  const handleQuickAction = (action: string) => {
    if (action === 'video') {
      alert('Connecting to next available doctor via Zoom video call...');
      const zoomLink = `https://zoom.us/j/${Date.now()}?pwd=${btoa('instant-consultation')}`;
      window.open(zoomLink, '_blank');
    } else if (action === 'phone') {
      alert('Connecting to next available doctor via phone...\nYou will receive a call within 2 minutes.');
    } else if (action === 'chat') {
      alert('Opening chat consultation with next available doctor...');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center">
              <Video className="w-6 h-6 mr-2 text-blue-500" />
              Telehealth Consultations
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card 
              className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleQuickAction('video')}
            >
              <CardContent className="p-4 text-center">
                <VideoIcon className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <h3 className="font-semibold text-blue-800">Video Call</h3>
                <p className="text-sm text-blue-600">Start instant consultation</p>
              </CardContent>
            </Card>
            
            <Card 
              className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleQuickAction('phone')}
            >
              <CardContent className="p-4 text-center">
                <PhoneCall className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <h3 className="font-semibold text-green-800">Phone Call</h3>
                <p className="text-sm text-green-600">Audio consultation</p>
              </CardContent>
            </Card>
            
            <Card 
              className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleQuickAction('chat')}
            >
              <CardContent className="p-4 text-center">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <h3 className="font-semibold text-purple-800">Chat</h3>
                <p className="text-sm text-purple-600">Text consultation</p>
              </CardContent>
            </Card>
          </div>

          {/* Available Doctors */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Doctors</h3>
            <div className="space-y-4">
              {doctors.map((doctor) => (
                <Card 
                  key={doctor.id} 
                  className={`hover:shadow-lg transition-all cursor-pointer ${
                    selectedDoctor === doctor.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedDoctor(doctor.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={doctor.avatar} alt={doctor.name} />
                            <AvatarFallback>{doctor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                            doctor.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                          }`}></div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-800">{doctor.name}</h4>
                          <p className="text-sm text-gray-600">{doctor.specialty}</p>
                          <div className="flex items-center mt-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm text-gray-600 ml-1">{doctor.rating}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge className={`mb-2 ${
                          doctor.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {doctor.status === 'online' ? 'Available Now' : 'Busy'}
                        </Badge>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-1" />
                          {doctor.nextAvailable}
                        </div>
                      </div>
                    </div>
                    
                    {selectedDoctor === doctor.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex space-x-2">
                          <Button 
                            className="flex-1 bg-blue-500 hover:bg-blue-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVideoCall(doctor.name);
                            }}
                          >
                            <Video className="w-4 h-4 mr-2" />
                            Video Call
                          </Button>
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAudioCall(doctor.name);
                            }}
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            Audio Call
                          </Button>
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSchedule(doctor.name, doctor.specialty);
                            }}
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            Schedule
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Consultations */}
          <Card className="bg-gray-50">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Recent Consultations</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={doctors[0].avatar} />
                      <AvatarFallback>SW</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-800">Dr. Sarah Wilson</p>
                      <p className="text-sm text-gray-600">Cardiology Follow-up</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Yesterday</p>
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={doctors[2].avatar} />
                      <AvatarFallback>ER</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-800">Dr. Emily Rodriguez</p>
                      <p className="text-sm text-gray-600">Diabetes Management</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">3 days ago</p>
                    <Badge className="bg-blue-100 text-blue-800">Follow-up Needed</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}