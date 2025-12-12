const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'senderModel'
  },
  senderModel: {
    type: String,
    required: true,
    enum: ['User', 'Doctor']
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'receiverModel'
  },
  receiverModel: {
    type: String,
    required: true,
    enum: ['User', 'Doctor']
  },
  message: {
    type: String,
    required: [true, 'Message cannot be empty'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  senderName: {
    type: String,
    trim: true
  },
  consultationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    index: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    index: true
  },
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicationRequest',
    index: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'voice'],
    default: 'text',
    required: true
  },
  fileUrl: {
    type: String,
    trim: true
  },
  fileName: {
    type: String,
    trim: true
  },
  fileType: {
    type: String,
    trim: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  roomId: {
    type: String,
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// Indexes
chatSchema.index({ roomId: 1, createdAt: -1 });
chatSchema.index({ senderId: 1, receiverId: 1 });
chatSchema.index({ isRead: 1 });

// Static method to get chat room ID
chatSchema.statics.getRoomId = function(userId, doctorId) {
  // Always use smaller ID first to ensure consistent room IDs
  const ids = [userId.toString(), doctorId.toString()].sort();
  return `${ids[0]}_${ids[1]}`;
};

module.exports = mongoose.model('Chat', chatSchema);

