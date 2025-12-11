import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Users, 
  Plus, 
  Phone, 
  Mail, 
  Edit, 
  Trash2, 
  AlertTriangle,
  X,
  Loader2
} from 'lucide-react';
import { useCaregivers } from '@/hooks/useCaregivers';
import { useToast } from '@/hooks/use-toast';

interface CaregiverFormData {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  emergencyContact: boolean;
  primaryCaregiver: boolean;
  availability: string;
  specialization: string;
  notes: string;
}

const RELATIONSHIP_OPTIONS = [
  { value: 'family', label: 'Family Member' },
  { value: 'friend', label: 'Friend' },
  { value: 'professional', label: 'Professional Caregiver' },
  { value: 'nurse', label: 'Nurse' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'therapist', label: 'Therapist' },
  { value: 'other', label: 'Other' }
];

const AVAILABILITY_OPTIONS = [
  { value: 'full-time', label: 'Full Time' },
  { value: 'part-time', label: 'Part Time' },
  { value: 'on-call', label: 'On Call' },
  { value: 'weekends', label: 'Weekends' },
  { value: 'weekdays', label: 'Weekdays' }
];

export default function CaregiversModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const { caregivers, isLoading, createCaregiver, updateCaregiver, deleteCaregiver, isCreating, isUpdating, isDeleting } = useCaregivers();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCaregiver, setEditingCaregiver] = useState<any>(null);
  const [formData, setFormData] = useState<CaregiverFormData>({
    name: '',
    relationship: 'family',
    phone: '',
    email: '',
    emergencyContact: false,
    primaryCaregiver: false,
    availability: 'on-call',
    specialization: '',
    notes: ''
  });

  const handleAddCaregiver = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createCaregiver(formData);
      toast({
        title: 'Success!',
        description: 'Caregiver added successfully',
      });
      setShowAddForm(false);
      resetForm();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add caregiver',
        variant: 'destructive',
      });
    }
  };

  const handleEditCaregiver = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingCaregiver) return;

    try {
      await updateCaregiver({ id: editingCaregiver._id, data: formData });
      toast({
        title: 'Success!',
        description: 'Caregiver updated successfully',
      });
      setEditingCaregiver(null);
      resetForm();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update caregiver',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCaregiver = async (id: string) => {
    if (!confirm('Are you sure you want to remove this caregiver?')) return;

    try {
      await deleteCaregiver(id);
      toast({
        title: 'Success!',
        description: 'Caregiver removed successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove caregiver',
        variant: 'destructive',
      });
    }
  };

  const startEdit = (caregiver: any) => {
    setEditingCaregiver(caregiver);
    setFormData({
      name: caregiver.name,
      relationship: caregiver.relationship,
      phone: caregiver.phone || '',
      email: caregiver.email || '',
      emergencyContact: caregiver.emergencyContact,
      primaryCaregiver: caregiver.primaryCaregiver,
      availability: caregiver.availability || 'on-call',
      specialization: caregiver.specialization || '',
      notes: caregiver.notes || ''
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      relationship: 'family',
      phone: '',
      email: '',
      emergencyContact: false,
      primaryCaregiver: false,
      availability: 'on-call',
      specialization: '',
      notes: ''
    });
  };

  const cancelEdit = () => {
    setEditingCaregiver(null);
    setShowAddForm(false);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Users className="h-6 w-6 text-teal-600" />
            Caregivers & Emergency Contacts
          </DialogTitle>
          <DialogDescription>
            Manage your caregivers and emergency contacts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add/Edit Form */}
          {(showAddForm || editingCaregiver) && (
            <Card className="border-teal-200 bg-teal-50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{editingCaregiver ? 'Edit Caregiver' : 'Add New Caregiver'}</span>
                  <Button variant="ghost" size="sm" onClick={cancelEdit}>
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={editingCaregiver ? handleEditCaregiver : handleAddCaregiver} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="Enter caregiver name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="relationship">Relationship *</Label>
                      <Select
                        value={formData.relationship}
                        onValueChange={(value) => setFormData({ ...formData, relationship: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RELATIONSHIP_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="caregiver@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="availability">Availability</Label>
                    <Select
                      value={formData.availability}
                      onValueChange={(value) => setFormData({ ...formData, availability: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABILITY_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input
                      id="specialization"
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      placeholder="e.g., Physical Therapy, Home Care, etc."
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional information..."
                    />
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="emergencyContact"
                        checked={formData.emergencyContact}
                        onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="emergencyContact" className="cursor-pointer">
                        Emergency Contact
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="primaryCaregiver"
                        checked={formData.primaryCaregiver}
                        onChange={(e) => setFormData({ ...formData, primaryCaregiver: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="primaryCaregiver" className="cursor-pointer">
                        Primary Caregiver
                      </Label>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      type="submit" 
                      className="bg-teal-600 hover:bg-teal-700"
                      disabled={isCreating || isUpdating}
                    >
                      {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {editingCaregiver ? 'Update Caregiver' : 'Add Caregiver'}
                    </Button>
                    <Button type="button" variant="outline" onClick={cancelEdit}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Add Button */}
          {!showAddForm && !editingCaregiver && (
            <Button 
              onClick={() => setShowAddForm(true)} 
              className="w-full bg-teal-600 hover:bg-teal-700"
              disabled={isCreating}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Caregiver
            </Button>
          )}

          {/* Caregivers List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                <span className="ml-2 text-gray-500">Loading caregivers...</span>
              </div>
            ) : caregivers.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-6 text-center text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No caregivers added yet.</p>
                  <p className="text-sm">Click "Add New Caregiver" to get started.</p>
                </CardContent>
              </Card>
            ) : (
              caregivers.map(caregiver => (
                <Card key={caregiver._id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{caregiver.name}</h3>
                          {caregiver.primaryCaregiver && (
                            <Badge className="bg-teal-500 text-white">
                              Primary
                            </Badge>
                          )}
                          {caregiver.emergencyContact && (
                            <Badge className="bg-red-500 text-white flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Emergency
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 capitalize mb-2">
                          {caregiver.relationship}
                        </p>
                        <div className="space-y-1">
                          {caregiver.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span>{caregiver.phone}</span>
                            </div>
                          )}
                          {caregiver.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span>{caregiver.email}</span>
                            </div>
                          )}
                          {caregiver.availability && (
                            <p className="text-sm text-gray-500 capitalize">
                              Available: {caregiver.availability.replace('-', ' ')}
                            </p>
                          )}
                          {caregiver.specialization && (
                            <p className="text-sm text-gray-500">
                              Specialization: {caregiver.specialization}
                            </p>
                          )}
                          {caregiver.notes && (
                            <p className="text-sm text-gray-500 italic">
                              {caregiver.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => startEdit(caregiver)}
                          disabled={isUpdating}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteCaregiver(caregiver._id)}
                          disabled={isDeleting}
                        >
                          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
