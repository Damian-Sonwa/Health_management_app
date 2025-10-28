import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Video, 
  Phone, 
  Calendar,
  Clock,
  Star,
  User,
  Stethoscope,
  Heart,
  Activity,
  FileText,
  CheckCircle,
  AlertCircle,
  Users,
  BookOpen,
  Shield
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  avatar_url: string;
  rating: number;
  experience: string;
  availability: string;
  is_available: boolean;
}

interface Appointment {
  id: string;
  patient_name: string;
  patient_email: string;
  symptoms: string;
  appointment_date: string;
  appointment_time: string;
  doctor_id: string;
  status: string;
  created_at: string;
  doctor?: Doctor;
}

interface PatientRecord {
  id: string;
  patient_name: string;
  appointment_date: string;
  diagnosis: string;
  notes: string;
  doctor_name: string;
}

export default function Telehealth() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patientRecords, setPatientRecords] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingForm, setBookingForm] = useState({
    patient_name: '',
    patient_email: '',
    symptoms: '',
    appointment_date: '',
    appointment_time: '',
    doctor_id: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeConsultation, setActiveConsultation] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch doctors
      const { data: doctorsData, error: doctorsError } = await supabase
        .from('doctors')
        .select('*')
        .order('name');

      if (doctorsError) throw doctorsError;

      // Fetch appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          *,
          doctor:doctors(name, specialty)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (appointmentsError) throw appointmentsError;

      // Fetch patient records
      const { data: recordsData, error: recordsError } = await supabase
        .from('patient_records')
        .select('*')
        .order('appointment_date', { ascending: false })
        .limit(10);

      if (recordsError) throw recordsError;

      setDoctors(doctorsData || []);
      setAppointments(appointmentsData || []);
      setPatientRecords(recordsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([bookingForm])
        .select();

      if (error) throw error;

      // Reset form
      setBookingForm({
        patient_name: '',
        patient_email: '',
        symptoms: '',
        appointment_date: '',
        appointment_time: '',
        doctor_id: ''
      });

      // Refresh appointments
      fetchData();
      
      alert('Appointment booked successfully!');
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Error booking appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setBookingForm(prev => ({ ...prev, [field]: value }));
  };

  const startConsultation = () => {
    setActiveConsultation(true);
    alert('Starting video consultation...');
  };

  const endConsultation = () => {
    setActiveConsultation(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading telehealth services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Telehealth Services</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Connect with qualified healthcare professionals from the comfort of your home. 
            Our secure platform enables video consultations, appointment booking, and comprehensive 
            health record management for seamless healthcare delivery.
          </p>
        </div>

        {/* Active Consultation Interface */}
        {activeConsultation && (
          <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-2xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <Video className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Video Consultation Active</h3>
                    <p className="text-blue-100">Connected with healthcare provider</p>
                  </div>
                </div>
                <Badge className="bg-green-500 text-white px-4 py-2">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Connected
                </Badge>
              </div>
              
              <div className="flex items-center justify-center space-x-6">
                <Button
                  variant="secondary"
                  size="lg"
                  className="rounded-full w-16 h-16 bg-white/20 hover:bg-white/30"
                >
                  <Phone className="w-6 h-6" />
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  className="rounded-full w-16 h-16 bg-white/20 hover:bg-white/30"
                >
                  <Video className="w-6 h-6" />
                </Button>
                <Button
                  onClick={endConsultation}
                  variant="destructive"
                  size="lg"
                  className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600"
                >
                  <Phone className="w-6 h-6 rotate-135" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Appointment Booking Form */}
          <Card className="shadow-xl border-0 bg-white">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-2 text-xl">
                <Calendar className="w-6 h-6" />
                <span>Book Appointment</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleBookingSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient_name" className="text-gray-700 font-medium">
                      Full Name
                    </Label>
                    <Input
                      id="patient_name"
                      value={bookingForm.patient_name}
                      onChange={(e) => handleInputChange('patient_name', e.target.value)}
                      placeholder="Enter your full name"
                      required
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patient_email" className="text-gray-700 font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="patient_email"
                      type="email"
                      value={bookingForm.patient_email}
                      onChange={(e) => handleInputChange('patient_email', e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="symptoms" className="text-gray-700 font-medium">
                    Symptoms / Reason for Visit
                  </Label>
                  <Textarea
                    id="symptoms"
                    value={bookingForm.symptoms}
                    onChange={(e) => handleInputChange('symptoms', e.target.value)}
                    placeholder="Describe your symptoms or reason for consultation"
                    required
                    className="border-gray-300 focus:border-blue-500 min-h-24"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="appointment_date" className="text-gray-700 font-medium">
                      Preferred Date
                    </Label>
                    <Input
                      id="appointment_date"
                      type="date"
                      value={bookingForm.appointment_date}
                      onChange={(e) => handleInputChange('appointment_date', e.target.value)}
                      required
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="appointment_time" className="text-gray-700 font-medium">
                      Preferred Time
                    </Label>
                    <Input
                      id="appointment_time"
                      type="time"
                      value={bookingForm.appointment_time}
                      onChange={(e) => handleInputChange('appointment_time', e.target.value)}
                      required
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Select Doctor</Label>
                  <Select value={bookingForm.doctor_id} onValueChange={(value) => handleInputChange('doctor_id', value)}>
                    <SelectTrigger className="border-gray-300 focus:border-blue-500">
                      <SelectValue placeholder="Choose a doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          <div className="flex items-center space-x-2">
                            <span>{doctor.name}</span>
                            <span className="text-gray-500">- {doctor.specialty}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white py-3 text-lg font-medium"
                >
                  {isSubmitting ? 'Booking...' : 'Book Appointment'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Video Consultation Access */}
          <Card className="shadow-xl border-0 bg-white">
            <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-2 text-xl">
                <Video className="w-6 h-6" />
                <span>Video Consultation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-gradient-to-r from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Video className="w-12 h-12 text-green-600" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Connect</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Start your secure video consultation with a healthcare professional. 
                    Ensure you have a stable internet connection and are in a quiet, private space.
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Before You Start:</h4>
                  <ul className="text-sm text-blue-700 space-y-1 text-left">
                    <li>• Ensure good lighting and camera positioning</li>
                    <li>• Have your medical history and current medications ready</li>
                    <li>• Test your microphone and speakers</li>
                    <li>• Find a quiet, private location</li>
                  </ul>
                </div>

                <Button
                  onClick={startConsultation}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-4 text-lg font-medium"
                >
                  <Video className="w-5 h-5 mr-2" />
                  Start Consultation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patient Records Section */}
        <Card className="shadow-xl border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-2 text-xl">
              <FileText className="w-6 h-6" />
              <span>Recent Patient Records</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {patientRecords.length > 0 ? (
              <div className="space-y-4">
                {patientRecords.map((record) => (
                  <div key={record.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{record.patient_name}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          <strong>Date:</strong> {new Date(record.appointment_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Doctor:</strong> {record.doctor_name}
                        </p>
                        <p className="text-sm text-gray-800 mt-2">
                          <strong>Diagnosis:</strong> {record.diagnosis}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">{record.notes}</p>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-300">
                        Completed
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No patient records found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Appointments */}
        <Card className="shadow-xl border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-2 text-xl">
              <Calendar className="w-6 h-6" />
              <span>Recent Appointments</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{appointment.patient_name}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          <strong>Date:</strong> {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.appointment_time}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Doctor:</strong> {appointment.doctor?.name} - {appointment.doctor?.specialty}
                        </p>
                        <p className="text-sm text-gray-700 mt-2">{appointment.symptoms}</p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={
                          appointment.status === 'completed' ? 'text-green-600 border-green-300' :
                          appointment.status === 'scheduled' ? 'text-blue-600 border-blue-300' :
                          'text-yellow-600 border-yellow-300'
                        }
                      >
                        {appointment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No appointments found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Doctors List */}
        <Card className="shadow-xl border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-2 text-xl">
              <Users className="w-6 h-6" />
              <span>Available Doctors</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="bg-gradient-to-br from-blue-50 to-green-50 p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="text-center">
                    <div className="relative mb-4">
                      <Avatar className="w-20 h-20 mx-auto border-4 border-white shadow-lg">
                        <AvatarImage src={doctor.avatar_url} alt={doctor.name} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-green-500 text-white text-xl">
                          {doctor.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white ${
                        doctor.is_available ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{doctor.name}</h3>
                    <p className="text-blue-600 font-medium mb-2">{doctor.specialty}</p>
                    
                    <div className="flex items-center justify-center space-x-1 mb-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium text-gray-700">{doctor.rating}</span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{doctor.experience} experience</p>
                    <p className="text-xs text-gray-500 mb-4">{doctor.availability}</p>
                    
                    <Badge 
                      className={doctor.is_available ? 
                        "bg-green-100 text-green-800 border-green-300" : 
                        "bg-gray-100 text-gray-600 border-gray-300"
                      }
                    >
                      {doctor.is_available ? 'Available' : 'Busy'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            
            {doctors.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No doctors available at the moment</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Secure & Private</h3>
            <p className="text-blue-600 text-sm">
              HIPAA-compliant platform with end-to-end encryption for your privacy and security.
            </p>
          </Card>

          <Card className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-green-800 mb-2">Quality Care</h3>
            <p className="text-green-600 text-sm">
              Access to board-certified doctors and specialists for comprehensive healthcare.
            </p>
          </Card>

          <Card className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg">
            <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-purple-800 mb-2">24/7 Available</h3>
            <p className="text-purple-600 text-sm">
              Round-the-clock access to healthcare professionals when you need them most.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}