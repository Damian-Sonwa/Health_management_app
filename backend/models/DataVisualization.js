const mongoose = require('mongoose');

const dataVisualizationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  chartType: {
    type: String,
    enum: ['line', 'bar', 'pie', 'area', 'scatter'],
    required: true
  },
  dataCategory: {
    type: String,
    enum: ['vitals', 'wellness', 'appointments', 'medications', 'goals', 'activity'],
    required: true
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    default: 'monthly'
  },
  dataPoints: [{
    date: {
      type: String,  // Month name or date string
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    label: {
      type: String
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  }],
  aggregatedData: {
    type: Map,
    of: Number
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  }
}, {
  timestamps: true
});

// Index for faster queries
dataVisualizationSchema.index({ userId: 1, dataCategory: 1, period: 1 });
dataVisualizationSchema.index({ validUntil: 1 });

// Method to check if data is still valid
dataVisualizationSchema.methods.isValid = function() {
  return this.validUntil > new Date();
};

module.exports = mongoose.model('DataVisualization', dataVisualizationSchema);

