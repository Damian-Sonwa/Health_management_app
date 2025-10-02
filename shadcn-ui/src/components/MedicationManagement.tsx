import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Check, 
  Clock, 
  Pill, 
  Plus,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useMongoData } from '@/hooks/useMongoData';

export default function MedicationManagement() {
  const { medications, addMedication, loading } = useMongoData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    instructions: ''
  });

  const handleAddMedication = async () => {
    if (!newMedication.name || !newMedication.dosage || !newMedication.frequency) return;

    try {
      await addMedication({
        user_id: 'demo-user-123',
        name: newMedication.name,
        dosage: newMedication.dosage,
        frequency: newMedication.frequency,
        instructions: newMedication.instructions,
        is_active: true
      });

      setNewMedication({ name: '', dosage: '', frequency: '', instructions: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding medication:', error);
    }
  };

  const getAdherenceColor = (adherence: number) => {
    if (adherence >= 90) return 'text-green-600';
    if (adherence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAdherenceIcon = (adherence: number) => {
    if (adherence >= 90) return <CheckCircle className="w-4 h-4" />;
    if (adherence >= 70) return <Clock className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Medication Management</h2>
          <p className="text-gray-600 mt-1">Track your medications and adherence</p>
        </div>
        
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Medication
        </Button>
      </div>

      {/* Add Medication Form */}
      <Card className={showAddForm ? 'block' : 'hidden'}>
        <CardHeader>
          <CardTitle>Add New Medication</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="med-name">Medication Name</Label>
              <Input
                id="med-name"
                placeholder="e.g., Lisinopril"
                value={newMedication.name}
                onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage</Label>
              <Input
                id="dosage"
                placeholder="e.g., 10mg, 1 tablet"
                value={newMedication.dosage}
                onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Input
                id="frequency"
                placeholder="e.g., Once daily, Twice daily"
                value={newMedication.frequency}
                onChange={(e) => setNewMedication({...newMedication, frequency: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Input
                id="instructions"
                placeholder="e.g., Take with food"
                value={newMedication.instructions}
                onChange={(e) => setNewMedication({...newMedication, instructions: e.target.value})}
              />
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button 
              onClick={handleAddMedication} 
              disabled={!newMedication.name || !newMedication.dosage || !newMedication.frequency}
            >
              Add Medication
            </Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Medication Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Current Medications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {medications.map((medication) => (
              <div key={medication._id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Pill className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{medication.name}</h3>
                      <p className="text-gray-600">{medication.dosage} • {medication.frequency}</p>
                      {medication.instructions && (
                        <p className="text-sm text-gray-500 mt-1">{medication.instructions}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getAdherenceIcon(medication.adherence || 95)}
                    <span className={`text-sm font-medium ${getAdherenceColor(medication.adherence || 95)}`}>
                      {medication.adherence || 95}%
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Adherence Rate</span>
                    <span className={getAdherenceColor(medication.adherence || 95)}>
                      {medication.adherence || 95}%
                    </span>
                  </div>
                  <Progress value={medication.adherence || 95} className="h-2" />
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Started: {new Date(medication.start_date || medication.startDate || Date.now()).toLocaleDateString()}
                  </div>
                  {medication.end_date && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Ends: {new Date(medication.end_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {medications.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No medications added yet</p>
                <p className="text-sm">Click "Add Medication" to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Medication Schedule for Today */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {medications.map((medication) => {
              // Generate mock schedule times based on frequency
              const schedules = [];
              if (medication.frequency.toLowerCase().includes('once')) {
                schedules.push({ time: '08:00', taken: true });
              } else if (medication.frequency.toLowerCase().includes('twice')) {
                schedules.push(
                  { time: '08:00', taken: true },
                  { time: '20:00', taken: false }
                );
              } else if (medication.frequency.toLowerCase().includes('three')) {
                schedules.push(
                  { time: '08:00', taken: true },
                  { time: '14:00', taken: true },
                  { time: '20:00', taken: false }
                );
              }

              return schedules.map((schedule, index) => (
                <div key={`${medication._id}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${schedule.taken ? 'bg-green-100' : 'bg-gray-200'}`}>
                      {schedule.taken ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{medication.name}</p>
                      <p className="text-sm text-gray-500">{medication.dosage}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{schedule.time}</p>
                    <Badge variant={schedule.taken ? "default" : "secondary"}>
                      {schedule.taken ? 'Taken' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              ));
            })}
            
            {medications.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                <p>No medications scheduled for today</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}