const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['medication_reminder', 'appointment_reminder', 'appointment_accepted', 'appointment_declined', 'appointment_rescheduled', 'vital_check', 'goal_reminder', 'system', 'achievement', 'appointment', 'chat', 'video', 'prescription'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  actionUrl: {
    type: String,
    trim: true
  },
  actionLabel: {
    type: String,
    trim: true
  },
  scheduledFor: {
    type: Date,
    default: Date.now
  },
  icon: {
    type: String,
    trim: true
  },
  metadata: {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    },
    medicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medication'
    },
    medicationRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicationRequest'
    },
    vitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vital'
    }
  }
}, {
  timestamps: true
});

// Indexes for faster queries
notificationSchema.index({ userId: 1, isRead: 1, scheduledFor: -1 });
notificationSchema.index({ userId: 1, type: 1 });
notificationSchema.index({ scheduledFor: 1 });

module.exports = mongoose.model('Notification', notificationSchema);

