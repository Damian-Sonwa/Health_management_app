const mongoose = require('mongoose');

const videoCallSessionSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Doctor ID is required'],
    index: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient ID is required'],
    index: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: [true, 'Appointment ID is required'],
    index: true
  },
  status: {
    type: String,
    enum: ['initiated', 'joined', 'ended', 'cancelled'],
    default: 'initiated',
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now,
    required: true
  },
  endTime: {
    type: Date,
    default: null
  },
  meetingId: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  meetingLink: {
    type: String,
    trim: true
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  recordingUrl: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes
videoCallSessionSchema.index({ doctorId: 1, status: 1 });
videoCallSessionSchema.index({ patientId: 1, status: 1 });
videoCallSessionSchema.index({ appointmentId: 1 });
videoCallSessionSchema.index({ status: 1, startTime: -1 });

// Calculate duration before saving
videoCallSessionSchema.pre('save', function(next) {
  if (this.endTime && this.startTime) {
    this.duration = Math.floor((this.endTime - this.startTime) / 1000); // Convert to seconds
  }
  next();
});

// Static method to get active sessions
videoCallSessionSchema.statics.getActiveSessions = function(doctorId, patientId) {
  const query = {
    status: { $in: ['initiated', 'joined'] }
  };
  
  if (doctorId) query.doctorId = doctorId;
  if (patientId) query.patientId = patientId;
  
  return this.find(query).sort({ startTime: -1 });
};

module.exports = mongoose.model('VideoCallSession', videoCallSessionSchema);

