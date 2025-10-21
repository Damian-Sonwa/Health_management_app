const mongoose = require('mongoose');

const vitalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Blood Pressure', 'Heart Rate', 'Temperature', 'Blood Sugar', 'Oxygen Level', 'Weight', 'Height', 'BMI', 'Other']
  },
  value: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    required: false
  },
  notes: {
    type: String,
    required: false
  },
  recordedAt: {
    type: Date,
    default: Date.now
  },
  // Legacy fields for backward compatibility
  bloodPressure: String,
  pulse: String,
  temperature: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Vital', vitalSchema);