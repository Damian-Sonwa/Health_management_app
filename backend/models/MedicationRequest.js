const mongoose = require('mongoose');

const medicationRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  requestId: {
    type: String,
    unique: true,
    required: true
  },
  patientInfo: {
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true
    }
  },
  prescription: {
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    verified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date
  },
  pharmacy: {
    name: {
      type: String,
      required: [true, 'Pharmacy selection is required'],
      enum: [
        'hospital_pharmacy',
        'cvs_pharmacy',
        'walgreens',
        'rite_aid',
        'local_pharmacy'
      ]
    },
    address: String,
    phone: String,
    operatingHours: String
  },
  deliveryAddress: {
    street: {
      type: String,
      required: [true, 'Delivery address is required']
    },
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'USA' },
    instructions: String
  },
  payment: {
    method: {
      type: String,
      enum: ['card', 'insurance', 'cash', 'bank_transfer'],
      required: [true, 'Payment method is required']
    },
    amount: Number,
    currency: { type: String, default: 'USD' },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    receiptUrl: String,
    receiptFileName: String,
    paidAt: Date
  },
  medications: [{
    name: String,
    dosage: String,
    quantity: Number,
    price: Number,
    inStock: { type: Boolean, default: true }
  }],
  status: {
    type: String,
    enum: ['pending', 'processing', 'verified', 'dispensing', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  tracking: {
    trackingNumber: String,
    carrier: String,
    estimatedDelivery: Date,
    actualDelivery: Date,
    deliveryConfirmation: {
      signedBy: String,
      timestamp: Date,
      photo: String
    }
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  estimatedProcessingTime: {
    type: Number, // in hours
    default: 24
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
medicationRequestSchema.index({ userId: 1, status: 1 });
medicationRequestSchema.index({ requestId: 1 });
medicationRequestSchema.index({ 'pharmacy.name': 1 });
medicationRequestSchema.index({ createdAt: -1 });

// Virtual for formatted request ID
medicationRequestSchema.virtual('formattedRequestId').get(function() {
  return `MR-${this.requestId}`;
});

// Virtual for estimated completion
medicationRequestSchema.virtual('estimatedCompletion').get(function() {
  const created = new Date(this.createdAt);
  return new Date(created.getTime() + (this.estimatedProcessingTime * 60 * 60 * 1000));
});

// Pre-save middleware to generate request ID
medicationRequestSchema.pre('save', function(next) {
  if (!this.requestId) {
    this.requestId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  next();
});

// Method to update status
medicationRequestSchema.methods.updateStatus = function(newStatus, updatedBy, notes) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    updatedBy,
    notes,
    timestamp: new Date()
  });
  return this.save();
};

// Static method to get requests by status
medicationRequestSchema.statics.getByStatus = function(status, limit = 20) {
  return this.find({ status })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'name email phone');
};

module.exports = mongoose.model('MedicationRequest', medicationRequestSchema);