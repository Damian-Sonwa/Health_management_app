/**
 * Bluetooth Service for Health Device Integration
 * Handles Web Bluetooth API connections for BP monitors and glucose meters
 */

// Bluetooth service UUIDs for health devices
const HEALTH_DEVICE_SERVICE_UUID = '00001810-0000-1000-8000-00805f9b34fb'; // Blood Pressure Service
const GLUCOSE_SERVICE_UUID = '00001808-0000-1000-8000-00805f9b34fb'; // Glucose Service

// Characteristic UUIDs
const BP_MEASUREMENT_CHAR_UUID = '00002a35-0000-1000-8000-00805f9b34fb'; // Blood Pressure Measurement
const GLUCOSE_MEASUREMENT_CHAR_UUID = '00002a18-0000-1000-8000-00805f9b34fb'; // Glucose Measurement

export interface BluetoothDevice {
  id: string;
  name: string;
  type: 'blood_pressure' | 'glucose';
  connected: boolean;
  gatt?: BluetoothRemoteGATTServer;
}

export interface BloodPressureReading {
  systolic: number;
  diastolic: number;
  pulse?: number;
  timestamp: Date;
}

export interface GlucoseReading {
  value: number;
  unit: 'mg/dL' | 'mmol/L';
  timestamp: Date;
}

export class BluetoothService {
  private static instance: BluetoothService;
  private connectedDevices: Map<string, BluetoothDevice> = new Map();
  private reconnectAttempts: Map<string, number> = new Map();
  private maxReconnectAttempts = 3;

  private constructor() {}

  static getInstance(): BluetoothService {
    if (!BluetoothService.instance) {
      BluetoothService.instance = new BluetoothService();
    }
    return BluetoothService.instance;
  }

  /**
   * Check if Web Bluetooth API is available
   */
  isAvailable(): boolean {
    return 'bluetooth' in navigator && 'requestDevice' in navigator.bluetooth;
  }

  /**
   * Request Bluetooth device connection
   */
  async requestDevice(
    deviceType: 'blood_pressure' | 'glucose',
    filters?: BluetoothRequestDeviceFilter[]
  ): Promise<BluetoothDevice> {
    if (!this.isAvailable()) {
      throw new Error('Web Bluetooth API is not available in this browser. Please use Chrome, Edge, or Opera.');
    }

    try {
      const serviceUUID = deviceType === 'blood_pressure' 
        ? HEALTH_DEVICE_SERVICE_UUID 
        : GLUCOSE_SERVICE_UUID;

      const device = await navigator.bluetooth.requestDevice({
        filters: filters || [{ services: [serviceUUID] }],
        optionalServices: [serviceUUID]
      });

      if (!device.gatt) {
        throw new Error('Device does not support GATT');
      }

      const gatt = await device.gatt.connect();
      
      const bluetoothDevice: BluetoothDevice = {
        id: device.id,
        name: device.name || 'Unknown Device',
        type: deviceType,
        connected: true,
        gatt
      };

      // Handle disconnection
      device.addEventListener('gattserverdisconnected', () => {
        this.handleDisconnection(device.id);
      });

      this.connectedDevices.set(device.id, bluetoothDevice);
      this.reconnectAttempts.set(device.id, 0);

      return bluetoothDevice;
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        throw new Error('No compatible device found. Please ensure your device is powered on and in pairing mode.');
      } else if (error.name === 'SecurityError') {
        throw new Error('Bluetooth permission denied. Please allow Bluetooth access in your browser settings.');
      } else if (error.name === 'NetworkError') {
        throw new Error('Connection failed. Please try again.');
      }
      throw new Error(`Failed to connect to device: ${error.message}`);
    }
  }

  /**
   * Connect to a previously paired device
   */
  async connectToDevice(deviceId: string): Promise<BluetoothDevice> {
    const device = this.connectedDevices.get(deviceId);
    if (!device) {
      throw new Error('Device not found');
    }

    if (device.connected && device.gatt?.connected) {
      return device;
    }

    try {
      const bluetoothDevice = await navigator.bluetooth.requestDevice({
        filters: [{ id: deviceId }]
      });

      if (!bluetoothDevice.gatt) {
        throw new Error('Device does not support GATT');
      }

      const gatt = await bluetoothDevice.gatt.connect();
      device.gatt = gatt;
      device.connected = true;
      this.reconnectAttempts.set(deviceId, 0);

      return device;
    } catch (error: any) {
      throw new Error(`Failed to reconnect: ${error.message}`);
    }
  }

  /**
   * Disconnect from a device
   */
  async disconnectDevice(deviceId: string): Promise<void> {
    const device = this.connectedDevices.get(deviceId);
    if (device?.gatt?.connected) {
      device.gatt.disconnect();
    }
    device.connected = false;
    this.connectedDevices.delete(deviceId);
    this.reconnectAttempts.delete(deviceId);
  }

  /**
   * Read blood pressure from connected device
   */
  async readBloodPressure(deviceId: string): Promise<BloodPressureReading> {
    const device = this.connectedDevices.get(deviceId);
    if (!device || !device.connected || !device.gatt?.connected) {
      throw new Error('Device not connected');
    }

    if (device.type !== 'blood_pressure') {
      throw new Error('Device is not a blood pressure monitor');
    }

    try {
      const service = await device.gatt.getPrimaryService(HEALTH_DEVICE_SERVICE_UUID);
      const characteristic = await service.getCharacteristic(BP_MEASUREMENT_CHAR_UUID);
      const dataView = await characteristic.readValue();
      
      // Parse BP data according to Bluetooth SIG specification
      // Format: Flags (1 byte), Systolic (2 bytes), Diastolic (2 bytes), Pulse (2 bytes, optional)
      const flags = dataView.getUint8(0);
      const systolic = dataView.getUint16(1, true); // Little-endian
      const diastolic = dataView.getUint16(3, true);
      let pulse: number | undefined;

      if (flags & 0x01) { // Pulse present flag
        pulse = dataView.getUint16(5, true);
      }

      return {
        systolic,
        diastolic,
        pulse,
        timestamp: new Date()
      };
    } catch (error: any) {
      throw new Error(`Failed to read blood pressure: ${error.message}`);
    }
  }

  /**
   * Read glucose from connected device
   */
  async readGlucose(deviceId: string): Promise<GlucoseReading> {
    const device = this.connectedDevices.get(deviceId);
    if (!device || !device.connected || !device.gatt?.connected) {
      throw new Error('Device not connected');
    }

    if (device.type !== 'glucose') {
      throw new Error('Device is not a glucose meter');
    }

    try {
      const service = await device.gatt.getPrimaryService(GLUCOSE_SERVICE_UUID);
      const characteristic = await service.getCharacteristic(GLUCOSE_MEASUREMENT_CHAR_UUID);
      const dataView = await characteristic.readValue();
      
      // Parse glucose data according to Bluetooth SIG specification
      // Format: Flags (1 byte), Sequence Number (2 bytes), Base Time (7 bytes), Glucose (2 bytes)
      const flags = dataView.getUint8(0);
      // Glucose value is at offset 9 (after flags + sequence + base time)
      // But for simplicity, we'll use offset 10 if data is longer, or parse based on actual length
      const dataLength = dataView.byteLength;
      let glucoseValue: number;
      
      if (dataLength >= 11) {
        glucoseValue = dataView.getUint16(9, true); // Little-endian
      } else if (dataLength >= 3) {
        // Simplified: if only flags + value, value is at offset 1
        glucoseValue = dataView.getUint16(1, true);
      } else {
        throw new Error('Invalid glucose data format');
      }
      
      // Determine unit based on flags (bit 0: 0 = mg/dL, 1 = mol/L)
      const unit = (flags & 0x01) ? 'mmol/L' : 'mg/dL';

      return {
        value: glucoseValue,
        unit: unit as 'mg/dL' | 'mmol/L',
        timestamp: new Date()
      };
    } catch (error: any) {
      throw new Error(`Failed to read glucose: ${error.message}`);
    }
  }

  /**
   * Subscribe to real-time readings from device
   */
  async subscribeToReadings(
    deviceId: string,
    callback: (reading: BloodPressureReading | GlucoseReading) => void
  ): Promise<void> {
    const device = this.connectedDevices.get(deviceId);
    if (!device || !device.connected || !device.gatt?.connected) {
      throw new Error('Device not connected');
    }

    try {
      const serviceUUID = device.type === 'blood_pressure' 
        ? HEALTH_DEVICE_SERVICE_UUID 
        : GLUCOSE_SERVICE_UUID;
      const charUUID = device.type === 'blood_pressure' 
        ? BP_MEASUREMENT_CHAR_UUID 
        : GLUCOSE_MEASUREMENT_CHAR_UUID;

      const service = await device.gatt.getPrimaryService(serviceUUID);
      const characteristic = await service.getCharacteristic(charUUID);
      
      await characteristic.startNotifications();
      
      characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        const dataView = event.target.value;
        
        if (device.type === 'blood_pressure') {
          const flags = dataView.getUint8(0);
          const systolic = dataView.getUint16(1, true);
          const diastolic = dataView.getUint16(3, true);
          let pulse: number | undefined;
          
          if (flags & 0x01) {
            pulse = dataView.getUint16(5, true);
          }
          
          callback({
            systolic,
            diastolic,
            pulse,
            timestamp: new Date()
          });
        } else {
          const flags = dataView.getUint8(0);
          const glucoseValue = dataView.getUint16(9, true);
          const unit = (flags & 0x01) ? 'mmol/L' : 'mg/dL';
          
          callback({
            value: glucoseValue,
            unit: unit as 'mg/dL' | 'mmol/L',
            timestamp: new Date()
          });
        }
      });
    } catch (error: any) {
      throw new Error(`Failed to subscribe to readings: ${error.message}`);
    }
  }

  /**
   * Handle device disconnection with auto-reconnect
   */
  private async handleDisconnection(deviceId: string): Promise<void> {
    const device = this.connectedDevices.get(deviceId);
    if (device) {
      device.connected = false;
    }

    const attempts = this.reconnectAttempts.get(deviceId) || 0;
    if (attempts < this.maxReconnectAttempts) {
      this.reconnectAttempts.set(deviceId, attempts + 1);
      
      // Attempt reconnection after delay
      setTimeout(async () => {
        try {
          await this.connectToDevice(deviceId);
        } catch (error) {
          console.error(`Reconnection attempt ${attempts + 1} failed:`, error);
        }
      }, 2000 * (attempts + 1)); // Exponential backoff
    }
  }

  /**
   * Get all connected devices
   */
  getConnectedDevices(): BluetoothDevice[] {
    return Array.from(this.connectedDevices.values()).filter(d => d.connected);
  }

  /**
   * Check if device is connected
   */
  isDeviceConnected(deviceId: string): boolean {
    const device = this.connectedDevices.get(deviceId);
    return device?.connected && device?.gatt?.connected || false;
  }
}

export const bluetoothService = BluetoothService.getInstance();

