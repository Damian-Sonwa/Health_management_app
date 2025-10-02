import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Smartphone, Watch, Activity, Wifi, WifiOff, Battery } from 'lucide-react';
import { mockDevices } from '@/lib/healthData';
import HealthCard from './HealthCard';

export default function DeviceIntegration() {
  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'Fitness Tracker': return <Watch className="w-8 h-8" />;
      case 'Medical Device': return <Activity className="w-8 h-8" />;
      default: return <Smartphone className="w-8 h-8" />;
    }
  };

  const getTimeSinceSync = (lastSync: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - lastSync.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Connected Devices</h2>
        <Button className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600">
          Add Device
        </Button>
      </div>

      {/* Connection Status Overview */}
      <HealthCard gradient>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Connection Status</h3>
            <Badge className="bg-green-100 text-green-800">
              {mockDevices.filter(d => d.connected).length} of {mockDevices.length} Connected
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {mockDevices.filter(d => d.connected).length}
              </p>
              <p className="text-sm text-gray-600">Connected</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {mockDevices.filter(d => !d.connected).length}
              </p>
              <p className="text-sm text-gray-600">Offline</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {mockDevices.length}
              </p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </div>
        </CardContent>
      </HealthCard>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockDevices.map((device) => (
          <HealthCard 
            key={device.id} 
            className={`${
              device.connected 
                ? 'border-green-200 bg-green-50' 
                : 'border-gray-200 bg-gray-50'
            }`}
            glowing={device.connected}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    device.connected ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {getDeviceIcon(device.type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{device.name}</CardTitle>
                    <p className="text-sm text-gray-600">{device.type}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {device.connected ? (
                    <Wifi className="w-5 h-5 text-green-500 animate-pulse" />
                  ) : (
                    <WifiOff className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Connection Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge 
                  className={device.connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                >
                  {device.connected ? 'Connected' : 'Offline'}
                </Badge>
              </div>

              {/* Last Sync */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Last Sync</span>
                <span className="text-sm text-gray-600">
                  {getTimeSinceSync(device.lastSync)}
                </span>
              </div>

              {/* Battery Level (if available) */}
              {device.batteryLevel && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Battery</span>
                    <div className="flex items-center space-x-2">
                      <Battery className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{device.batteryLevel}%</span>
                    </div>
                  </div>
                  <Progress 
                    value={device.batteryLevel} 
                    className={`h-2 ${
                      device.batteryLevel > 50 ? 'text-green-500' :
                      device.batteryLevel > 20 ? 'text-yellow-500' : 'text-red-500'
                    }`}
                  />
                </div>
              )}

              {/* Action Button */}
              <Button 
                variant={device.connected ? "outline" : "default"}
                className={`w-full ${
                  device.connected 
                    ? 'hover:bg-green-50 border-green-200' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {device.connected ? 'Sync Now' : 'Reconnect'}
              </Button>
            </CardContent>
          </HealthCard>
        ))}
      </div>

      {/* Data Sync Information */}
      <HealthCard>
        <CardHeader>
          <CardTitle className="text-lg">Recent Sync Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockDevices.filter(d => d.connected).map((device) => (
              <div key={device.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">{device.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Synced {getTimeSinceSync(device.lastSync)}</p>
                  <p className="text-xs text-green-600">✓ Data updated</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </HealthCard>
    </div>
  );
}