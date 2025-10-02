import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Video, MapPin, Phone, Plus, User, CheckCircle } from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import Layout from '@/components/Layout';

export default function AppointmentsPage() {
  const { appointments, addAppointment, loading } = useSupabaseData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    doctorName: '',
    specialty: '',
    date: '',
    time: '',
    type: 'in_person' as 'video' | 'in_person' | 'phone',
    notes: ''
  });

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppointment.doctorName || !newAppointment.date || !newAppointment.time) return;

    await addAppointment({
      id: `appt_${Date.now()}`,
      userId: 'demo-user-123',
      doctorName: newAppointment.doctorName,
      specialty: newAppointment.specialty,
      date: new Date(newAppointment.date),
      time: newAppointment.time,
      type: newAppointment.type,
      status: 'scheduled',
      notes: newAppointment.notes
    });

    setNewAppointment({
      doctorName: '',
      specialty: '',
      date: '',
      time: '',
      type: 'in_person',
      notes: ''
    });
    setShowAddForm(false);
  };

  const getAppointmentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-5 h-5 text-blue-500" />;
      case 'phone':
        return <Phone className="w-5 h-5 text-green-500" />;
      default:
        return <MapPin className="w-5 h-5 text-purple-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'from-blue-400 to-indigo-500';
      case 'phone':
        return 'from-green-400 to-emerald-500';
      default:
        return 'from-purple-400 to-pink-500';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Appointments
            </h1>
            <p className="text-gray-600 mt-1">Manage your healthcare appointments</p>
          </div>
          <Button 
            onClick={() => setShowAddForm(true)} 
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="w-4 h-4 mr-2" />
            Schedule Appointment
          </Button>
        </div>

        {showAddForm && (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Schedule New Appointment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddAppointment} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="doctorName">Doctor Name</Label>
                    <Input
                      id="doctorName"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newAppointment.doctorName}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, doctorName: e.target.value }))}
                      placeholder="e.g., Dr. Sarah Johnson"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialty">Specialty</Label>
                    <Input
                      id="specialty"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newAppointment.specialty}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, specialty: e.target.value }))}
                      placeholder="e.g., Cardiology"
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newAppointment.date}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newAppointment.time}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, time: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Appointment Type</Label>
                    <select
                      id="type"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      value={newAppointment.type}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, type: e.target.value as any }))}
                    >
                      <option value="in_person">In Person</option>
                      <option value="video">Video Call</option>
                      <option value="phone">Phone Call</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Input
                      id="notes"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newAppointment.notes}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                  >
                    Schedule Appointment
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowAddForm(false)}
                    className="hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${getTypeColor(appointment.type)}`}></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full bg-gradient-to-r ${getTypeColor(appointment.type)} bg-opacity-10`}>
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{appointment.doctorName}</h3>
                      <p className="text-sm text-gray-500">{appointment.specialty}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(appointment.status)}>
                    {appointment.status === 'scheduled' && <CheckCircle className="w-3 h-3 mr-1" />}
                    {appointment.status}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(appointment.date).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{appointment.time}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {getAppointmentIcon(appointment.type)}
                    <span className="capitalize">{appointment.type.replace('_', ' ')}</span>
                  </div>

                  {appointment.notes && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 italic">"{appointment.notes}"</p>
                    </div>
                  )}

                  {appointment.type === 'video' && appointment.status === 'scheduled' && (
                    <Button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white" size="sm">
                      <Video className="w-4 h-4 mr-2" />
                      Join Video Call
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {appointments.length === 0 && (
          <Card className="border-0 shadow-xl">
            <CardContent className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-12 h-12 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Appointments Scheduled</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Schedule your first appointment with a healthcare provider. Choose from video calls, phone consultations, or in-person visits.
              </p>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="w-4 h-4 mr-2" />
                Schedule First Appointment
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}