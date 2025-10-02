import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  Plus, 
  Phone, 
  Mail, 
  Heart, 
  Shield, 
  Edit, 
  Trash2, 
  AlertTriangle,
  UserPlus,
  Eye,
  Bell,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://your-project-url.supabase.co';
const supabaseKey = 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

interface Caregiver {
  id: string;
  patient_id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  is_emergency_contact: boolean;
  permissions: {
    view_appointments: boolean;
    view_health_updates: boolean;
    receive_reminders: boolean;
  };
  created_at: string;
  updated_at: string;
}

interface CaregiverFormData {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  is_emergency_contact: boolean;
  permissions: {
    view_appointments: boolean;
    view_health_updates: boolean;
    receive_reminders: boolean;
  };
}

const RELATIONSHIP_OPTIONS = [
  'Spouse/Partner',
  'Mother',
  'Father',
  'Son',
  'Daughter',
  'Brother',
  'Sister',
  'Friend',
  'Other Family Member',
  'Professional Caregiver'
];

export default function CaregiversModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCaregiver, setEditingCaregiver] = useState<Caregiver | null>(null);
  const [formData, setFormData] = useState<CaregiverFormData>({
    name: '',
    relationship: '',
    phone: '',
    email: '',
    is_emergency_contact: false,
    permissions: {
      view_appointments: false,
      view_health_updates: false,
      receive_reminders: false
    }
  });

  useEffect(() => {
    if (isOpen && user) {
      fetchCaregivers();
    }
  }, [isOpen, user]);

  const fetchCaregivers = async () => {
    try {
      setLoading(true);
      
      // In production, this would be an actual Supabase query
      // const { data, error } = await supabase
      //   .from('caregivers')
      //   .select('*')
      //   .eq('patient_id', user.id)
      //   .order('created_at', { ascending: false });
      
      // For now, using sample data
      const sampleCaregivers: Caregiver[] = [
        {
          id: '1',
          patient_id: user?.id || '',
          name: 'Mary Johnson',
          relationship: 'Mother',
          phone: '+1 (555) 123-4567',
          email: 'mary.johnson@email.com',
          is_emergency_contact: true,
          permissions: {
            view_appointments: true,
            view_health_updates: true,
            receive_reminders: true
          },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          patient_id: user?.id || '',
          name: 'David Johnson',
          relationship: 'Brother',
          phone: '+1 (555) 987-6543',
          email: 'david.johnson@email.com',
          is_emergency_contact: false,
          permissions: {
            view_appointments: true,
            view_health_updates: false,
            receive_reminders: false
          },
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z'
        }
      ];
      
      setCaregivers(sampleCaregivers);
    } catch (error) {
      console.error('Error fetching caregivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCaregiver = async () => {
    if (!formData.name || !formData.relationship || !formData.phone) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const newCaregiver: Caregiver = {
        id: Date.now().toString(),
        patient_id: user?.id || '',
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // In production, this would be a Supabase insert
      // const { data, error } = await supabase
      //   .from('caregivers')
      //   .insert([newCaregiver])
      //   .select();

      // If setting as emergency contact, remove emergency status from others
      if (formData.is_emergency_contact) {
        setCaregivers(prev => prev.map(c => ({ ...c, is_emergency_contact: false })));
      }

      setCaregivers(prev => [newCaregiver, ...prev]);
      resetForm();
      setShowAddForm(false);
      alert('Caregiver added successfully!');
    } catch (error) {
      console.error('Error adding caregiver:', error);
      alert('Error adding caregiver. Please try again.');
    }
  };

  const handleUpdateCaregiver = async () => {
    if (!editingCaregiver || !formData.name || !formData.relationship || !formData.phone) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const updatedCaregiver: Caregiver = {
        ...editingCaregiver,
        ...formData,
        updated_at: new Date().toISOString()
      };

      // In production, this would be a Supabase update
      // const { error } = await supabase
      //   .from('caregivers')
      //   .update(updatedCaregiver)
      //   .eq('id', editingCaregiver.id);

      // If setting as emergency contact, remove emergency status from others
      if (formData.is_emergency_contact) {
        setCaregivers(prev => prev.map(c => 
          c.id === editingCaregiver.id ? updatedCaregiver : { ...c, is_emergency_contact: false }
        ));
      } else {
        setCaregivers(prev => prev.map(c => 
          c.id === editingCaregiver.id ? updatedCaregiver : c
        ));
      }

      resetForm();
      setEditingCaregiver(null);
      alert('Caregiver updated successfully!');
    } catch (error) {
      console.error('Error updating caregiver:', error);
      alert('Error updating caregiver. Please try again.');
    }
  };

  const handleDeleteCaregiver = async (caregiverId: string) => {
    if (!confirm('Are you sure you want to remove this caregiver?')) return;

    try {
      // In production, this would be a Supabase delete
      // const { error } = await supabase
      //   .from('caregivers')
      //   .delete()
      //   .eq('id', caregiverId);

      setCaregivers(prev => prev.filter(c => c.id !== caregiverId));
      alert('Caregiver removed successfully!');
    } catch (error) {
      console.error('Error deleting caregiver:', error);
      alert('Error removing caregiver. Please try again.');
    }
  };

  const handleEditCaregiver = (caregiver: Caregiver) => {
    setFormData({
      name: caregiver.name,
      relationship: caregiver.relationship,
      phone: caregiver.phone,
      email: caregiver.email,
      is_emergency_contact: caregiver.is_emergency_contact,
      permissions: { ...caregiver.permissions }
    });
    setEditingCaregiver(caregiver);
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      relationship: '',
      phone: '',
      email: '',
      is_emergency_contact: false,
      permissions: {
        view_appointments: false,
        view_health_updates: false,
        receive_reminders: false
      }
    });
    setEditingCaregiver(null);
  };

  const handlePermissionChange = (permission: keyof CaregiverFormData['permissions'], value: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: value
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-blue-600" />
            <span>My Caregivers</span>
          </DialogTitle>
          <p className="text-gray-600 text-sm">
            Manage family members and caregivers who support your healthcare journey
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add Caregiver Button */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Caregivers ({caregivers.length})
            </h3>
            <Button
              onClick={() => {
                resetForm();
                setShowAddForm(true);
              }}
              className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Caregiver
            </Button>
          </div>

          {/* Add/Edit Caregiver Form */}
          {showAddForm && (
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg">
                  {editingCaregiver ? 'Edit Caregiver' : 'Add New Caregiver'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Relationship *</Label>
                    <Select value={formData.relationship} onValueChange={(value) => setFormData(prev => ({ ...prev, relationship: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        {RELATIONSHIP_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                {/* Emergency Contact Toggle */}
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-medium text-red-800">Emergency Contact</p>
                      <p className="text-sm text-red-600">Mark as primary emergency contact</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.is_emergency_contact}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_emergency_contact: checked }))}
                  />
                </div>

                {/* Permissions */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Access Permissions</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">View Appointments</p>
                          <p className="text-xs text-gray-600">See scheduled visits</p>
                        </div>
                      </div>
                      <Switch
                        checked={formData.permissions.view_appointments}
                        onCheckedChange={(checked) => handlePermissionChange('view_appointments', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Eye className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="text-sm font-medium">Health Updates</p>
                          <p className="text-xs text-gray-600">Access health records</p>
                        </div>
                      </div>
                      <Switch
                        checked={formData.permissions.view_health_updates}
                        onCheckedChange={(checked) => handlePermissionChange('view_health_updates', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Bell className="w-4 h-4 text-orange-600" />
                        <div>
                          <p className="text-sm font-medium">Receive Reminders</p>
                          <p className="text-xs text-gray-600">Get notifications</p>
                        </div>
                      </div>
                      <Switch
                        checked={formData.permissions.receive_reminders}
                        onCheckedChange={(checked) => handlePermissionChange('receive_reminders', checked)}
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setShowAddForm(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={editingCaregiver ? handleUpdateCaregiver : handleAddCaregiver}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {editingCaregiver ? 'Update Caregiver' : 'Add Caregiver'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Caregivers List */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : caregivers.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Caregivers Added</h3>
                <p className="text-gray-600 mb-4">
                  Add family members or caregivers who can help support your healthcare journey
                </p>
                <Button
                  onClick={() => {
                    resetForm();
                    setShowAddForm(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Caregiver
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {caregivers.map((caregiver) => (
                <Card key={caregiver.id} className={`hover:shadow-lg transition-shadow ${
                  caregiver.is_emergency_contact ? 'border-2 border-red-300 bg-red-50' : ''
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{caregiver.name}</h4>
                          {caregiver.is_emergency_contact && (
                            <Badge className="bg-red-100 text-red-800 border-red-200">
                              <Shield className="w-3 h-3 mr-1" />
                              Emergency
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{caregiver.relationship}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCaregiver(caregiver)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCaregiver(caregiver.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{caregiver.phone}</span>
                      </div>
                      {caregiver.email && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span>{caregiver.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Permissions */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">Permissions</p>
                      <div className="flex flex-wrap gap-2">
                        {caregiver.permissions.view_appointments && (
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            Appointments
                          </Badge>
                        )}
                        {caregiver.permissions.view_health_updates && (
                          <Badge variant="outline" className="text-xs">
                            <Eye className="w-3 h-3 mr-1" />
                            Health Updates
                          </Badge>
                        )}
                        {caregiver.permissions.receive_reminders && (
                          <Badge variant="outline" className="text-xs">
                            <Bell className="w-3 h-3 mr-1" />
                            Reminders
                          </Badge>
                        )}
                        {!caregiver.permissions.view_appointments && 
                         !caregiver.permissions.view_health_updates && 
                         !caregiver.permissions.receive_reminders && (
                          <Badge variant="outline" className="text-xs text-gray-500">
                            No permissions set
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Emergency Contact Info */}
          {caregivers.some(c => c.is_emergency_contact) && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-800 mb-1">Emergency Contact Information</h4>
                    <p className="text-sm text-red-700">
                      Your emergency contact will be notified in case of medical emergencies and can access 
                      your health information as needed for your care.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}