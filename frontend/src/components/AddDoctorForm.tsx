import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useDoctors, type Doctor } from '@/hooks/useDoctors';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus } from 'lucide-react';

interface AddDoctorFormProps {
  isOpen: boolean;
  onClose: () => void;
  doctorToEdit?: Doctor | null;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function AddDoctorForm({ isOpen, onClose, doctorToEdit }: AddDoctorFormProps) {
  const { toast } = useToast();
  const { createDoctor, updateDoctor, isCreating, isUpdating } = useDoctors();

  const [formData, setFormData] = useState({
    name: doctorToEdit?.name || '',
    specialty: doctorToEdit?.specialty || '',
    hospital: doctorToEdit?.hospital || '',
    contact: doctorToEdit?.contact || '',
    email: doctorToEdit?.email || '',
    phoneNumber: doctorToEdit?.phoneNumber || '',
    zoomLink: doctorToEdit?.zoomLink || '',
    availableDays: doctorToEdit?.availableDays || [],
    availableTimes: doctorToEdit?.availableTimes?.join(', ') || '',
    experience: doctorToEdit?.experience || 0,
    consultationFee: doctorToEdit?.consultationFee || 0,
    isActive: doctorToEdit?.isActive !== undefined ? doctorToEdit.isActive : true,
    chatAvailable: doctorToEdit?.chatAvailable !== undefined ? doctorToEdit.chatAvailable : true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Doctor name is required';
    }

    if (!formData.specialty.trim()) {
      newErrors.specialty = 'Specialty is required';
    }

    if (formData.phoneNumber && !/^[\d\s\-+()]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone number format';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        variant: 'destructive'
      });
      return;
    }

    try {
      const doctorData = {
        ...formData,
        availableTimes: formData.availableTimes
          .split(',')
          .map(t => t.trim())
          .filter(t => t),
        experience: Number(formData.experience),
        consultationFee: Number(formData.consultationFee)
      };

      if (doctorToEdit) {
        await updateDoctor(doctorToEdit._id, doctorData);
        toast({
          title: 'Success',
          description: 'Doctor updated successfully',
          variant: 'default'
        });
      } else {
        await createDoctor(doctorData);
        toast({
          title: 'Success',
          description: 'Doctor added successfully',
          variant: 'default'
        });
      }

      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save doctor',
        variant: 'destructive'
      });
    }
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {doctorToEdit ? 'Edit Doctor' : 'Add New Doctor'}
          </DialogTitle>
          <DialogDescription>
            {doctorToEdit
              ? 'Update the doctor information below'
              : 'Fill in the details to add a new doctor to the telehealth system'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Dr. John Doe"
                required
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">Specialty *</Label>
              <Input
                id="specialty"
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                placeholder="Cardiology"
                required
              />
              {errors.specialty && <p className="text-sm text-red-500">{errors.specialty}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hospital">Hospital</Label>
              <Input
                id="hospital"
                name="hospital"
                value={formData.hospital}
                onChange={handleChange}
                placeholder="City General Hospital"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Experience (years)</Label>
              <Input
                id="experience"
                name="experience"
                type="number"
                min="0"
                value={formData.experience}
                onChange={handleChange}
                placeholder="5"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="doctor@example.com"
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="+1 234 567 8900"
              />
              {errors.phoneNumber && <p className="text-sm text-red-500">{errors.phoneNumber}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Additional Contact Info</Label>
            <Textarea
              id="contact"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="Office hours, additional phone numbers, etc."
              rows={2}
            />
          </div>

          {/* Telehealth Settings */}
          <div className="space-y-2">
            <Label htmlFor="zoomLink">Zoom Link (Video Consultation)</Label>
            <Input
              id="zoomLink"
              name="zoomLink"
              value={formData.zoomLink}
              onChange={handleChange}
              placeholder="https://zoom.us/j/..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="consultationFee">Consultation Fee ($)</Label>
            <Input
              id="consultationFee"
              name="consultationFee"
              type="number"
              min="0"
              step="0.01"
              value={formData.consultationFee}
              onChange={handleChange}
              placeholder="50"
            />
          </div>

          {/* Availability */}
          <div className="space-y-2">
            <Label>Available Days</Label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map(day => (
                <Button
                  key={day}
                  type="button"
                  variant={formData.availableDays.includes(day) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleDayToggle(day)}
                >
                  {day.substring(0, 3)}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="availableTimes">Available Times (comma-separated)</Label>
            <Input
              id="availableTimes"
              name="availableTimes"
              value={formData.availableTimes}
              onChange={handleChange}
              placeholder="9:00 AM - 12:00 PM, 2:00 PM - 5:00 PM"
            />
          </div>

          {/* Status Toggles */}
          <div className="flex items-center justify-between space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive" className="cursor-pointer">Active</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="chatAvailable"
                checked={formData.chatAvailable}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, chatAvailable: checked }))}
              />
              <Label htmlFor="chatAvailable" className="cursor-pointer">Chat Available</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {doctorToEdit ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  {doctorToEdit ? 'Update Doctor' : 'Add Doctor'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

