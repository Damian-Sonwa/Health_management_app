const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  pharmacyName: {
    type: String,
    required: false, // Made optional - will be set during profile setup
    trim: true,
    maxlength: [200, 'Pharmacy name cannot exceed 200 characters'],
    default: 'Pending Pharmacy Name'
  },
  address: {
    street: {
      type: String,
      trim: true,
      default: ''
    },
    city: {
      type: String,
      trim: true,
      default: ''
    },
    state: {
      type: String,
      trim: true,
      default: ''
    },
    zipCode: {
      type: String,
      trim: true,
      default: ''
    },
    country: {
      type: String,
      trim: true,
      default: 'USA'
    }
  },
  phone: {
    type: String,
    required: false, // Made optional - will be set during profile setup
    trim: true,
    default: ''
  },
  licenseId: {
    type: String,
    trim: true,
    default: null
  },
  licenseImage: {
    type: String,
    trim: true,
    default: null
  },
  logo: {
    type: String,
    trim: true,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  onboardingCompleted: {
    type: Boolean,
    default: false,
    index: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    trim: true,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
pharmacySchema.index({ status: 1, createdAt: -1 });
pharmacySchema.index({ userId: 1 });

module.exports = mongoose.model('Pharmacy', pharmacySchema);

