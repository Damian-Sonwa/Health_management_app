const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly', 'streak', 'milestone', 'special'],
    required: true
  },
  category: {
    type: String,
    enum: ['blood_pressure', 'blood_glucose', 'medication', 'exercise', 'diet', 'general'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: '🏆'
  },
  badgeColor: {
    type: String,
    default: 'gold'
  },
  points: {
    type: Number,
    default: 0
  },
  unlockedAt: {
    type: Date,
    default: Date.now
  },
  criteria: {
    taskType: String,
    targetCount: Number,
    actualCount: Number
  }
}, {
  timestamps: true
});

// Index for faster queries
achievementSchema.index({ userId: 1, type: 1, category: 1 });

module.exports = mongoose.model('Achievement', achievementSchema);

