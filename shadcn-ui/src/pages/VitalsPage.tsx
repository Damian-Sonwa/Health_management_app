import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Heart, Activity, Thermometer, Weight, Plus, TrendingUp, Calendar, Trash2, Edit, AlertCircle } from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAuth } from '@/components/AuthContext';
import Layout from '@/components/Layout';

export default function VitalsPage() {
  const { user } = useAuth();
  const { vitals, addVitalReading, updateVitalReading, deleteVitalReading, loading, error, clearError } = useSupabaseData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVital, setEditingVital] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  
  const [newVital, setNewVital] = useState({
    type: '',
    value: '',
    unit: '',
    notes: ''
  });

  const [editVital, setEditVital] = useState({
    type: '',
    value: '',
    unit: '',
    notes: ''
  });

  const validateForm = (data: typeof newVital) => {
    const errors: { [key: string]: string } = {};
    
    if (!data.type.trim()) {
      errors.type = 'Vital type is required';
    }
    
    if (!data.value.trim()) {
      errors.value = 'Value is required';
    } else if (isNaN(Number(data.value)) || Number(data.value) <= 0) {
      errors.value = 'Value must be a positive number';
    }
    
    return errors;
  };

  const handleAddVital = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    const errors = validateForm(newVital);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setSubmitting(true);
    setValidationErrors({});

    try {
      await addVitalReading({
        type: newVital.type,
        value: parseFloat(newVital.value),
        unit: newVital.unit || '',
        notes: newVital.notes || ''
      });

      setNewVital({ type: '', value: '', unit: '', notes: '' });
      setShowAddForm(false);
    } catch (error: any) {
      console.error('Error adding vital:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditVital = (vital: any) => {
    setEditingVital(vital._id || vital.id);
    setEditVital({
      type: vital.type,
      value: vital.value.toString(),
      unit: vital.unit || '',
      notes: vital.notes || ''
    });
  };

  const handleUpdateVital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVital) return;
    
    clearError();
    const errors = validateForm(editVital);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setSubmitting(true);
    setValidationErrors({});

    try {
      await updateVitalReading(editingVital, {
        type: editVital.type,
        value: parseFloat(editVital.value),
        unit: editVital.unit || '',
        notes: editVital.notes || ''
      });

      setEditingVital(null);
      setEditVital({ type: '', value: '', unit: '', notes: '' });
    } catch (error: any) {
      console.error('Error updating vital:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVital = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this vital reading? This action cannot be undone.')) {
      try {
        await deleteVitalReading(id);
      } catch (error: any) {
        console.error('Error deleting vital:', error);
      }
    }
  };

  const getVitalIcon = (type: string) => {
    switch (type) {
      case 'heart_rate':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'blood_pressure_systolic':
      case 'blood_pressure_diastolic':
        return <Activity className="w-5 h-5 text-blue-500" />;
      case 'temperature':
        return <Thermometer className="w-5 h-5 text-orange-500" />;
      case 'weight':
        return <Weight className="w-5 h-5 text-green-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatVitalType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getVitalColor = (type: string) => {
    switch (type) {
      case 'heart_rate':
        return 'from-red-400 to-pink-500';
      case 'blood_pressure_systolic':
      case 'blood_pressure_diastolic':
        return 'from-blue-400 to-indigo-500';
      case 'temperature':
        return 'from-orange-400 to-red-500';
      case 'weight':
        return 'from-green-400 to-emerald-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
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
              Vital Signs
            </h1>
            <p className="text-gray-600 mt-1">Track and monitor your health metrics</p>
            {user && <p className="text-sm text-gray-500">User: {user.name} ({user.email})</p>}
          </div>
          <Button 
            onClick={() => setShowAddForm(true)} 
            disabled={submitting}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Reading
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={clearError} className="ml-auto">
              ×
            </Button>
          </div>
        )}

        {showAddForm && (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                Add New Vital Reading
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddVital} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Vital Type *</Label>
                    <select
                      id="type"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        validationErrors.type ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={newVital.type}
                      onChange={(e) => setNewVital(prev => ({ ...prev, type: e.target.value }))}
                      required
                    >
                      <option value="">Select type</option>
                      <option value="heart_rate">Heart Rate</option>
                      <option value="blood_pressure_systolic">Blood Pressure (Systolic)</option>
                      <option value="blood_pressure_diastolic">Blood Pressure (Diastolic)</option>
                      <option value="temperature">Temperature</option>
                      <option value="weight">Weight</option>
                    </select>
                    {validationErrors.type && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.type}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="value">Value *</Label>
                    <Input
                      id="value"
                      type="number"
                      step="0.1"
                      className={`transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        validationErrors.value ? 'border-red-500' : ''
                      }`}
                      value={newVital.value}
                      onChange={(e) => setNewVital(prev => ({ ...prev, value: e.target.value }))}
                      required
                    />
                    {validationErrors.value && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.value}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newVital.unit}
                      onChange={(e) => setNewVital(prev => ({ ...prev, unit: e.target.value }))}
                      placeholder="e.g., bpm, mmHg, °F, kg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newVital.notes}
                      onChange={(e) => setNewVital(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button 
                    type="submit"
                    disabled={submitting}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Saving...' : 'Save Reading'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowAddForm(false);
                      setValidationErrors({});
                      setNewVital({ type: '', value: '', unit: '', notes: '' });
                    }}
                    disabled={submitting}
                    className="hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vitals.map((vital) => (
            <Card key={vital._id || vital.id} className="hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${getVitalColor(vital.type)}`}></div>
              <CardContent className="p-6">
                {editingVital === (vital._id || vital.id) ? (
                  <form onSubmit={handleUpdateVital} className="space-y-3">
                    <div>
                      <Label>Type</Label>
                      <select
                        className={`w-full p-2 border rounded ${
                          validationErrors.type ? 'border-red-500' : 'border-gray-300'
                        }`}
                        value={editVital.type}
                        onChange={(e) => setEditVital(prev => ({ ...prev, type: e.target.value }))}
                      >
                        <option value="heart_rate">Heart Rate</option>
                        <option value="blood_pressure_systolic">Blood Pressure (Systolic)</option>
                        <option value="blood_pressure_diastolic">Blood Pressure (Diastolic)</option>
                        <option value="temperature">Temperature</option>
                        <option value="weight">Weight</option>
                      </select>
                    </div>
                    <div>
                      <Label>Value</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={editVital.value}
                        onChange={(e) => setEditVital(prev => ({ ...prev, value: e.target.value }))}
                        className={validationErrors.value ? 'border-red-500' : ''}
                      />
                    </div>
                    <div>
                      <Label>Unit</Label>
                      <Input
                        value={editVital.unit}
                        onChange={(e) => setEditVital(prev => ({ ...prev, unit: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Notes</Label>
                      <Input
                        value={editVital.notes}
                        onChange={(e) => setEditVital(prev => ({ ...prev, notes: e.target.value }))}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" disabled={submitting}>
                        {submitting ? 'Saving...' : 'Save'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setEditingVital(null);
                          setValidationErrors({});
                        }}
                        disabled={submitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full bg-gradient-to-r ${getVitalColor(vital.type)} bg-opacity-10`}>
                          {getVitalIcon(vital.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{formatVitalType(vital.type)}</h3>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {new Date(vital.timestamp || vital.recordedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditVital(vital)}
                          disabled={submitting}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteVital(vital._id || vital.id)}
                          disabled={submitting}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-4xl font-bold bg-gradient-to-r ${getVitalColor(vital.type)} bg-clip-text text-transparent mb-1`}>
                        {vital.value}
                      </div>
                      <div className="text-sm text-gray-500 font-medium">{vital.unit}</div>
                      {vital.notes && (
                        <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600 italic">{vital.notes}</p>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-center">
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors duration-200">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        View Trend
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {vitals.length === 0 && !loading && (
          <Card className="border-0 shadow-xl">
            <CardContent className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Activity className="w-12 h-12 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Vital Signs Recorded</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start tracking your health by adding your first vital reading. Monitor your progress and stay on top of your wellness journey.
              </p>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Reading
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}