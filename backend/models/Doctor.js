const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Doctor name is required'],
    trim: true
  },
  fullName: {
    type: String,
    trim: true
  },
  specialty: {
    type: String,
    required: [true, 'Specialty is required'],
    trim: true
  },
  specialization: {
    type: String,
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
  available: {
    type: Boolean,
    default: true
  },
  isAvailable: {
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
  licenseId: {
    type: String,
    trim: true
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

// Pre-save middleware to sync fields
doctorSchema.pre('save', function(next) {
  // Sync fullName with name if name is set (but not if fullName already exists)
  if (this.isModified('name') && this.name && !this.fullName) {
    this.fullName = this.name;
  } else if (this.isModified('fullName') && this.fullName && !this.name) {
    this.name = this.fullName;
  }
  
  // Sync specialization with specialty if specialty is set
  if (this.isModified('specialty') && this.specialty && !this.specialization) {
    this.specialization = this.specialty;
  } else if (this.isModified('specialization') && this.specialization && !this.specialty) {
    this.specialty = this.specialization;
  }
  
  // Sync isAvailable with available
  if (this.isModified('isAvailable') && this.isAvailable !== undefined && (this.available === undefined || !this.isModified('available'))) {
    this.available = this.isAvailable;
  } else if (this.isModified('available') && this.available !== undefined && (this.isAvailable === undefined || !this.isModified('isAvailable'))) {
    this.isAvailable = this.available;
  }
  
  next();
});

// Indexes
doctorSchema.index({ specialty: 1 });
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ isActive: 1 });
doctorSchema.index({ available: 1 });
doctorSchema.index({ isAvailable: 1 });
doctorSchema.index({ name: 'text', specialty: 'text' });

// Ensure virtuals are included in JSON output
doctorSchema.set('toJSON', { virtuals: true });
doctorSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Doctor', doctorSchema);
