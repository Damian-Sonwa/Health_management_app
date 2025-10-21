import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pill, Clock, Calendar, CheckCircle, AlertCircle, Trash2, Edit } from 'lucide-react';
import Layout from '@/components/Layout';

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
  const [editingMedication, setEditingMedication] = useState<string | null>(null);
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    instructions: ''
  });

  const API_BASE = 'http://localhost:5001/api'; // your backend

  const fetchMedications = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/medications`);
      if (!res.ok) throw new Error('Failed to fetch medications');
      const data = await res.json();
      setMedications(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/medications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMedication)
      });
      if (!res.ok) throw new Error('Failed to add medication');
      const added = await res.json();
      setMedications(prev => [...prev, added]);
      setNewMedication({ name: '', dosage: '', frequency: '', instructions: '' });
      setShowAddForm(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleDeleteMedication = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this medication?')) return;
    try {
      const res = await fetch(`${API_BASE}/medications/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete medication');
      setMedications(prev => prev.filter(med => med._id !== id));
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

  useEffect(() => {
    fetchMedications();
  }, []);

  if (loading) return <Layout><div>Loading...</div></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Medications
            </h1>
            <p className="text-gray-600 mt-1">Manage your medication schedule and adherence</p>
          </div>
          <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 text-white">
            <Plus className="w-4 h-4 mr-2" /> Add Medication
          </Button>
        </div>

        {error && <div className="text-red-600">{error}</div>}

        {showAddForm && (
          <Card className="border p-4 shadow">
            <CardHeader>
              <CardTitle>Add New Medication</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddMedication} className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={newMedication.name}
                    onChange={e => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label>Dosage</Label>
                  <Input
                    value={newMedication.dosage}
                    onChange={e => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label>Frequency</Label>
                  <Input
                    value={newMedication.frequency}
                    onChange={e => setNewMedication(prev => ({ ...prev, frequency: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Instructions</Label>
                  <Input
                    value={newMedication.instructions}
                    onChange={e => setNewMedication(prev => ({ ...prev, instructions: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="bg-green-500 text-white">Add</Button>
                  <Button type="button" onClick={() => setShowAddForm(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {medications.map(med => (
            <Card key={med._id} className="hover:shadow-xl transition p-4">
              <div className={`h-2 bg-gradient-to-r ${getAdherenceColor(med.adherence || 0)}`}></div>
              <CardContent>
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h3 className="font-semibold">{med.name}</h3>
                    <p className="text-sm text-gray-500">{med.dosage}</p>
                  </div>
                  <Button variant="ghost" onClick={() => handleDeleteMedication(med._id)}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
                {med.frequency && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4" /> {med.frequency}
                  </div>
                )}
                {med.instructions && (
                  <div className="text-sm italic mt-2">{med.instructions}</div>
                )}
                <div className="mt-2 flex justify-between items-center text-sm">
                  {getAdherenceIcon(med.adherence || 0)}
                  <span>{med.adherence || 0}%</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
