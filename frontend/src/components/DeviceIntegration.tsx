import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Smartphone, Watch, Activity, Wifi, WifiOff, Battery, Plus, Loader2, Edit, Trash2, Bluetooth, RefreshCw, AlertCircle } from 'lucide-react';
import { useDevices } from '@/hooks/useDevices';
import { useBluetooth } from '@/hooks/useBluetooth';
import { toast } from 'sonner';
import HealthCard from './HealthCard';
import { API_BASE_URL } from '@/config/api';

export default function DeviceIntegration() {
  const { devices, isLoading, createDevice, updateDevice, deleteDevice, isCreating, isDeleting } = useDevices();
  const { 
    isAvailable: isBluetoothAvailable, 
    isConnecting, 
    isReading,
    connectedDevices: bluetoothDevices,
    connectBPDevice,
    connectGlucoseDevice,
    disconnectDevice: disconnectBluetooth,
    readBloodPressure,
    readGlucose,
    isDeviceConnected
  } = useBluetooth();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState<any | null>(null);
  const [syncingDeviceId, setSyncingDeviceId] = useState<string | null>(null);
  const [newDevice, setNewDevice] = useState({
    name: '',
    type: 'Blood Pressure Monitor',
    manufacturer: '',
    model: '',
    serialNumber: ''
  });

  // Sync Bluetooth device readings to backend
  const syncDeviceReadings = async (deviceId: string, deviceType: 'blood_pressure' | 'glucose') => {
    setSyncingDeviceId(deviceId);
    try {
      const bluetoothDevice = bluetoothDevices.find(d => d.id === deviceId);
      if (!bluetoothDevice) {
        throw new Error('Bluetooth device not found');
      }

      let readings: any[] = [];
      
      if (deviceType === 'blood_pressure') {
        const reading = await readBloodPressure(deviceId);
        if (reading) {
          readings = [reading];
        }
      } else if (deviceType === 'glucose') {
        const reading = await readGlucose(deviceId);
        if (reading) {
          readings = [reading];
        }
      }

      if (readings.length === 0) {
        throw new Error('No readings available');
      }

      // Find or create device in database
      const device = devices.find((d: any) => 
        d.serialNumber === bluetoothDevice.id || 
        d.name === bluetoothDevice.name
      ) || await createDevice({
        name: bluetoothDevice.name,
        type: deviceType === 'blood_pressure' ? 'Blood Pressure Monitor' : 'Glucose Meter',
        manufacturer: 'Bluetooth Device',
        model: bluetoothDevice.name,
        serialNumber: bluetoothDevice.id,
        status: 'connected',
        lastSync: new Date(),
        batteryLevel: 100
      });

      // Sync readings to backend
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/devices/${device._id}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          readingType: deviceType,
          readings: readings.map(r => ({
            ...r,
            timestamp: r.timestamp?.toISOString() || new Date().toISOString()
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to sync readings to server');
      }

      toast.success(`Successfully synced ${readings.length} reading(s)`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to sync device readings');
    } finally {
      setSyncingDeviceId(null);
    }
  };

  // Handle Bluetooth device connection
  const handleBluetoothConnect = async (deviceType: 'blood_pressure' | 'glucose') => {
    try {
      const bluetoothDevice = deviceType === 'blood_pressure' 
        ? await connectBPDevice() 
        : await connectGlucoseDevice();
      
      if (bluetoothDevice) {
        // Auto-create device entry in database
        await createDevice({
          name: bluetoothDevice.name,
          type: deviceType === 'blood_pressure' ? 'Blood Pressure Monitor' : 'Glucose Meter',
          manufacturer: 'Bluetooth Device',
          model: bluetoothDevice.name,
          serialNumber: bluetoothDevice.id,
          status: 'connected',
          lastSync: new Date(),
          batteryLevel: 100
        });
      }
    } catch (error: any) {
      // Error already handled in hook
    }
  };

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Connected Devices</h2>
        
        <div className="flex flex-wrap gap-2">
          {/* Bluetooth Connection Buttons */}
          {isBluetoothAvailable && (
            <>
              <Button
                onClick={() => handleBluetoothConnect('blood_pressure')}
                disabled={isConnecting}
                variant="outline"
                className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20"
              >
                {isConnecting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Bluetooth className="w-4 h-4 mr-2" />
                )}
                Connect BP Monitor
              </Button>
              <Button
                onClick={() => handleBluetoothConnect('glucose')}
                disabled={isConnecting}
                variant="outline"
                className="border-green-500 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/20"
              >
                {isConnecting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Bluetooth className="w-4 h-4 mr-2" />
                )}
                Connect Glucose Meter
              </Button>
            </>
          )}
          
          {!isBluetoothAvailable && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <AlertCircle className="w-4 h-4" />
              <span>Bluetooth not available (requires Chrome/Edge/Opera)</span>
            </div>
          )}
          
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
      </div>

      {/* Connection Status Overview */}
      <HealthCard gradient>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Connection Status</h3>
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
                        <CardTitle className="text-lg dark:text-gray-100">{device.name}</CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{device.type}</p>
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
                    <span className="text-gray-600 dark:text-gray-400">Status</span>
                    <Badge className={`${
                      connected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {connected ? 'Connected' : 'Offline'}
                    </Badge>
                  </div>
                  
                  {device.manufacturer && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Manufacturer</span>
                      <span className="font-medium dark:text-gray-200">{device.manufacturer}</span>
                    </div>
                  )}

                  {device.model && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Model</span>
                      <span className="font-medium dark:text-gray-200">{device.model}</span>
                    </div>
                  )}
                  
                  {device.lastSync && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Last Sync</span>
                      <span className="font-medium">{getTimeSinceSync(device.lastSync)}</span>
                    </div>
                  )}
                  
                  {device.batteryLevel !== undefined && device.batteryLevel !== null && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <Battery className="w-4 h-4" />
                          Battery
                        </span>
                        <span className="font-medium">{device.batteryLevel}%</span>
                      </div>
                      <Progress value={device.batteryLevel} className="h-2" />
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-2">
                    {/* Sync button for Bluetooth devices */}
                    {device.serialNumber && bluetoothDevices.some(bd => bd.id === device.serialNumber) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-blue-500 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20"
                        onClick={() => {
                          const deviceType = device.type === 'Blood Pressure Monitor' ? 'blood_pressure' : 'glucose';
                          syncDeviceReadings(device.serialNumber, deviceType);
                        }}
                        disabled={syncingDeviceId === device.serialNumber || isReading}
                      >
                        {syncingDeviceId === device.serialNumber || isReading ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4 mr-1" />
                        )}
                        Sync
                      </Button>
                    )}
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
                      className="flex-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      onClick={async () => {
                        // Disconnect Bluetooth if connected
                        if (device.serialNumber && bluetoothDevices.some(bd => bd.id === device.serialNumber)) {
                          try {
                            await disconnectBluetooth(device.serialNumber);
                          } catch (error) {
                            // Continue with deletion even if disconnect fails
                          }
                        }
                        await handleDeleteDevice(device._id);
                      }}
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
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-2">No devices connected</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Add your first device to start tracking your health data.</p>
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
