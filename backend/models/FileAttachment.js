const mongoose = require('mongoose');

const fileAttachmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Made optional to support pharmacy/doctor profile uploads
    default: null,
    index: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null,
    index: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  fileName: {
    type: String,
    required: [true, 'File name is required'],
    trim: true
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required'],
    trim: true
  },
  fileType: {
    type: String,
    required: [true, 'File type is required'],
    trim: true
  },
  fileSize: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    enum: ['lab_result', 'medical_history', 'report', 'prescription', 'xray', 'other'],
    default: 'other'
  }
}, {
  timestamps: true
});

// Indexes
fileAttachmentSchema.index({ appointmentId: 1 });
fileAttachmentSchema.index({ uploadedBy: 1 });
fileAttachmentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('FileAttachment', fileAttachmentSchema);

