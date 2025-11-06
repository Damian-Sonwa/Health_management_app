/**
 * React hook for Bluetooth device integration
 * Provides easy access to Bluetooth service for health devices
 */

import { useState, useEffect, useCallback } from 'react';
import { bluetoothService, BluetoothDevice, BloodPressureReading, GlucoseReading } from '@/utils/bluetoothService';
import { toast } from 'sonner';

interface UseBluetoothReturn {
  isAvailable: boolean;
  isConnecting: boolean;
  isReading: boolean;
  connectedDevices: BluetoothDevice[];
  connectBPDevice: () => Promise<BluetoothDevice | null>;
  connectGlucoseDevice: () => Promise<BluetoothDevice | null>;
  disconnectDevice: (deviceId: string) => Promise<void>;
  readBloodPressure: (deviceId: string) => Promise<BloodPressureReading | null>;
  readGlucose: (deviceId: string) => Promise<GlucoseReading | null>;
  subscribeToReadings: (
    deviceId: string,
    callback: (reading: BloodPressureReading | GlucoseReading) => void
  ) => Promise<void>;
  isDeviceConnected: (deviceId: string) => boolean;
}

export function useBluetooth(): UseBluetoothReturn {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState<BluetoothDevice[]>([]);

  useEffect(() => {
    // Check Bluetooth availability
    setIsAvailable(bluetoothService.isAvailable());
    
    // Update connected devices list
    const updateDevices = () => {
      setConnectedDevices(bluetoothService.getConnectedDevices());
    };
    
    updateDevices();
    const interval = setInterval(updateDevices, 2000); // Check every 2 seconds
    
    return () => clearInterval(interval);
  }, []);

  const connectBPDevice = useCallback(async (): Promise<BluetoothDevice | null> => {
    if (!isAvailable) {
      toast.error('Bluetooth is not available in your browser');
      return null;
    }

    setIsConnecting(true);
    try {
      const device = await bluetoothService.requestDevice('blood_pressure');
      setConnectedDevices(bluetoothService.getConnectedDevices());
      toast.success(`Connected to ${device.name}`);
      return device;
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect to blood pressure device');
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, [isAvailable]);

  const connectGlucoseDevice = useCallback(async (): Promise<BluetoothDevice | null> => {
    if (!isAvailable) {
      toast.error('Bluetooth is not available in your browser');
      return null;
    }

    setIsConnecting(true);
    try {
      const device = await bluetoothService.requestDevice('glucose');
      setConnectedDevices(bluetoothService.getConnectedDevices());
      toast.success(`Connected to ${device.name}`);
      return device;
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect to glucose device');
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, [isAvailable]);

  const disconnectDevice = useCallback(async (deviceId: string): Promise<void> => {
    try {
      await bluetoothService.disconnectDevice(deviceId);
      setConnectedDevices(bluetoothService.getConnectedDevices());
      toast.success('Device disconnected');
    } catch (error: any) {
      toast.error(error.message || 'Failed to disconnect device');
    }
  }, []);

  const readBloodPressure = useCallback(async (deviceId: string): Promise<BloodPressureReading | null> => {
    setIsReading(true);
    try {
      const reading = await bluetoothService.readBloodPressure(deviceId);
      toast.success(`Reading: ${reading.systolic}/${reading.diastolic} mmHg`);
      return reading;
    } catch (error: any) {
      toast.error(error.message || 'Failed to read blood pressure');
      return null;
    } finally {
      setIsReading(false);
    }
  }, []);

  const readGlucose = useCallback(async (deviceId: string): Promise<GlucoseReading | null> => {
    setIsReading(true);
    try {
      const reading = await bluetoothService.readGlucose(deviceId);
      toast.success(`Reading: ${reading.value} ${reading.unit}`);
      return reading;
    } catch (error: any) {
      toast.error(error.message || 'Failed to read glucose');
      return null;
    } finally {
      setIsReading(false);
    }
  }, []);

  const subscribeToReadings = useCallback(async (
    deviceId: string,
    callback: (reading: BloodPressureReading | GlucoseReading) => void
  ): Promise<void> => {
    try {
      await bluetoothService.subscribeToReadings(deviceId, callback);
    } catch (error: any) {
      toast.error(error.message || 'Failed to subscribe to readings');
    }
  }, []);

  const isDeviceConnected = useCallback((deviceId: string): boolean => {
    return bluetoothService.isDeviceConnected(deviceId);
  }, []);

  return {
    isAvailable,
    isConnecting,
    isReading,
    connectedDevices,
    connectBPDevice,
    connectGlucoseDevice,
    disconnectDevice,
    readBloodPressure,
    readGlucose,
    subscribeToReadings,
    isDeviceConnected
  };
}

