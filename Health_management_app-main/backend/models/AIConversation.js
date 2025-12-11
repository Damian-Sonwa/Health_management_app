const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  context: {
    userStats: Object,
    recentReadings: Object,
    mood: String
  }
});

const aiConversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  messages: [messageSchema],
  totalMessages: {
    type: Number,
    default: 0
  },
  lastInteraction: {
    type: Date,
    default: Date.now
  },
  conversationSummary: {
    type: String,
    default: ''
  },
  userMood: {
    type: String,
    enum: ['motivated', 'struggling', 'neutral', 'excited', 'discouraged'],
    default: 'neutral'
  }
}, {
  timestamps: true
});

// Index for faster queries
aiConversationSchema.index({ userId: 1, lastInteraction: -1 });

module.exports = mongoose.model('AIConversation', aiConversationSchema);

