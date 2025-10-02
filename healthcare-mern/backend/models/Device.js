const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deviceType: {
    type: String,
    required: true
  },
  reading: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Device', deviceSchema);