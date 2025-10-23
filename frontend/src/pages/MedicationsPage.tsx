import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pill, Plus, Clock, Calendar, AlertCircle, CheckCircle, Trash2, Edit } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';

interface Medication {
  _id: string;
  name: string;
  dosage: string;
  frequency?: string;
  instructions?: string;
  adherence?: number;
  startDate?: string;
}

export default function MedicationsPage() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    instructions: ''
  });

  const fetchMedications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken') || '';
      const res = await fetch(`${API_BASE_URL}/medications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch medications');
      setMedications(data.medications || data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedication.name || !newMedication.dosage) return;

    try {
      const token = localStorage.getItem('authToken') || '';
      const res = await fetch(`${API_BASE_URL}/medications`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newMedication)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add medication');

      setMedications(prev => [data.medication || data.data, ...prev]);
      setNewMedication({ name: '', dosage: '', frequency: '', instructions: '' });
      setShowAddForm(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleEditMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMed || !newMedication.name || !newMedication.dosage) return;

    try {
      const token = localStorage.getItem('authToken') || '';
      const res = await fetch(`${API_BASE_URL}/medications/${editingMed._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newMedication)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update medication');

      setMedications(prev => prev.map(m => m._id === editingMed._id ? (data.medication || data.data) : m));
      setNewMedication({ name: '', dosage: '', frequency: '', instructions: '' });
      setEditingMed(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  };

  const startEditMedication = (med: Medication) => {
    setEditingMed(med);
    setNewMedication({
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency || '',
      instructions: med.instructions || ''
    });
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingMed(null);
    setNewMedication({ name: '', dosage: '', frequency: '', instructions: '' });
  };

  const handleDeleteMedication = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this medication?')) return;
    try {
      const token = localStorage.getItem('authToken') || '';
      const res = await fetch(`${API_BASE_URL}/medications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete medication');
      setMedications(prev => prev.filter(m => m._id !== id));
    } catch (err: any) {
      console.error(err);
      setError(err.message);
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

  useEffect(() => { fetchMedications(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Medications
            </h1>
            <p className="text-gray-600 mt-1">Manage your medication schedule and adherence</p>
          </div>
          <Button onClick={() => setShowAddForm(true)} className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <Plus className="w-4 h-4 mr-2" /> Add Medication
          </Button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

        {editingMed && (
          <Card className="border-2 border-blue-500 shadow-xl bg-gradient-to-br from-white to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-500" /> Edit Medication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEditMedication} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name">Medication Name</Label>
                    <Input id="edit-name" value={newMedication.name} onChange={e => setNewMedication(prev => ({ ...prev, name: e.target.value }))} required />
                  </div>
                  <div>
                    <Label htmlFor="edit-dosage">Dosage</Label>
                    <Input id="edit-dosage" value={newMedication.dosage} onChange={e => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))} required />
                  </div>
                  <div>
                    <Label htmlFor="edit-frequency">Frequency</Label>
                    <Input id="edit-frequency" value={newMedication.frequency} onChange={e => setNewMedication(prev => ({ ...prev, frequency: e.target.value }))} />
                  </div>
                  <div>
                    <Label htmlFor="edit-instructions">Instructions</Label>
                    <Input id="edit-instructions" value={newMedication.instructions} onChange={e => setNewMedication(prev => ({ ...prev, instructions: e.target.value }))} />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="bg-blue-500 text-white">Save Changes</Button>
                  <Button type="button" variant="outline" onClick={cancelEdit}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {showAddForm && (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-blue-500" /> Add New Medication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddMedication} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Medication Name</Label>
                    <Input id="name" value={newMedication.name} onChange={e => setNewMedication(prev => ({ ...prev, name: e.target.value }))} required />
                  </div>
                  <div>
                    <Label htmlFor="dosage">Dosage</Label>
                    <Input id="dosage" value={newMedication.dosage} onChange={e => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))} required />
                  </div>
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Input id="frequency" value={newMedication.frequency} onChange={e => setNewMedication(prev => ({ ...prev, frequency: e.target.value }))} />
                  </div>
                  <div>
                    <Label htmlFor="instructions">Instructions</Label>
                    <Input id="instructions" value={newMedication.instructions} onChange={e => setNewMedication(prev => ({ ...prev, instructions: e.target.value }))} />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="bg-green-500 text-white">Add Medication</Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {medications.map(med => (
            <Card key={med._id} className="hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${getAdherenceColor(med.adherence ?? 0)}`}></div>
              <CardContent>
                <div className="flex justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
                      <Pill className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{med.name}</h3>
                      <p className="text-sm text-gray-500">{med.dosage}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => startEditMedication(med)} className="text-blue-600 hover:bg-blue-50">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteMedication(med._id)} className="text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  {med.frequency && <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {med.frequency}</div>}
                  {med.startDate && <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Started {new Date(med.startDate).toLocaleDateString()}</div>}
                  {med.instructions && <p className="p-2 bg-gray-50 rounded-lg italic">{med.instructions}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {medications.length === 0 && (
          <Card className="border-0 shadow-xl text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Pill className="w-12 h-12 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Medications Added</h3>
            <p className="text-gray-600 mb-6">Start managing your medications by adding your first prescription.</p>
            <Button onClick={() => setShowAddForm(true)} className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <Plus className="w-4 h-4 mr-2" /> Add First Medication
            </Button>
          </Card>
        )}
      </div>
  );
}
