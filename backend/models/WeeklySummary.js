const mongoose = require('mongoose');

const weeklySummarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  weekStartDate: {
    type: Date,
    required: true
  },
  weekEndDate: {
    type: Date,
    required: true
  },
  weekNumber: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  dailyActivities: [{
    date: Date,
    bloodPressureRecorded: { type: Boolean, default: false },
    bloodGlucoseRecorded: { type: Boolean, default: false },
    medicationTaken: { type: Boolean, default: false },
    goalsCompleted: { type: Number, default: 0 },
    points: { type: Number, default: 0 }
  }],
  weeklyStats: {
    totalDaysActive: { type: Number, default: 0 },
    bloodPressureReadings: { type: Number, default: 0 },
    bloodGlucoseReadings: { type: Number, default: 0 },
    medicationDoses: { type: Number, default: 0 },
    appointmentsAttended: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 }
  },
  badges: [{
    name: String,
    description: String,
    icon: String,
    earnedAt: { type: Date, default: Date.now }
  }],
  flowers: {
    count: { type: Number, default: 0 },
    type: { 
      type: String, 
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze'
    }
  },
  achievement: {
    title: String,
    message: String,
    percentage: Number
  },
  isComplete: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
weeklySummarySchema.index({ userId: 1, weekNumber: 1, year: 1 }, { unique: true });

// Method to calculate badges and flowers
weeklySummarySchema.methods.calculateRewards = function() {
  const badges = [];
  let flowerCount = 0;
  let flowerType = 'bronze';
  
  const { weeklyStats } = this;
  const daysActive = weeklyStats.totalDaysActive;
  const completionRate = (daysActive / 7) * 100;
  
  // Consistency Badges
  if (daysActive >= 7) {
    badges.push({
      name: 'Perfect Week',
      description: '7 days of health tracking!',
      icon: '🏆'
    });
    flowerCount = 7;
    flowerType = 'platinum';
  } else if (daysActive >= 5) {
    badges.push({
      name: 'Health Champion',
      description: 'Tracked health for 5+ days!',
      icon: '⭐'
    });
    flowerCount = 5;
    flowerType = 'gold';
  } else if (daysActive >= 3) {
    badges.push({
      name: 'Health Warrior',
      description: 'Tracked health for 3+ days!',
      icon: '💪'
    });
    flowerCount = 3;
    flowerType = 'silver';
  } else if (daysActive >= 1) {
    badges.push({
      name: 'First Steps',
      description: 'Started your health journey!',
      icon: '🌱'
    });
    flowerCount = 1;
    flowerType = 'bronze';
  }
  
  // Activity-specific badges
  if (weeklyStats.bloodPressureReadings >= 7) {
    badges.push({
      name: 'BP Monitor Master',
      description: 'Tracked BP every day!',
      icon: '❤️'
    });
  }
  
  if (weeklyStats.bloodGlucoseReadings >= 7) {
    badges.push({
      name: 'Glucose Guardian',
      description: 'Tracked glucose daily!',
      icon: '🩸'
    });
  }
  
  if (weeklyStats.medicationDoses >= 7) {
    badges.push({
      name: 'Medication Master',
      description: 'Never missed a dose!',
      icon: '💊'
    });
  }
  
  // Set rewards
  this.badges = badges;
  this.flowers = { count: flowerCount, type: flowerType };
  
  // Set achievement message
  if (completionRate === 100) {
    this.achievement = {
      title: 'Perfect Week! 🎉',
      message: 'You tracked your health every single day this week! Amazing dedication!',
      percentage: 100
    };
  } else if (completionRate >= 70) {
    this.achievement = {
      title: 'Excellent Progress! 🌟',
      message: `You tracked your health ${daysActive} out of 7 days. Keep it up!`,
      percentage: completionRate
    };
  } else if (completionRate >= 40) {
    this.achievement = {
      title: 'Good Start! 💪',
      message: `You're on the right track with ${daysActive} active days!`,
      percentage: completionRate
    };
  } else {
    this.achievement = {
      title: 'Let\'s Improve! 🌱',
      message: 'Try to track your health more consistently next week!',
      percentage: completionRate
    };
  }
  
  return { badges, flowers: this.flowers, achievement: this.achievement };
};

module.exports = mongoose.model('WeeklySummary', weeklySummarySchema);

