const mongoose = require('mongoose');

const pharmacyResponseSchema = new mongoose.Schema({
  medicationRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicationRequest',
    required: [true, 'Medication request ID is required'],
    index: true
  },
  pharmacyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Pharmacy ID is required'],
    index: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient ID is required'],
    index: true
  },
  responseType: {
    type: String,
    enum: ['call', 'message', 'confirmation', 'rejection', 'payment_verification'],
    required: true
  },
  callLog: {
    callType: {
      type: String,
      enum: ['incoming', 'outgoing']
    },
    phoneNumber: String,
    duration: Number, // in seconds
    status: {
      type: String,
      enum: ['initiated', 'completed', 'missed', 'busy', 'no_answer']
    },
    startTime: Date,
    endTime: Date,
    recordingUrl: String
  },
  message: {
    type: String,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes
pharmacyResponseSchema.index({ medicationRequestId: 1, createdAt: -1 });
pharmacyResponseSchema.index({ pharmacyId: 1, createdAt: -1 });
pharmacyResponseSchema.index({ patientId: 1, createdAt: -1 });
pharmacyResponseSchema.index({ responseType: 1 });

// Static method to get call logs for a pharmacy
pharmacyResponseSchema.statics.getCallLogs = function(pharmacyId, limit = 50) {
  return this.find({
    pharmacyId,
    responseType: 'call'
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('medicationRequestId', 'requestId status')
    .populate('patientId', 'name phone email');
};

// Static method to get responses for a medication request
pharmacyResponseSchema.statics.getByRequest = function(medicationRequestId) {
  return this.find({ medicationRequestId })
    .sort({ createdAt: -1 })
    .populate('pharmacyId', 'name email phone')
    .populate('patientId', 'name email phone');
};

module.exports = mongoose.model('PharmacyResponse', pharmacyResponseSchema);

