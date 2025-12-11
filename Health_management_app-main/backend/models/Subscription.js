const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  plan: {
    type: String,
    enum: ['free', 'basic', 'premium', 'enterprise'],
    default: 'free',
    required: true
  },
  status: {
    type: String,
    enum: ['trial', 'active', 'cancelled', 'expired', 'suspended'],
    default: 'trial',
    required: true
  },
  billing: {
    interval: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly'
    },
    amount: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    nextBillingDate: Date,
    lastBillingDate: Date
  },
  trial: {
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      default: function() {
        return new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days from now
      }
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  features: {
    maxVitalReadings: {
      type: Number,
      default: 100
    },
    maxMedications: {
      type: Number,
      default: 10
    },
    maxAppointments: {
      type: Number,
      default: 5
    },
    videoConsultations: {
      type: Boolean,
      default: false
    },
    medicationReminders: {
      type: Boolean,
      default: true
    },
    dataExport: {
      type: Boolean,
      default: false
    },
    prioritySupport: {
      type: Boolean,
      default: false
    },
    aiHealthInsights: {
      type: Boolean,
      default: false
    }
  },
  usage: {
    vitalReadings: {
      type: Number,
      default: 0
    },
    medications: {
      type: Number,
      default: 0
    },
    appointments: {
      type: Number,
      default: 0
    },
    lastResetDate: {
      type: Date,
      default: Date.now
    }
  },
  paymentMethod: {
    type: {
      type: String,
      enum: ['card', 'paypal', 'bank_transfer']
    },
    last4: String,
    expiryMonth: Number,
    expiryYear: Number,
    brand: String
  },
  discounts: [{
    code: String,
    percentage: Number,
    amount: Number,
    validUntil: Date,
    appliedAt: Date
  }],
  cancellation: {
    requestedAt: Date,
    effectiveDate: Date,
    reason: String,
    feedback: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ plan: 1, status: 1 });
subscriptionSchema.index({ 'trial.endDate': 1 });

// Virtual for remaining trial days
subscriptionSchema.virtual('remainingTrialDays').get(function() {
  if (!this.trial.isActive || this.status !== 'trial') return 0;
  
  const now = new Date();
  const trialEnd = new Date(this.trial.endDate);
  const diffTime = trialEnd.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
});

// Virtual for subscription value
subscriptionSchema.virtual('monthlyValue').get(function() {
  if (this.billing.interval === 'yearly') {
    return this.billing.amount / 12;
  }
  return this.billing.amount;
});

// Method to check if feature is available
subscriptionSchema.methods.hasFeature = function(featureName) {
  return this.features[featureName] === true;
};

// Method to check usage limits
subscriptionSchema.methods.canUseFeature = function(featureName) {
  const usageKey = featureName.replace('max', '').toLowerCase();
  const currentUsage = this.usage[usageKey] || 0;
  const limit = this.features[`max${featureName.charAt(0).toUpperCase() + featureName.slice(1)}`];
  
  return currentUsage < limit;
};

// Method to increment usage
subscriptionSchema.methods.incrementUsage = function(featureName) {
  const usageKey = featureName.toLowerCase();
  this.usage[usageKey] = (this.usage[usageKey] || 0) + 1;
  return this.save();
};

// Static method to get plan features
subscriptionSchema.statics.getPlanFeatures = function(planName) {
  const planFeatures = {
    free: {
      maxVitalReadings: 50,
      maxMedications: 5,
      maxAppointments: 2,
      videoConsultations: false,
      medicationReminders: true,
      dataExport: false,
      prioritySupport: false,
      aiHealthInsights: false
    },
    basic: {
      maxVitalReadings: 200,
      maxMedications: 15,
      maxAppointments: 10,
      videoConsultations: true,
      medicationReminders: true,
      dataExport: true,
      prioritySupport: false,
      aiHealthInsights: false
    },
    premium: {
      maxVitalReadings: 1000,
      maxMedications: 50,
      maxAppointments: 50,
      videoConsultations: true,
      medicationReminders: true,
      dataExport: true,
      prioritySupport: true,
      aiHealthInsights: true
    }
  };
  
  return planFeatures[planName] || planFeatures.free;
};

module.exports = mongoose.model('Subscription', subscriptionSchema);