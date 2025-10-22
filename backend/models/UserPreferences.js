const mongoose = require('mongoose');

const userPreferencesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  language: {
    type: String,
    enum: ['en', 'es', 'fr', 'de', 'zh', 'ar', 'hi', 'pt'],
    default: 'en'
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'auto'],
    default: 'light'
  },
  fontSize: {
    type: String,
    enum: ['small', 'medium', 'large', 'extra-large'],
    default: 'medium'
  },
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    reminders: {
      type: Boolean,
      default: true
    }
  },
  privacy: {
    shareHealthData: {
      type: Boolean,
      default: false
    },
    showOnlineStatus: {
      type: Boolean,
      default: true
    },
    allowDataAnalytics: {
      type: Boolean,
      default: true
    }
  },
  accessibility: {
    highContrast: {
      type: Boolean,
      default: false
    },
    largeText: {
      type: Boolean,
      default: false
    },
    screenReader: {
      type: Boolean,
      default: false
    }
  },
  reminderSound: {
    type: String,
    enum: ['bell', 'chime', 'notification', 'gentle', 'urgent', 'silent'],
    default: 'bell'
  },
  timezone: {
    type: String,
    default: 'UTC'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('UserPreferences', userPreferencesSchema);

