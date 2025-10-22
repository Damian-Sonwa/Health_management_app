import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Smartphone, Watch, Activity, Wifi, WifiOff, Battery, Plus, Loader2, Edit, Trash2 } from 'lucide-react';
import { useDevices } from '@/hooks/useDevices';
import { toast } from 'sonner';
import HealthCard from './HealthCard';

export default function DeviceIntegration() {
  const { devices, isLoading, createDevice, updateDevice, deleteDevice, isCreating, isDeleting } = useDevices();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState<any | null>(null);
  const [newDevice, setNewDevice] = useState({
    name: '',
    type: 'Blood Pressure Monitor',
    manufacturer: '',
    model: '',
    serialNumber: ''
  });

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDevice({
        ...newDevice,
        status: 'connected',
        lastSync: new Date(),
        batteryLevel: 100
      });
      
      toast.success('Device added successfully!');
      setNewDevice({ name: '', type: 'Blood Pressure Monitor', manufacturer: '', model: '', serialNumber: '' });
      setShowAddForm(false);
    } catch (error: any) {
      toast.error('Failed to add device: ' + error.message);
    }
  };

  const handleUpdateDevice = async (id: string, updates: any) => {
    try {
      await updateDevice({ id, data: updates });
      toast.success('Device updated successfully!');
      setEditingDevice(null);
    } catch (error: any) {
      toast.error('Failed to update device: ' + error.message);
    }
  };

  const handleDeleteDevice = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this device?')) return;
    try {
      await deleteDevice(id);
      toast.success('Device removed successfully!');
    } catch (error: any) {
      toast.error('Failed to remove device: ' + error.message);
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'Fitness Tracker':
      case 'fitness_tracker':
        return <Watch className="w-8 h-8" />;
      case 'Medical Device':
      case 'medical_device':
      case 'Blood Pressure Monitor':
      case 'Glucose Meter':
        return <Activity className="w-8 h-8" />;
      default:
        return <Smartphone className="w-8 h-8" />;
    }
  };

  const getTimeSinceSync = (lastSync: Date | string) => {
    const now = new Date();
    const syncDate = new Date(lastSync);
    const diffMs = now.getTime() - syncDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const isConnected = (status: string) => status === 'connected' || status === 'active';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const connectedDevices = devices.filter((d: any) => isConnected(d.status));
  const offlineDevices = devices.filter((d: any) => !isConnected(d.status));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Connected Devices</h2>
        
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Device
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Device</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddDevice} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Device Name*</Label>
                <Input
                  id="name"
                  placeholder="Apple Watch"
                  value={newDevice.name}
                  onChange={(e) => setNewDevice({...newDevice, name: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Device Type*</Label>
                <select
                  id="type"
                  className="w-full p-2 border rounded-md"
                  value={newDevice.type}
                  onChange={(e) => setNewDevice({...newDevice, type: e.target.value})}
                >
                  <option value="Blood Pressure Monitor">Blood Pressure Monitor</option>
                  <option value="Glucose Meter">Glucose Meter</option>
                  <option value="Fitness Tracker">Fitness Tracker</option>
                  <option value="Medical Device">Medical Device</option>
                  <option value="Smart Scale">Smart Scale</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  placeholder="Apple"
                  value={newDevice.manufacturer}
                  onChange={(e) => setNewDevice({...newDevice, manufacturer: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  placeholder="Series 8"
                  value={newDevice.model}
                  onChange={(e) => setNewDevice({...newDevice, model: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serialNumber">Serial Number</Label>
                <Input
                  id="serialNumber"
                  placeholder="ABC123XYZ"
                  value={newDevice.serialNumber}
                  onChange={(e) => setNewDevice({...newDevice, serialNumber: e.target.value})}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit"
                  disabled={!newDevice.name || isCreating}
                  className="flex-1"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Device'
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

      {/* Connection Status Overview */}
      <HealthCard gradient>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Connection Status</h3>
            <Badge className="bg-green-100 text-green-800">
              {connectedDevices.length} of {devices.length} Connected
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {connectedDevices.length}
              </p>
              <p className="text-sm text-gray-600">Connected</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {offlineDevices.length}
              </p>
              <p className="text-sm text-gray-600">Offline</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {devices.length}
              </p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </div>
        </CardContent>
      </HealthCard>

      {/* Devices Grid */}
      {devices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((device: any) => {
            const connected = isConnected(device.status);
            
            return (
              <HealthCard 
                key={device._id} 
                className={`${
                  connected 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
                glowing={connected}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        connected ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {getDeviceIcon(device.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{device.name}</CardTitle>
                        <p className="text-sm text-gray-600">{device.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {connected ? (
                        <Wifi className="w-5 h-5 text-green-500 animate-pulse" />
                      ) : (
                        <WifiOff className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status</span>
                    <Badge className={`${
                      connected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {connected ? 'Connected' : 'Offline'}
                    </Badge>
                  </div>
                  
                  {device.manufacturer && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Manufacturer</span>
                      <span className="font-medium">{device.manufacturer}</span>
                    </div>
                  )}

                  {device.model && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Model</span>
                      <span className="font-medium">{device.model}</span>
                    </div>
                  )}
                  
                  {device.lastSync && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Last Sync</span>
                      <span className="font-medium">{getTimeSinceSync(device.lastSync)}</span>
                    </div>
                  )}
                  
                  {device.batteryLevel !== undefined && device.batteryLevel !== null && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-1">
                          <Battery className="w-4 h-4" />
                          Battery
                        </span>
                        <span className="font-medium">{device.batteryLevel}%</span>
                      </div>
                      <Progress value={device.batteryLevel} className="h-2" />
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setEditingDevice(device)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteDevice(device._id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-1" />
                          Remove
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </HealthCard>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No devices connected</h3>
            <p className="text-gray-600 mb-4">Add your first device to start tracking your health data.</p>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Device
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      {editingDevice && (
        <Dialog open={!!editingDevice} onOpenChange={() => setEditingDevice(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Device</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateDevice(editingDevice._id, editingDevice);
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Device Name</Label>
                <Input
                  id="edit-name"
                  value={editingDevice.name}
                  onChange={(e) => setEditingDevice({...editingDevice, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <select
                  id="edit-status"
                  className="w-full p-2 border rounded-md"
                  value={editingDevice.status}
                  onChange={(e) => setEditingDevice({...editingDevice, status: e.target.value})}
                >
                  <option value="connected">Connected</option>
                  <option value="disconnected">Disconnected</option>
                  <option value="offline">Offline</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-battery">Battery Level (%)</Label>
                <Input
                  id="edit-battery"
                  type="number"
                  min="0"
                  max="100"
                  value={editingDevice.batteryLevel || 0}
                  onChange={(e) => setEditingDevice({...editingDevice, batteryLevel: parseInt(e.target.value)})}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  Update
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setEditingDevice(null)}
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
