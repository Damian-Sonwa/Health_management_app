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
    enum: ['blood_pressure_monitor', 'glucose_meter', 'thermometer', 'pulse_oximeter', 'fitness_tracker', 'smart_scale', 'other']
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