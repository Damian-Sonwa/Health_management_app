import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, User, Plus, X, Loader2, Edit, Trash2 } from 'lucide-react';
import { useAppointments } from '@/hooks/useAppointments';
import { toast } from 'sonner';

export default function AppointmentsPage() {
  const { appointments, isLoading, createAppointment, updateAppointment, deleteAppointment, isCreating, isDeleting } = useAppointments();
  
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any | null>(null);
  const [newAppointment, setNewAppointment] = useState({
    doctorName: '',
    doctorSpecialty: '',
    appointmentDate: '',
    appointmentTime: '',
    appointmentType: 'video',
    reason: '',
    notes: ''
  });

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAppointment({
        ...newAppointment,
        status: 'scheduled' // Backend accepts: scheduled, confirmed, in_progress, completed, cancelled, no_show
      });
      
      toast.success('Appointment booked successfully!');
      setShowBookingForm(false);
      setNewAppointment({
        doctorName: '',
        doctorSpecialty: '',
        appointmentDate: '',
        appointmentTime: '',
        appointmentType: 'video',
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
      case 'in-person': return '🏥';
      case 'phone': return '📞';
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
                <Label htmlFor="doctorName">Doctor Name*</Label>
                <Input
                  id="doctorName"
                  placeholder="Dr. John Smith"
                  value={newAppointment.doctorName}
                  onChange={(e) => setNewAppointment({...newAppointment, doctorName: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="specialty">Specialty</Label>
                <Input
                  id="specialty"
                  placeholder="Cardiology"
                  value={newAppointment.doctorSpecialty}
                  onChange={(e) => setNewAppointment({...newAppointment, doctorSpecialty: e.target.value})}
                />
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
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video Call</SelectItem>
                    <SelectItem value="in-person">In-Person</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                  </SelectContent>
                </Select>
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
                  disabled={!newAppointment.doctorName || !newAppointment.appointmentDate || !newAppointment.appointmentTime || isCreating}
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
                      doctorName: '',
                      doctorSpecialty: '',
                      appointmentDate: '',
                      appointmentTime: '',
                      appointmentType: 'video',
                      reason: '',
                      notes: ''
                    });
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
                      <div className="text-3xl">{getTypeIcon(appointment.appointmentType)}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{appointment.doctorName}</h3>
                        {appointment.doctorSpecialty && (
                          <p className="text-sm text-gray-600">{appointment.doctorSpecialty}</p>
                        )}
                      </div>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
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
