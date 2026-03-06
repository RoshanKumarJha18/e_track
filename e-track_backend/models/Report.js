const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String },
  status: {
    type: String,
    enum: ['new', 'resolved'],
    default: 'new'
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);