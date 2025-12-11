import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Droplets, 
  Wind, 
  Plus, 
  TrendingUp, 
  TrendingDown,
  Clock,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useVitals } from '@/hooks/useVitals';
import { useGamification } from '@/hooks/useGamification';
import { toast } from 'sonner';

const vitalTypes = {
  blood_pressure_systolic: { 
    label: 'Blood Pressure (Systolic)', 
    icon: Heart, 
    unit: 'mmHg', 
    color: 'text-red-500',
    normalRange: '90-140',
    placeholder: 'e.g., 120'
  },
  blood_pressure_diastolic: { 
    label: 'Blood Pressure (Diastolic)', 
    icon: Heart, 
    unit: 'mmHg', 
    color: 'text-red-400',
    normalRange: '60-90',
    placeholder: 'e.g., 80'
  },
  blood_sugar: { 
    label: 'Blood Glucose', 
    icon: Wind, 
    unit: 'mg/dL', 
    color: 'text-green-500',
    normalRange: '70-140',
    placeholder: 'e.g., 95'
  },
  heart_rate: { 
    label: 'Heart Rate', 
    icon: Activity, 
    unit: 'bpm', 
    color: 'text-blue-500',
    normalRange: '60-100',
    placeholder: 'e.g., 72'
  },
  temperature: { 
    label: 'Body Temperature', 
    icon: Thermometer, 
    unit: '°F', 
    color: 'text-orange-500',
    normalRange: '97-99',
    placeholder: 'e.g., 98.6'
  },
  weight: { 
    label: 'Weight', 
    icon: Droplets, 
    unit: 'lbs', 
    color: 'text-purple-500',
    normalRange: 'varies',
    placeholder: 'e.g., 150'
  }
};

export default function VitalsTracking() {
  // Use React Query hook for vitals
  const { vitals, isLoading, createVital, deleteVital, isCreating } = useVitals();
  const { awardPoints } = useGamification();
  
  const [isAddingReading, setIsAddingReading] = useState(false);
  const [newReading, setNewReading] = useState({
    type: 'blood_pressure_systolic' as keyof typeof vitalTypes,
    value: '',
    notes: ''
  });

  const handleAddReading = async () => {
    if (!newReading.value.trim()) {
      toast.error('Please enter a value');
      return;
    }

    try {
      await createVital({
        type: newReading.type,
        value: parseFloat(newReading.value),
        unit: vitalTypes[newReading.type].unit,
        notes: newReading.notes.trim() || undefined,
        recordedAt: new Date()
      });
      
      // Award gamification points
      const category = newReading.type.includes('blood_pressure') ? 'blood_pressure' : 
                      newReading.type === 'blood_sugar' ? 'blood_glucose' : 'general';
      const points = 10; // 10 points per vital reading
      await awardPoints(category, points, 'vital_added');
      
      toast.success('Vital reading added successfully! +10 points 🎉');
      setNewReading({ type: 'blood_pressure_systolic', value: '', notes: '' });
      setIsAddingReading(false);
    } catch (error: any) {
      toast.error('Failed to add vital reading: ' + error.message);
    }
  };

  const getVitalStatus = (type: keyof typeof vitalTypes, value: number) => {
    switch (type) {
      case 'blood_pressure_systolic':
        if (value > 140) return 'high';
        if (value < 90) return 'low';
        return 'normal';
      case 'blood_pressure_diastolic':
        if (value > 90) return 'high';
        if (value < 60) return 'low';
        return 'normal';
      case 'heart_rate':
        if (value > 100) return 'high';
        if (value < 60) return 'low';
        return 'normal';
      case 'temperature':
        if (value > 100.4) return 'high';
        if (value < 97) return 'low';
        return 'normal';
      case 'blood_sugar':
        if (value > 140) return 'high';
        if (value < 70) return 'low';
        return 'normal';
      default:
        return 'normal';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'low': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'high': return <TrendingUp className="w-3 h-3" />;
      case 'low': return <TrendingDown className="w-3 h-3" />;
      default: return <CheckCircle className="w-3 h-3" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    }
  };

  const getLatestReadingByType = (type: keyof typeof vitalTypes) => {
    return vitals.find((vital: any) => vital.type === type);
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Vital Signs</h2>
          <p className="text-gray-600 mt-1">Monitor Blood Pressure & Blood Glucose</p>
        </div>
        
        <Dialog open={isAddingReading} onOpenChange={setIsAddingReading}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Reading
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Vital Reading</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vital-type">Vital Type</Label>
                <select
                  id="vital-type"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={newReading.type}
                  onChange={(e) => setNewReading({...newReading, type: e.target.value as keyof typeof vitalTypes})}
                >
                  {Object.entries(vitalTypes).map(([key, type]) => (
                    <option key={key} value={key}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="vital-value">
                  Value ({vitalTypes[newReading.type].unit})
                </Label>
                <Input
                  id="vital-value"
                  type="number"
                  placeholder={vitalTypes[newReading.type].placeholder}
                  value={newReading.value}
                  onChange={(e) => setNewReading({...newReading, value: e.target.value})}
                />
                <p className="text-xs text-gray-500">
                  Normal range: {vitalTypes[newReading.type].normalRange}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="vital-notes">Notes (Optional)</Label>
                <Input
                  id="vital-notes"
                  placeholder="Add any notes about this reading..."
                  value={newReading.notes}
                  onChange={(e) => setNewReading({...newReading, notes: e.target.value})}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleAddReading}
                  disabled={!newReading.value.trim() || isCreating}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Reading'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddingReading(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(vitalTypes).map(([key, type]) => {
          const IconComponent = type.icon;
          const latestReading = getLatestReadingByType(key as keyof typeof vitalTypes);
          const status = latestReading ? getVitalStatus(key as keyof typeof vitalTypes, latestReading.value) : 'normal';
          
          return (
            <Card key={key} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <IconComponent className={`w-5 h-5 ${type.color}`} />
                  <Badge className={`text-xs px-2 py-1 ${getStatusColor(status)}`}>
                    {getStatusIcon(status)}
                    <span className="ml-1 capitalize">{status}</span>
                  </Badge>
                </div>
                <h3 className="font-medium text-gray-800 text-sm">{type.label}</h3>
                <div className="mt-2">
                  {latestReading ? (
                    <>
                      <p className="text-lg font-bold text-gray-900">
                        {latestReading.value} <span className="text-sm font-normal text-gray-500">{type.unit}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimestamp(latestReading.recordedAt)}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">No readings yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Readings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-500" />
            Recent Readings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vitals.length > 0 ? (
            <div className="space-y-4">
              {vitals.slice(0, 10).map((reading: any) => {
                const vitalType = vitalTypes[reading.type as keyof typeof vitalTypes];
                if (!vitalType) return null;
                
                const IconComponent = vitalType.icon;
                const status = getVitalStatus(reading.type as keyof typeof vitalTypes, reading.value);
                
                return (
                  <div key={reading._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full bg-white ${vitalType.color}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{vitalType.label}</h4>
                        <p className="text-sm text-gray-600">
                          {reading.value} {vitalType.unit}
                          {reading.notes && (
                            <span className="ml-2 text-gray-500">• {reading.notes}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`text-xs px-2 py-1 mb-1 ${getStatusColor(status)}`}>
                        {getStatusIcon(status)}
                        <span className="ml-1 capitalize">{status}</span>
                      </Badge>
                      <p className="text-xs text-gray-500">
                        {formatTimestamp(reading.recordedAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No vital readings yet</h3>
              <p className="text-gray-600 mb-4">Start tracking your health by adding your first vital reading.</p>
              <Button 
                onClick={() => setIsAddingReading(true)}
                className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Reading
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Health Tips */}
      <Card className="bg-gradient-to-r from-blue-50 to-teal-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-blue-100 rounded-full">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">Health Monitoring Tips</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Take readings at consistent times for better tracking</li>
                <li>• Record any symptoms or activities that might affect your vitals</li>
                <li>• Share concerning readings with your healthcare provider</li>
                <li>• Keep your monitoring devices calibrated and clean</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
