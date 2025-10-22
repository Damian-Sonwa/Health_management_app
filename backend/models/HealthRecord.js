const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['diagnosis', 'prescription', 'lab_result', 'document', 'imaging', 'vaccination', 'allergy', 'surgery'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  doctor_name: {
    type: String,
    trim: true
  },
  hospital_name: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  fileUrl: {
    type: String,  // Store base64 encoded file or URL
    trim: true
  },
  fileName: {
    type: String,
    trim: true
  },
  fileType: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  isShared: {
    type: Boolean,
    default: false
  },
  sharedWith: [{
    type: String,  // Email addresses
    trim: true
  }],
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Index for faster queries
healthRecordSchema.index({ userId: 1, date: -1 });
healthRecordSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('HealthRecord', healthRecordSchema);

