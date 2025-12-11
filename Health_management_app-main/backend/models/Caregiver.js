const mongoose = require('mongoose');

const caregiverSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  relationship: {
    type: String,
    enum: ['family', 'friend', 'professional', 'nurse', 'doctor', 'therapist', 'other'],
    default: 'family'
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  emergencyContact: {
    type: Boolean,
    default: false
  },
  primaryCaregiver: {
    type: Boolean,
    default: false
  },
  availability: {
    type: String,
    enum: ['full-time', 'part-time', 'on-call', 'weekends', 'weekdays'],
    default: 'on-call'
  },
  specialization: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  photoUrl: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
caregiverSchema.index({ userId: 1, isActive: 1 });
caregiverSchema.index({ userId: 1, emergencyContact: 1 });

module.exports = mongoose.model('Caregiver', caregiverSchema);

