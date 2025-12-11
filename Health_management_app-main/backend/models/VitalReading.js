const mongoose = require('mongoose');

const vitalReadingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  type: {
    type: String,
    required: [true, 'Vital type is required'],
    enum: [
      'heart_rate',
      'blood_pressure_systolic',
      'blood_pressure_diastolic',
      'temperature',
      'weight',
      'height',
      'bmi',
      'oxygen_saturation',
      'blood_glucose',
      'cholesterol'
    ]
  },
  value: {
    type: Number,
    required: [true, 'Vital value is required'],
    min: [0, 'Value cannot be negative']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    trim: true
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
    trim: true
  },
  recordedAt: {
    type: Date,
    default: Date.now
  },
  recordedBy: {
    type: String,
    enum: ['patient', 'doctor', 'nurse', 'device'],
    default: 'patient'
  },
  deviceInfo: {
    name: String,
    model: String,
    serialNumber: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
vitalReadingSchema.index({ userId: 1, type: 1, recordedAt: -1 });
vitalReadingSchema.index({ recordedAt: -1 });
vitalReadingSchema.index({ type: 1 });

// Virtual for formatted date
vitalReadingSchema.virtual('formattedDate').get(function() {
  return this.recordedAt.toLocaleDateString();
});

// Static method to get latest readings by type
vitalReadingSchema.statics.getLatestByType = function(userId, type, limit = 10) {
  return this.find({ userId, type })
    .sort({ recordedAt: -1 })
    .limit(limit)
    .populate('userId', 'name email');
};

// Static method to get readings in date range
vitalReadingSchema.statics.getInDateRange = function(userId, startDate, endDate) {
  return this.find({
    userId,
    recordedAt: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ recordedAt: -1 });
};

module.exports = mongoose.model('VitalReading', vitalReadingSchema);