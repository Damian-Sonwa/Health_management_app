// ===== Caregivers Page =====
// This page lets users add and manage their caregivers (family, nurses, doctors)
// Each user starts with an empty list - they add their own caregivers

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Users, 
  Plus, 
  Phone, 
  Mail, 
  Heart, 
  Shield, 
  Edit, 
  Trash2, 
  UserPlus,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { toast } from 'sonner';
import { useCaregivers } from '@/hooks/useCaregivers';

export default function CaregiversPage() {
  const { user } = useAuth();
  
  // Use React Query hook to get caregivers from server
  // This automatically handles loading, errors, and keeps data fresh
  const { 
    caregivers, 
    isLoading, 
    createCaregiver, 
    updateCaregiver, 
    deleteCaregiver,
    isCreating,
    isUpdating,
    isDeleting
  } = useCaregivers();

  // Dialog states (for opening/closing add and edit forms)
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingCaregiver, setEditingCaregiver] = useState<any>(null);
  
  // Form data for adding/editing caregiver
  const [newCaregiver, setNewCaregiver] = useState({
    name: '',
    email: '',
    phone: '',
    relationship: '',
    emergencyContact: false,
    primaryCaregiver: false,
    availability: '',
    specialization: '',
    notes: ''
  });

  // Add a new caregiver to the database
  const handleAddCaregiver = async () => {
    if (!newCaregiver.name) {
      toast.error('Please enter a name');
      return;
    }
    
    try {
      await createCaregiver(newCaregiver);
      
      // Reset form
      setNewCaregiver({
        name: '',
        email: '',
        phone: '',
        relationship: '',
        emergencyContact: false,
        primaryCaregiver: false,
        availability: '',
        specialization: '',
        notes: ''
      });
      setShowAddForm(false);
      toast.success('✅ Caregiver added successfully!');
    } catch (error) {
      toast.error('Failed to add caregiver');
      console.error(error);
    }
  };

  // Open edit form with caregiver data
  const handleEditCaregiver = (caregiver: any) => {
    setEditingCaregiver(caregiver);
    setNewCaregiver({
      name: caregiver.name || '',
      email: caregiver.email || '',
      phone: caregiver.phone || '',
      relationship: caregiver.relationship || '',
      emergencyContact: caregiver.emergencyContact || false,
      primaryCaregiver: caregiver.primaryCaregiver || false,
      availability: caregiver.availability || '',
      specialization: caregiver.specialization || '',
      notes: caregiver.notes || ''
    });
    setShowEditForm(true);
  };

  // Save edited caregiver to database
  const handleSaveEdit = async () => {
    if (!editingCaregiver || !newCaregiver.name) {
      toast.error('Please enter a name');
      return;
    }
    
    try {
      await updateCaregiver({ 
        id: editingCaregiver._id, 
        data: newCaregiver 
      });
      
      setEditingCaregiver(null);
      setNewCaregiver({
        name: '',
        email: '',
        phone: '',
        relationship: '',
        emergencyContact: false,
        primaryCaregiver: false,
        availability: '',
        specialization: '',
        notes: ''
      });
      setShowEditForm(false);
      toast.success('✅ Caregiver updated successfully!');
    } catch (error) {
      toast.error('Failed to update caregiver');
      console.error(error);
    }
  };

  // Delete caregiver from database
  const handleRemoveCaregiver = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this caregiver?')) {
      try {
        await deleteCaregiver(id);
        toast.success('✅ Caregiver removed successfully!');
      } catch (error) {
        toast.error('Failed to remove caregiver');
        console.error(error);
      }
    }
  };

  // Show emergency contacts count
  const handleEmergencyContacts = () => {
    const emergencyContacts = caregivers.filter((c: any) => c.emergencyContact);
    if (emergencyContacts.length === 0) {
      toast.warning('⚠️ No emergency contacts set. Please add one.');
    } else {
      toast.success(`✅ You have ${emergencyContacts.length} emergency contact(s)`);
    }
  };

  // Show loading spinner while getting data from server
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="ml-2 text-gray-600">Loading caregivers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Caregivers & Family
          </h1>
          <p className="text-gray-600 mt-1">
            {caregivers.length === 0 
              ? 'Start by adding your first caregiver' 
              : `Managing ${caregivers.length} caregiver${caregivers.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Caregiver
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Caregiver</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={newCaregiver.name}
                  onChange={(e) => setNewCaregiver(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter caregiver name"
                />
              </div>
              <div>
                <Label htmlFor="relationship">Relationship</Label>
                <Input
                  id="relationship"
                  value={newCaregiver.relationship}
                  onChange={(e) => setNewCaregiver(prev => ({ ...prev, relationship: e.target.value }))}
                  placeholder="e.g., Spouse, Daughter, Nurse, Doctor"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newCaregiver.phone}
                  onChange={(e) => setNewCaregiver(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newCaregiver.email}
                  onChange={(e) => setNewCaregiver(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="availability">Availability</Label>
                <Input
                  id="availability"
                  value={newCaregiver.availability}
                  onChange={(e) => setNewCaregiver(prev => ({ ...prev, availability: e.target.value }))}
                  placeholder="e.g., Mon-Fri 9AM-5PM"
                />
              </div>
              <div>
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  value={newCaregiver.specialization}
                  onChange={(e) => setNewCaregiver(prev => ({ ...prev, specialization: e.target.value }))}
                  placeholder="e.g., Physical Therapy, Nursing"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={newCaregiver.notes}
                  onChange={(e) => setNewCaregiver(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional notes"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="primaryCaregiver"
                  checked={newCaregiver.primaryCaregiver}
                  onCheckedChange={(checked) => 
                    setNewCaregiver(prev => ({ ...prev, primaryCaregiver: checked as boolean }))
                  }
                />
                <label htmlFor="primaryCaregiver" className="text-sm cursor-pointer">
                  Primary Caregiver
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="emergencyContact"
                  checked={newCaregiver.emergencyContact}
                  onCheckedChange={(checked) => 
                    setNewCaregiver(prev => ({ ...prev, emergencyContact: checked as boolean }))
                  }
                />
                <label htmlFor="emergencyContact" className="text-sm cursor-pointer">
                  Emergency Contact
                </label>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleAddCaregiver} 
                  className="flex-1"
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Caregiver'
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)} disabled={isCreating}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Caregiver Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Caregiver</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={newCaregiver.name}
                onChange={(e) => setNewCaregiver(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter caregiver name"
              />
            </div>
            <div>
              <Label htmlFor="edit-relationship">Relationship</Label>
              <Input
                id="edit-relationship"
                value={newCaregiver.relationship}
                onChange={(e) => setNewCaregiver(prev => ({ ...prev, relationship: e.target.value }))}
                placeholder="e.g., Spouse, Daughter, Nurse, Doctor"
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={newCaregiver.phone}
                onChange={(e) => setNewCaregiver(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={newCaregiver.email}
                onChange={(e) => setNewCaregiver(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="edit-availability">Availability</Label>
              <Input
                id="edit-availability"
                value={newCaregiver.availability}
                onChange={(e) => setNewCaregiver(prev => ({ ...prev, availability: e.target.value }))}
                placeholder="e.g., Mon-Fri 9AM-5PM"
              />
            </div>
            <div>
              <Label htmlFor="edit-specialization">Specialization</Label>
              <Input
                id="edit-specialization"
                value={newCaregiver.specialization}
                onChange={(e) => setNewCaregiver(prev => ({ ...prev, specialization: e.target.value }))}
                placeholder="e.g., Physical Therapy, Nursing"
              />
            </div>
            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Input
                id="edit-notes"
                value={newCaregiver.notes}
                onChange={(e) => setNewCaregiver(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional notes"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="edit-primaryCaregiver"
                checked={newCaregiver.primaryCaregiver}
                onCheckedChange={(checked) => 
                  setNewCaregiver(prev => ({ ...prev, primaryCaregiver: checked as boolean }))
                }
              />
              <label htmlFor="edit-primaryCaregiver" className="text-sm cursor-pointer">
                Primary Caregiver
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="edit-emergencyContact"
                checked={newCaregiver.emergencyContact}
                onCheckedChange={(checked) => 
                  setNewCaregiver(prev => ({ ...prev, emergencyContact: checked as boolean }))
                }
              />
              <label htmlFor="edit-emergencyContact" className="text-sm cursor-pointer">
                Emergency Contact
              </label>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleSaveEdit} 
                className="flex-1"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowEditForm(false);
                  setEditingCaregiver(null);
                }}
                disabled={isUpdating}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Caregivers Grid - Shows empty state if user has no caregivers */}
      {caregivers.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Caregivers Yet</h3>
          <p className="text-gray-500 mb-6">
            Get started by adding your first caregiver - they can be family, friends, nurses, or doctors
          </p>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Your First Caregiver
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {caregivers.map((caregiver: any) => (
            <Card key={caregiver._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={caregiver.photoUrl} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white">
                        {caregiver.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'CG'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">{caregiver.name}</h3>
                      <p className="text-sm text-gray-500">{caregiver.relationship || 'Caregiver'}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    {caregiver.primaryCaregiver && (
                      <Badge className="bg-blue-100 text-blue-800">
                        <Heart className="w-3 h-3 mr-1" />
                        Primary
                      </Badge>
                    )}
                    {caregiver.emergencyContact && (
                      <Badge className="bg-red-100 text-red-800">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Emergency
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {caregiver.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{caregiver.email}</span>
                    </div>
                  )}
                  {caregiver.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                      {caregiver.phone}
                    </div>
                  )}
                  {caregiver.availability && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Shield className="w-4 h-4 mr-2 flex-shrink-0" />
                      {caregiver.availability}
                    </div>
                  )}
                  {caregiver.specialization && (
                    <div className="pt-2 border-t">
                      <p className="text-xs font-medium text-gray-500 mb-1">Specialization</p>
                      <Badge variant="secondary" className="text-xs">
                        {caregiver.specialization}
                      </Badge>
                    </div>
                  )}
                  {caregiver.notes && (
                    <div className="pt-2 border-t">
                      <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
                      <p className="text-xs text-gray-600">{caregiver.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 hover:bg-blue-50 transition-colors"
                    onClick={() => handleEditCaregiver(caregiver)}
                    disabled={isDeleting}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                    onClick={() => handleRemoveCaregiver(caregiver._id)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3 mr-1" />
                    )}
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions - Only show if user has caregivers */}
      {caregivers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Quick Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <Heart className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                <p className="text-2xl font-bold text-blue-900">
                  {caregivers.filter((c: any) => c.primaryCaregiver).length}
                </p>
                <p className="text-sm text-blue-700">Primary Caregivers</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg text-center">
                <AlertCircle className="w-8 h-8 mx-auto text-red-600 mb-2" />
                <p className="text-2xl font-bold text-red-900">
                  {caregivers.filter((c: any) => c.emergencyContact).length}
                </p>
                <p className="text-sm text-red-700">Emergency Contacts</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <Users className="w-8 h-8 mx-auto text-green-600 mb-2" />
                <p className="text-2xl font-bold text-green-900">{caregivers.length}</p>
                <p className="text-sm text-green-700">Total Caregivers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
