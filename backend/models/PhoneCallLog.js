const mongoose = require('mongoose');

const phoneCallLogSchema = new mongoose.Schema({
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
  callType: {
    type: String,
    enum: ['incoming', 'outgoing'],
    required: [true, 'Call type is required']
  },
  duration: {
    type: Number, // in seconds
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['missed', 'completed', 'cancelled', 'busy', 'no_answer'],
    default: 'completed',
    required: true
  },
  phoneNumber: {
    type: String,
    trim: true,
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Indexes
phoneCallLogSchema.index({ doctorId: 1, createdAt: -1 });
phoneCallLogSchema.index({ patientId: 1, createdAt: -1 });
phoneCallLogSchema.index({ appointmentId: 1 });
phoneCallLogSchema.index({ status: 1, startTime: -1 });
phoneCallLogSchema.index({ callType: 1, createdAt: -1 });

// Calculate duration before saving
phoneCallLogSchema.pre('save', function(next) {
  if (this.endTime && this.startTime && this.status === 'completed') {
    this.duration = Math.floor((this.endTime - this.startTime) / 1000); // Convert to seconds
  }
  next();
});

// Static method to get call history
phoneCallLogSchema.statics.getCallHistory = function(doctorId, patientId, limit = 50) {
  const query = {};
  
  if (doctorId) query.doctorId = doctorId;
  if (patientId) query.patientId = patientId;
  
  return this.find(query)
    .sort({ startTime: -1 })
    .limit(limit)
    .populate('doctorId', 'name email phone')
    .populate('patientId', 'name email phone');
};

module.exports = mongoose.model('PhoneCallLog', phoneCallLogSchema);
