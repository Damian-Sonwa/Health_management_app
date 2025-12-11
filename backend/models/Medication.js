const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  dosage: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  notes: {
    type: String
  },
  prescribedBy: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'discontinued', 'pending'],
    default: 'active'
  },
  // Legacy fields for backward compatibility
  prescriptionFile: String,
  paymentReceipt: String,
  deliveryAddress: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Medication', medicationSchema);