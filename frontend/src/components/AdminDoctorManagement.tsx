import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  UserPlus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Loader2, 
  Save,
  X,
  Upload,
  User,
  GraduationCap,
  Award,
  Image as ImageIcon
} from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import { useAuth } from '@/components/AuthContext';
import { toast } from 'sonner';

interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  hospital?: string;
  contact?: string;
  experience: number;
  licenseId?: string;
  profileImage?: string;
  email?: string;
  phoneNumber?: string;
  zoomLink?: string;
  chatAvailable: boolean;
  isActive: boolean;
  rating: number;
  consultationFee: number;
}

export default function AdminDoctorManagement() {
  const { user, isAdmin } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    specialty: '',
    hospital: '',
    contact: '',
    experience: 0,
    licenseId: '',
    profileImage: '',
    email: '',
    phoneNumber: '',
    zoomLink: '',
    chatAvailable: true,
    isActive: true,
    rating: 0,
    consultationFee: 0
  });

  useEffect(() => {
    if (!isAdmin) {
      return;
    }
    fetchDoctors();
  }, [isAdmin]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/doctors`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success || data.doctors) {
        setDoctors(data.doctors || data.data || []);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/doctors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newDoctor)
      });
      
      const data = await response.json();
      if (data.success || response.ok) {
        toast.success('Doctor added successfully');
        setIsAddDoctorOpen(false);
        resetForm();
        await fetchDoctors();
      } else {
        throw new Error(data.message || 'Failed to add doctor');
      }
    } catch (error: any) {
      toast.error('Failed to add doctor: ' + error.message);
    }
  };

  const handleUpdateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoctor._id) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/doctors/${newDoctor._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newDoctor)
      });
      
      const data = await response.json();
      if (data.success || response.ok) {
        toast.success('Doctor updated successfully');
        setIsAddDoctorOpen(false);
        setIsEditing(false);
        resetForm();
        await fetchDoctors();
      } else {
        throw new Error(data.message || 'Failed to update doctor');
      }
    } catch (error: any) {
      toast.error('Failed to update doctor: ' + error.message);
    }
  };

  const handleDeleteDoctor = async (doctorId: string, doctorName: string) => {
    if (!window.confirm(`Are you sure you want to delete Dr. ${doctorName}? This action cannot be undone.`)) {
      return;
    }

    try {
      setIsDeleting(doctorId);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success || response.ok) {
        toast.success('Doctor deleted successfully');
        await fetchDoctors();
      } else {
        throw new Error(data.message || 'Failed to delete doctor');
      }
    } catch (error: any) {
      toast.error('Failed to delete doctor: ' + error.message);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEditDoctor = (doctor: Doctor) => {
    setNewDoctor({
      _id: doctor._id,
      name: doctor.name,
      specialty: doctor.specialty,
      hospital: doctor.hospital || '',
      contact: doctor.contact || '',
      experience: doctor.experience || 0,
      licenseId: doctor.licenseId || '',
      profileImage: doctor.profileImage || '',
      email: doctor.email || '',
      phoneNumber: doctor.phoneNumber || '',
      zoomLink: doctor.zoomLink || '',
      chatAvailable: doctor.chatAvailable !== undefined ? doctor.chatAvailable : true,
      isActive: doctor.isActive !== undefined ? doctor.isActive : true,
      rating: doctor.rating || 0,
      consultationFee: doctor.consultationFee || 0
    });
    setIsEditing(true);
    setIsAddDoctorOpen(true);
  };

  const resetForm = () => {
    setNewDoctor({
      name: '',
      specialty: '',
      hospital: '',
      contact: '',
      experience: 0,
      licenseId: '',
      profileImage: '',
      email: '',
      phoneNumber: '',
      zoomLink: '',
      chatAvailable: true,
      isActive: true,
      rating: 0,
      consultationFee: 0
    });
    setIsEditing(false);
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSpecialty = specialtyFilter === 'all' || doctor.specialty === specialtyFilter;
    const matchesSearch = searchQuery === '' || 
      (doctor.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doctor.licenseId || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpecialty && matchesSearch;
  });

  const specialties = Array.from(new Set(doctors.map(d => d.specialty))).filter(Boolean);

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Doctor Management</CardTitle>
              <CardDescription>
                Add, edit, or delete doctors from the system
              </CardDescription>
            </div>
            <Dialog open={isAddDoctorOpen} onOpenChange={(open) => {
              setIsAddDoctorOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Doctor
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{isEditing ? 'Edit Doctor' : 'Add New Doctor'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={isEditing ? handleUpdateDoctor : handleAddDoctor} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={newDoctor.name}
                        onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                        placeholder="Dr. John Smith"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="specialty">Specialty *</Label>
                      <Input
                        id="specialty"
                        value={newDoctor.specialty}
                        onChange={(e) => setNewDoctor({ ...newDoctor, specialty: e.target.value })}
                        placeholder="Cardiology"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="experience">Years of Experience *</Label>
                      <Input
                        id="experience"
                        type="number"
                        min="0"
                        value={newDoctor.experience}
                        onChange={(e) => setNewDoctor({ ...newDoctor, experience: parseInt(e.target.value) || 0 })}
                        placeholder="5"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="licenseId">License ID *</Label>
                      <Input
                        id="licenseId"
                        value={newDoctor.licenseId}
                        onChange={(e) => setNewDoctor({ ...newDoctor, licenseId: e.target.value })}
                        placeholder="LIC123456"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="profileImage">Profile Image URL</Label>
                    <Input
                      id="profileImage"
                      value={newDoctor.profileImage}
                      onChange={(e) => setNewDoctor({ ...newDoctor, profileImage: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newDoctor.email}
                        onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                        placeholder="doctor@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        value={newDoctor.phoneNumber}
                        onChange={(e) => setNewDoctor({ ...newDoctor, phoneNumber: e.target.value })}
                        placeholder="+1234567890"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="hospital">Hospital/Clinic</Label>
                    <Input
                      id="hospital"
                      value={newDoctor.hospital}
                      onChange={(e) => setNewDoctor({ ...newDoctor, hospital: e.target.value })}
                      placeholder="General Hospital"
                    />
                  </div>

                  <div>
                    <Label htmlFor="zoomLink">Video Call Link (Zoom/WebRTC)</Label>
                    <Input
                      id="zoomLink"
                      value={newDoctor.zoomLink}
                      onChange={(e) => setNewDoctor({ ...newDoctor, zoomLink: e.target.value })}
                      placeholder="https://zoom.us/j/..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="consultationFee">Consultation Fee</Label>
                      <Input
                        id="consultationFee"
                        type="number"
                        min="0"
                        value={newDoctor.consultationFee}
                        onChange={(e) => setNewDoctor({ ...newDoctor, consultationFee: parseFloat(e.target.value) || 0 })}
                        placeholder="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rating">Rating (0-5)</Label>
                      <Input
                        id="rating"
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={newDoctor.rating}
                        onChange={(e) => setNewDoctor({ ...newDoctor, rating: parseFloat(e.target.value) || 0 })}
                        placeholder="4.5"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="chatAvailable"
                        checked={newDoctor.chatAvailable}
                        onChange={(e) => setNewDoctor({ ...newDoctor, chatAvailable: e.target.checked })}
                        className="rounded"
                      />
                      <Label htmlFor="chatAvailable">Chat Available</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={newDoctor.isActive}
                        onChange={(e) => setNewDoctor({ ...newDoctor, isActive: e.target.checked })}
                        className="rounded"
                      />
                      <Label htmlFor="isActive">Active</Label>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1 bg-[#2563EB] hover:bg-[#1d4ed8]">
                      <Save className="w-4 h-4 mr-2" />
                      {isEditing ? 'Update Doctor' : 'Create Doctor'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsAddDoctorOpen(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search doctors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Specialties</option>
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Doctors List */}
          {loading ? (
            <div className="text-center py-16">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
              <p className="text-gray-600 mt-4">Loading doctors...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDoctors.map((doctor) => (
                <Card key={doctor._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {doctor.profileImage ? (
                          <img 
                            src={doctor.profileImage} 
                            alt={doctor.name || 'Doctor'}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                            {doctor.name?.charAt(0)?.toUpperCase() || 'D'}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{doctor.name || 'Unknown Doctor'}</h3>
                            {doctor.isActive ? (
                              <Badge variant="outline" className="text-green-600 border-green-300">Active</Badge>
                            ) : (
                              <Badge variant="outline" className="text-gray-600 border-gray-300">Inactive</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{doctor.specialty}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                            {doctor.experience > 0 && (
                              <span className="flex items-center gap-1">
                                <Award className="w-3 h-3" />
                                {doctor.experience} years
                              </span>
                            )}
                            {doctor.licenseId && (
                              <span className="flex items-center gap-1">
                                <GraduationCap className="w-3 h-3" />
                                {doctor.licenseId}
                              </span>
                            )}
                            {doctor.hospital && (
                              <span>{doctor.hospital}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditDoctor(doctor)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteDoctor(doctor._id, doctor.name || 'Unknown')}
                          disabled={isDeleting === doctor._id}
                        >
                          {isDeleting === doctor._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredDoctors.length === 0 && (
                <div className="text-center py-16">
                  <User className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No doctors found</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

