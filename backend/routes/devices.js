const express = require('express');
const Device = require('../models/Device');
const Vital = require('../models/Vital');
const VitalReading = require('../models/VitalReading');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all devices for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const devices = await Device.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: devices
    });
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch devices',
      error: error.message
    });
  }
});

// Create new device
router.post('/', auth, async (req, res) => {
  try {
    const { name, type, manufacturer, model, serialNumber, status, batteryLevel } = req.body;

    const device = new Device({
      userId: req.user.id,
      name: name || 'Unknown Device',
      type: type || 'Medical Device',
      manufacturer,
      model,
      serialNumber,
      status: status || 'connected',
      lastSync: new Date(),
      batteryLevel: batteryLevel || 100
    });

    await device.save();

    res.status(201).json({
      success: true,
      message: 'Device added successfully',
      data: device
    });
  } catch (error) {
    console.error('Error creating device:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create device',
      error: error.message
    });
  }
});

// Sync device readings (BP or Glucose) - Added for Bluetooth integration
router.post('/:id/sync', auth, async (req, res) => {
  try {
    const device = await Device.findOne({ _id: req.params.id, userId: req.user.id });
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    const { readingType, readings } = req.body; // readingType: 'blood_pressure' | 'glucose'
    
    if (!readingType || !readings) {
      return res.status(400).json({
        success: false,
        message: 'Reading type and readings are required'
      });
    }

    const syncedReadings = [];

    if (readingType === 'blood_pressure') {
      // Handle BP readings - create both systolic and diastolic
      for (const reading of readings) {
        const { systolic, diastolic, pulse, timestamp } = reading;
        
        // Create VitalReading entries for both systolic and diastolic
        const systolicReading = new VitalReading({
          userId: req.user.id,
          type: 'blood_pressure_systolic',
          value: systolic,
          unit: 'mmHg',
          recordedAt: timestamp ? new Date(timestamp) : new Date(),
          recordedBy: 'device',
          deviceInfo: {
            name: device.name,
            model: device.model,
            serialNumber: device.serialNumber
          },
          isVerified: true
        });
        await systolicReading.save();
        syncedReadings.push(systolicReading);

        const diastolicReading = new VitalReading({
          userId: req.user.id,
          type: 'blood_pressure_diastolic',
          value: diastolic,
          unit: 'mmHg',
          recordedAt: timestamp ? new Date(timestamp) : new Date(),
          recordedBy: 'device',
          deviceInfo: {
            name: device.name,
            model: device.model,
            serialNumber: device.serialNumber
          },
          isVerified: true
        });
        await diastolicReading.save();
        syncedReadings.push(diastolicReading);

        // Also create legacy Vital entry for compatibility
        const vital = new Vital({
          userId: req.user.id,
          type: 'Blood Pressure',
          value: `${systolic}/${diastolic}${pulse ? ` (Pulse: ${pulse})` : ''}`,
          unit: 'mmHg',
          recordedAt: timestamp ? new Date(timestamp) : new Date()
        });
        await vital.save();
      }
    } else if (readingType === 'glucose') {
      // Handle glucose readings
      for (const reading of readings) {
        const { value, unit, timestamp } = reading;
        
        const vitalReading = new VitalReading({
          userId: req.user.id,
          type: 'blood_glucose',
          value: value,
          unit: unit === 'mmol/L' ? 'mmol/L' : 'mg/dL',
          recordedAt: timestamp ? new Date(timestamp) : new Date(),
          recordedBy: 'device',
          deviceInfo: {
            name: device.name,
            model: device.model,
            serialNumber: device.serialNumber
          },
          isVerified: true
        });
        await vitalReading.save();
        syncedReadings.push(vitalReading);

        // Also create legacy Vital entry for compatibility
        const vital = new Vital({
          userId: req.user.id,
          type: 'Blood Sugar',
          value: `${value} ${unit}`,
          unit: unit,
          recordedAt: timestamp ? new Date(timestamp) : new Date()
        });
        await vital.save();
      }
    }

    // Update device lastSync
    device.lastSync = new Date();
    device.status = 'connected';
    await device.save();

    res.status(201).json({
      success: true,
      message: `Successfully synced ${syncedReadings.length} reading(s)`,
      data: {
        device,
        readings: syncedReadings
      }
    });
  } catch (error) {
    console.error('Error syncing device readings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync device readings',
      error: error.message
    });
  }
});

// Update device
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, type, manufacturer, model, serialNumber, status, batteryLevel, lastSync } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (type) updateData.type = type;
    if (manufacturer !== undefined) updateData.manufacturer = manufacturer;
    if (model !== undefined) updateData.model = model;
    if (serialNumber !== undefined) updateData.serialNumber = serialNumber;
    if (status) updateData.status = status;
    if (batteryLevel !== undefined) updateData.batteryLevel = batteryLevel;
    if (lastSync) updateData.lastSync = new Date(lastSync);

    const device = await Device.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    res.json({
      success: true,
      message: 'Device updated successfully',
      data: device
    });
  } catch (error) {
    console.error('Error updating device:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update device',
      error: error.message
    });
  }
});

// Delete device
router.delete('/:id', auth, async (req, res) => {
  try {
    const device = await Device.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    res.json({
      success: true,
      message: 'Device deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting device:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete device',
      error: error.message
    });
  }
});

module.exports = router;