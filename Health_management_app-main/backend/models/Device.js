const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'blood_pressure_monitor',
      'Blood Pressure Monitor',
      'glucose_meter',
      'Glucose Meter',
      'Glucose Monitor',
      'Blood Glucose Monitor',
      'thermometer',
      'Thermometer',
      'pulse_oximeter',
      'Pulse Oximeter',
      'fitness_tracker',
      'Fitness Tracker',
      'smart_scale',
      'Smart Scale',
      'medical_device',
      'Medical Device',
      'heart_rate_monitor',
      'Heart Rate Monitor',
      'ecg_monitor',
      'ECG Monitor',
      'other',
      'Other'
    ]
  },
  manufacturer: {
    type: String
  },
  model: {
    type: String
  },
  serialNumber: {
    type: String
  },
  status: {
    type: String,
    enum: ['connected', 'disconnected', 'syncing', 'error'],
    default: 'connected'
  },
  lastSync: {
    type: Date
  },
  batteryLevel: {
    type: Number,
    min: 0,
    max: 100
  },
  notes: {
    type: String
  },
  // Legacy fields for backward compatibility
  deviceType: String,
  reading: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Device', deviceSchema);