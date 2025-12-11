const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient ID is required'],
    index: true
  },
  doctorName: {
    type: String,
    required: [true, 'Doctor name is required'],
    trim: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  specialty: {
    type: String,
    required: [true, 'Specialty is required'],
    trim: true
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  appointmentTime: {
    type: String,
    required: [true, 'Appointment time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
  },
  duration: {
    type: Number,
    default: 30, // minutes
    min: [15, 'Minimum appointment duration is 15 minutes'],
    max: [240, 'Maximum appointment duration is 4 hours']
  },
  type: {
    type: String,
    enum: ['video', 'in_person', 'phone', 'chat'],
    required: [true, 'Appointment type is required']
  },
  communicationMethod: {
    type: String,
    enum: ['phone', 'video', 'chat'],
    default: 'video'
  },
  chatRoomId: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'scheduled', 'accepted', 'confirmed', 'declined', 'rescheduled', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'pending'
  },
  rescheduledDate: {
    type: Date,
    default: null
  },
  rescheduledTime: {
    type: String,
    trim: true,
    default: null
  },
  reason: {
    type: String,
    required: [true, 'Reason for appointment is required'],
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  location: {
    address: String,
    room: String,
    floor: String,
    building: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  videoCall: {
    meetingLink: String,
    meetingId: String,
    password: String
  },
  reminders: {
    email: {
      enabled: { type: Boolean, default: true },
      sent: { type: Boolean, default: false },
      sentAt: Date
    },
    sms: {
      enabled: { type: Boolean, default: false },
      sent: { type: Boolean, default: false },
      sentAt: Date
    },
    push: {
      enabled: { type: Boolean, default: true },
      sent: { type: Boolean, default: false },
      sentAt: Date
    }
  },
  followUp: {
    required: { type: Boolean, default: false },
    scheduledDate: Date,
    notes: String
  },
  prescription: {
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      duration: String,
      instructions: String
    }],
    notes: String
  },
  billing: {
    amount: Number,
    currency: { type: String, default: 'USD' },
    status: {
      type: String,
      enum: ['pending', 'paid', 'cancelled'],
      default: 'pending'
    },
    insuranceCovered: Boolean
  },
  cancellation: {
    cancelledBy: {
      type: String,
      enum: ['patient', 'doctor', 'system']
    },
    reason: String,
    cancelledAt: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
appointmentSchema.index({ userId: 1, appointmentDate: 1 });
appointmentSchema.index({ doctorId: 1, appointmentDate: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ appointmentDate: 1, appointmentTime: 1 });

// Virtual for full appointment datetime
appointmentSchema.virtual('fullDateTime').get(function() {
  const [hours, minutes] = this.appointmentTime.split(':');
  const datetime = new Date(this.appointmentDate);
  datetime.setHours(parseInt(hours), parseInt(minutes));
  return datetime;
});

// Virtual for appointment end time
appointmentSchema.virtual('endDateTime').get(function() {
  const startTime = this.fullDateTime;
  return new Date(startTime.getTime() + (this.duration * 60000));
});

// Virtual to check if appointment is upcoming
appointmentSchema.virtual('isUpcoming').get(function() {
  return this.fullDateTime > new Date() && this.status === 'scheduled';
});

// Static method to get upcoming appointments
appointmentSchema.statics.getUpcomingAppointments = function(userId, limit = 10) {
  return this.find({
    userId,
    appointmentDate: { $gte: new Date() },
    status: { $in: ['scheduled', 'confirmed'] }
  })
  .sort({ appointmentDate: 1, appointmentTime: 1 })
  .limit(limit)
  .populate('doctorId', 'name email phone');
};

// Static method to check for conflicts
appointmentSchema.statics.checkConflict = function(doctorId, appointmentDate, appointmentTime, duration, excludeId = null) {
  const query = {
    doctorId,
    appointmentDate,
    status: { $in: ['scheduled', 'confirmed', 'in_progress'] }
  };
  
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  return this.find(query);
};

module.exports = mongoose.model('Appointment', appointmentSchema);