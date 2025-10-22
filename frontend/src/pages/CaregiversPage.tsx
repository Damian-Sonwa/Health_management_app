import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Heart, 
  Shield, 
  Edit, 
  Trash2, 
  UserPlus,
  Bell,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { toast } from 'sonner';

interface Caregiver {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  role: 'primary' | 'secondary' | 'emergency';
  permissions: string[];
  lastActive: string;
  avatar?: string;
}

export default function CaregiversPage() {
  const { user } = useAuth();
  const [caregivers, setCaregivers] = useState<Caregiver[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 123-4567',
      relationship: 'Spouse',
      role: 'primary',
      permissions: ['view_vitals', 'manage_medications', 'schedule_appointments'],
      lastActive: '2 hours ago',
      avatar: ''
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      email: 'michael.chen@healthcare.com',
      phone: '+1 (555) 987-6543',
      relationship: 'Primary Care Physician',
      role: 'secondary',
      permissions: ['view_vitals', 'view_medications', 'view_appointments'],
      lastActive: '1 day ago',
      avatar: ''
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@email.com',
      phone: '+1 (555) 456-7890',
      relationship: 'Daughter',
      role: 'emergency',
      permissions: ['emergency_access'],
      lastActive: '3 days ago',
      avatar: ''
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingCaregiver, setEditingCaregiver] = useState<Caregiver | null>(null);
  const [newCaregiver, setNewCaregiver] = useState({
    name: '',
    email: '',
    phone: '',
    relationship: '',
    role: 'secondary' as 'primary' | 'secondary' | 'emergency',
    permissions: [] as string[]
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'primary': return 'bg-blue-100 text-blue-800';
      case 'secondary': return 'bg-green-100 text-green-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'primary': return <Heart className="w-4 h-4" />;
      case 'secondary': return <Shield className="w-4 h-4" />;
      case 'emergency': return <AlertCircle className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const handleAddCaregiver = () => {
    if (!newCaregiver.name || !newCaregiver.email) {
      toast.error('Please fill in name and email');
      return;
    }
    
    const caregiver: Caregiver = {
      id: Date.now().toString(),
      ...newCaregiver,
      lastActive: 'Just now'
    };
    
    setCaregivers(prev => [...prev, caregiver]);
    setNewCaregiver({
      name: '',
      email: '',
      phone: '',
      relationship: '',
      role: 'secondary',
      permissions: []
    });
    setShowAddForm(false);
    toast.success('✅ Caregiver added successfully!');
  };

  const handleEditCaregiver = (caregiver: Caregiver) => {
    setEditingCaregiver(caregiver);
    setNewCaregiver({
      name: caregiver.name,
      email: caregiver.email,
      phone: caregiver.phone,
      relationship: caregiver.relationship,
      role: caregiver.role,
      permissions: caregiver.permissions
    });
    setShowEditForm(true);
  };

  const handleSaveEdit = () => {
    if (!editingCaregiver || !newCaregiver.name || !newCaregiver.email) {
      toast.error('Please fill in name and email');
      return;
    }
    
    setCaregivers(prev => prev.map(c => 
      c.id === editingCaregiver.id 
        ? { ...c, ...newCaregiver, lastActive: 'Just now' }
        : c
    ));
    
    setEditingCaregiver(null);
    setNewCaregiver({
      name: '',
      email: '',
      phone: '',
      relationship: '',
      role: 'secondary',
      permissions: []
    });
    setShowEditForm(false);
    toast.success('✅ Caregiver updated successfully!');
  };

  const handleRemoveCaregiver = (id: string) => {
    if (window.confirm('Are you sure you want to remove this caregiver?')) {
      setCaregivers(prev => prev.filter(c => c.id !== id));
      toast.success('✅ Caregiver removed successfully!');
    }
  };

  const handleInviteFamily = () => {
    toast.info('📧 Invite link will be sent to the caregiver\'s email');
    // In production, this would send an invitation email
  };

  const handleManagePermissions = () => {
    toast.info('⚙️ Permissions management feature coming soon!');
    // In production, this would open a permissions management modal
  };

  const handleEmergencyContacts = () => {
    const emergencyContacts = caregivers.filter(c => c.role === 'emergency');
    if (emergencyContacts.length === 0) {
      toast.warning('⚠️ No emergency contacts set. Please add one.');
    } else {
      toast.success(`✅ You have ${emergencyContacts.length} emergency contact(s)`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Caregivers & Family
          </h1>
          <p className="text-gray-600 mt-1">Manage your care team and family members</p>
        </div>
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Caregiver
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Caregiver</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newCaregiver.name}
                  onChange={(e) => setNewCaregiver(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter caregiver name"
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
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newCaregiver.phone}
                  onChange={(e) => setNewCaregiver(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="relationship">Relationship</Label>
                <Input
                  id="relationship"
                  value={newCaregiver.relationship}
                  onChange={(e) => setNewCaregiver(prev => ({ ...prev, relationship: e.target.value }))}
                  placeholder="e.g., Spouse, Daughter, Doctor"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddCaregiver} className="flex-1">
                  Add Caregiver
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Caregiver Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Caregiver</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={newCaregiver.name}
                onChange={(e) => setNewCaregiver(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter caregiver name"
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
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={newCaregiver.phone}
                onChange={(e) => setNewCaregiver(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <Label htmlFor="edit-relationship">Relationship</Label>
              <Input
                id="edit-relationship"
                value={newCaregiver.relationship}
                onChange={(e) => setNewCaregiver(prev => ({ ...prev, relationship: e.target.value }))}
                placeholder="e.g., Spouse, Daughter, Doctor"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveEdit} className="flex-1">
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => {
                setShowEditForm(false);
                setEditingCaregiver(null);
                setNewCaregiver({
                  name: '',
                  email: '',
                  phone: '',
                  relationship: '',
                  role: 'secondary',
                  permissions: []
                });
              }}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Caregivers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {caregivers.map((caregiver) => (
          <Card key={caregiver.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={caregiver.avatar} />
                    <AvatarFallback>
                      {caregiver.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900">{caregiver.name}</h3>
                    <p className="text-sm text-gray-500">{caregiver.relationship}</p>
                  </div>
                </div>
                <Badge className={getRoleColor(caregiver.role)}>
                  <div className="flex items-center space-x-1">
                    {getRoleIcon(caregiver.role)}
                    <span className="capitalize">{caregiver.role}</span>
                  </div>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  {caregiver.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  {caregiver.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  Last active: {caregiver.lastActive}
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <p className="text-xs font-medium text-gray-500 mb-2">Permissions</p>
                <div className="flex flex-wrap gap-1">
                  {caregiver.permissions.map((permission) => (
                    <Badge key={permission} variant="secondary" className="text-xs">
                      {permission.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 hover:bg-blue-50 transition-colors"
                  onClick={() => handleEditCaregiver(caregiver)}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                  onClick={() => handleRemoveCaregiver(caregiver.id)}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-blue-50 hover:border-blue-300 transition-all"
              onClick={handleInviteFamily}
            >
              <UserPlus className="w-6 h-6" />
              <span>Invite Family Member</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-green-50 hover:border-green-300 transition-all"
              onClick={handleManagePermissions}
            >
              <Shield className="w-6 h-6" />
              <span>Manage Permissions</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-red-50 hover:border-red-300 transition-all"
              onClick={handleEmergencyContacts}
            >
              <AlertCircle className="w-6 h-6" />
              <span>Emergency Contacts</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
