const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Doctor name is required'],
    trim: true
  },
  specialty: {
    type: String,
    required: [true, 'Specialty is required'],
    trim: true
  },
  hospital: {
    type: String,
    trim: true
  },
  contact: {
    type: String,
    trim: true
  },
  availableDays: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }],
  availableTimes: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  zoomLink: {
    type: String,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  chatAvailable: {
    type: Boolean,
    default: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  profileImage: {
    type: String
  },
  experience: {
    type: Number, // years of experience
    default: 0
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  consultationFee: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
doctorSchema.index({ specialty: 1 });
doctorSchema.index({ isActive: 1 });
doctorSchema.index({ name: 'text', specialty: 'text' });

module.exports = mongoose.model('Doctor', doctorSchema);
