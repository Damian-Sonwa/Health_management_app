const mongoose = require('mongoose');

const vitalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bloodPressure: {
    type: String,
    required: true
  },
  pulse: {
    type: String,
    required: true
  },
  temperature: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Vital', vitalSchema);