const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  level: {
    type: Number,
    default: 1
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastActivityDate: {
    type: Date,
    default: null
  },
  stats: {
    bloodPressureReadings: { type: Number, default: 0 },
    bloodGlucoseReadings: { type: Number, default: 0 },
    medicationsTaken: { type: Number, default: 0 },
    careTasksCompleted: { type: Number, default: 0 },
    appointmentsAttended: { type: Number, default: 0 }
  },
  milestones: [{
    name: String,
    achievedAt: Date,
    points: Number
  }],
  dailyGoals: {
    bloodPressure: { type: Boolean, default: false },
    bloodGlucose: { type: Boolean, default: false },
    medication: { type: Boolean, default: false },
    lastReset: { type: Date, default: Date.now }
  },
  weeklyGoals: {
    completed: { type: Number, default: 0 },
    total: { type: Number, default: 7 },
    lastReset: { type: Date, default: Date.now }
  },
  monthlyGoals: {
    completed: { type: Number, default: 0 },
    total: { type: Number, default: 30 },
    lastReset: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
});

// Calculate level based on points
userProgressSchema.methods.updateLevel = function() {
  const newLevel = Math.floor(this.totalPoints / 100) + 1;
  if (newLevel > this.level) {
    this.level = newLevel;
    return true; // Level up occurred
  }
  return false;
};

// Update streak
userProgressSchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (!this.lastActivityDate) {
    this.currentStreak = 1;
    this.lastActivityDate = today;
    if (this.currentStreak > this.longestStreak) {
      this.longestStreak = this.currentStreak;
    }
    return;
  }
  
  const lastActivity = new Date(this.lastActivityDate);
  lastActivity.setHours(0, 0, 0, 0);
  
  const diffDays = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    // Same day, no change
    return;
  } else if (diffDays === 1) {
    // Consecutive day
    this.currentStreak += 1;
    this.lastActivityDate = today;
  } else {
    // Streak broken
    this.currentStreak = 1;
    this.lastActivityDate = today;
  }
  
  if (this.currentStreak > this.longestStreak) {
    this.longestStreak = this.currentStreak;
  }
};

module.exports = mongoose.model('UserProgress', userProgressSchema);

