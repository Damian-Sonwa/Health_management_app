import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pill, Clock, Calendar, CheckCircle, AlertCircle, Trash2, Edit, Loader2 } from 'lucide-react';
import { useMedications } from '@/hooks/useMedications';
import { toast } from 'sonner';

export default function MedicationManagement() {
  const { medications, isLoading, createMedication, updateMedication, deleteMedication, isCreating, isDeleting } = useMedications();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMedication, setEditingMedication] = useState<any | null>(null);
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    startDate: '',
    notes: ''
  });

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMedication({
        ...newMedication,
        status: 'active',
        isActive: true
      });
      
      toast.success('Medication added successfully!');
      setNewMedication({ name: '', dosage: '', frequency: '', startDate: '', notes: '' });
      setShowAddForm(false);
    } catch (error: any) {
      toast.error('Failed to add medication: ' + error.message);
    }
  };

  const handleUpdateMedication = async (id: string, updates: any) => {
    try {
      await updateMedication({ id, data: updates });
      toast.success('Medication updated successfully!');
      setEditingMedication(null);
    } catch (error: any) {
      toast.error('Failed to update medication: ' + error.message);
    }
  };

  const handleDeleteMedication = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this medication?')) return;
    try {
      await deleteMedication(id);
      toast.success('Medication deleted successfully!');
    } catch (error: any) {
      toast.error('Failed to delete medication: ' + error.message);
    }
  };

  const getAdherenceColor = (adherence: number = 0) => {
    if (adherence >= 90) return 'from-green-400 to-emerald-500';
    if (adherence >= 70) return 'from-yellow-400 to-orange-500';
    return 'from-red-400 to-pink-500';
  };

  const getAdherenceIcon = (adherence: number = 0) => {
    if (adherence >= 90) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (adherence >= 70) return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    return <AlertCircle className="w-4 h-4 text-red-600" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Medications</h2>
          <p className="text-gray-600 mt-1">Manage your medications and track adherence</p>
        </div>
        
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Medication
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Medication</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddMedication} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Medication Name*</Label>
                <Input
                  id="name"
                  placeholder="e.g., Aspirin"
                  value={newMedication.name}
                  onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dosage">Dosage*</Label>
                <Input
                  id="dosage"
                  placeholder="e.g., 100mg"
                  value={newMedication.dosage}
                  onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency*</Label>
                <Input
                  id="frequency"
                  placeholder="e.g., Twice daily"
                  value={newMedication.frequency}
                  onChange={(e) => setNewMedication({...newMedication, frequency: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newMedication.startDate}
                  onChange={(e) => setNewMedication({...newMedication, startDate: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  placeholder="Additional instructions..."
                  value={newMedication.notes}
                  onChange={(e) => setNewMedication({...newMedication, notes: e.target.value})}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit"
                  disabled={!newMedication.name || !newMedication.dosage || !newMedication.frequency || isCreating}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Medication'
                  )}
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Medications List */}
      <div className="grid gap-4">
        {medications.length > 0 ? (
          medications.map((med: any) => (
            <Card key={med._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Pill className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{med.name}</h3>
                        <p className="text-sm text-gray-600">{med.dosage}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{med.frequency || 'Not specified'}</span>
                      </div>
                      {med.startDate && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(med.startDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    
                    {med.notes && (
                      <p className="text-sm text-gray-600 mt-3 p-2 bg-gray-50 rounded">
                        {med.notes}
                      </p>
                    )}
                    
                    {med.prescribedBy && (
                      <p className="text-sm text-gray-500 mt-2">
                        Prescribed by: {med.prescribedBy}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingMedication(med)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteMedication(med._id)}
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
              <Pill className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No medications yet</h3>
              <p className="text-gray-600 mb-4">Add your first medication to start tracking.</p>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Medication
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      {editingMedication && (
        <Dialog open={!!editingMedication} onOpenChange={() => setEditingMedication(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Medication</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateMedication(editingMedication._id, editingMedication);
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Medication Name</Label>
                <Input
                  id="edit-name"
                  value={editingMedication.name}
                  onChange={(e) => setEditingMedication({...editingMedication, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-dosage">Dosage</Label>
                <Input
                  id="edit-dosage"
                  value={editingMedication.dosage}
                  onChange={(e) => setEditingMedication({...editingMedication, dosage: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-frequency">Frequency</Label>
                <Input
                  id="edit-frequency"
                  value={editingMedication.frequency || ''}
                  onChange={(e) => setEditingMedication({...editingMedication, frequency: e.target.value})}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  Update
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setEditingMedication(null)}
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
