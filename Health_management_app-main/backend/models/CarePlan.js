const mongoose = require('mongoose');

const carePlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['medication', 'exercise', 'diet', 'therapy', 'monitoring', 'lifestyle', 'treatment', 'other'],
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  goals: [{
    goal: {
      type: String,
      required: true
    },
    targetDate: Date,
    achieved: {
      type: Boolean,
      default: false
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  }],
  tasks: [{
    task: {
      type: String,
      required: true
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'as-needed'],
      default: 'daily'
    },
    time: String,
    completed: {
      type: Boolean,
      default: false
    },
    dueDate: Date
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Caregiver'
  },
  createdBy: {
    name: String,
    role: String
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  notes: {
    type: String,
    trim: true
  },
  reminders: [{
    message: String,
    time: String,
    enabled: {
      type: Boolean,
      default: true
    }
  }]
}, {
  timestamps: true
});

// Index for faster queries
carePlanSchema.index({ userId: 1, status: 1 });
carePlanSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model('CarePlan', carePlanSchema);

