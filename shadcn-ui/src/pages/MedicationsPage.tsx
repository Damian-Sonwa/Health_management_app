import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Pill, Plus, Clock, Calendar, AlertCircle, CheckCircle, Trash2, Edit } from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import Layout from '@/components/Layout';

export default function MedicationsPage() {
  const { medications, addMedication, updateMedication, deleteMedication, loading, error } = useSupabaseData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMedication, setEditingMedication] = useState<string | null>(null);
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    instructions: ''
  });

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedication.name || !newMedication.dosage) return;

    try {
      await addMedication({
        name: newMedication.name,
        dosage: newMedication.dosage,
        frequency: newMedication.frequency,
        instructions: newMedication.instructions
      });

      setNewMedication({ name: '', dosage: '', frequency: '', instructions: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding medication:', error);
    }
  };

  const handleUpdateMedication = async (id: string, updates: any) => {
    try {
      await updateMedication(id, updates);
      setEditingMedication(null);
    } catch (error) {
      console.error('Error updating medication:', error);
    }
  };

  const handleDeleteMedication = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      try {
        await deleteMedication(id);
      } catch (error) {
        console.error('Error deleting medication:', error);
      }
    }
  };

  const getAdherenceColor = (adherence: number) => {
    if (adherence >= 90) return 'from-green-400 to-emerald-500';
    if (adherence >= 70) return 'from-yellow-400 to-orange-500';
    return 'from-red-400 to-pink-500';
  };

  const getAdherenceIcon = (adherence: number) => {
    if (adherence >= 90) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (adherence >= 70) return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    return <AlertCircle className="w-4 h-4 text-red-600" />;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

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
          <Button 
            onClick={() => setShowAddForm(true)} 
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Medication
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {showAddForm && (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-blue-500" />
                Add New Medication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddMedication} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Medication Name</Label>
                    <Input
                      id="name"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newMedication.name}
                      onChange={(e) => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Lisinopril"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="dosage">Dosage</Label>
                    <Input
                      id="dosage"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newMedication.dosage}
                      onChange={(e) => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))}
                      placeholder="e.g., 10mg"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Input
                      id="frequency"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newMedication.frequency}
                      onChange={(e) => setNewMedication(prev => ({ ...prev, frequency: e.target.value }))}
                      placeholder="e.g., Once daily"
                    />
                  </div>
                  <div>
                    <Label htmlFor="instructions">Instructions</Label>
                    <Input
                      id="instructions"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newMedication.instructions}
                      onChange={(e) => setNewMedication(prev => ({ ...prev, instructions: e.target.value }))}
                      placeholder="e.g., Take with food"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                  >
                    Add Medication
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowAddForm(false)}
                    className="hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {medications.map((medication) => (
            <Card key={medication.id} className="hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${getAdherenceColor(medication.adherence)}`}></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
                      <Pill className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{medication.name}</h3>
                      <p className="text-sm text-gray-500">{medication.dosage}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingMedication(medication.id)}
                      className="text-blue-600 hover:text-blue-700 p-1"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMedication(medication.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{medication.frequency}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Started {new Date(medication.startDate).toLocaleDateString()}</span>
                  </div>

                  {medication.instructions && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 italic">"{medication.instructions}"</p>
                    </div>
                  )}

                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-1">
                        {getAdherenceIcon(medication.adherence)}
                        <span className="text-sm font-medium">Adherence</span>
                      </div>
                      <span className="text-sm font-bold">{medication.adherence}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full bg-gradient-to-r ${getAdherenceColor(medication.adherence)} transition-all duration-500`}
                        style={{ width: `${medication.adherence}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {medications.length === 0 && (
          <Card className="border-0 shadow-xl">
            <CardContent className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Pill className="w-12 h-12 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Medications Added</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start managing your medications by adding your first prescription. Keep track of dosages, schedules, and adherence.
              </p>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Medication
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}