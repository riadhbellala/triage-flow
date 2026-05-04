const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  ticketNumber: { type: String, required: true, unique: true },
  name: { type: String, default: 'Anonyme' },
  age: { type: Number, default: 0 },
  sex: { type: String, default: '' },
  status: {
    type: String,
    enum: ['waiting', 'in-triage', 'triaged'],
    default: 'waiting'
  },
  triageLevel: { type: String, default: null },
  esiLevel: { type: Number, default: null },
  category: { type: String, default: null },
  complaint: { type: String, default: null },
  signs: { type: [String], default: [] },
  vitals: {
    fc: { type: Number, default: null },
    pas: { type: Number, default: null },
    spo2: { type: Number, default: null },
    fr: { type: Number, default: null },
    temp: { type: Number, default: null },
    glyc: { type: Number, default: null },
  },
  score: { type: Number, default: 0 },
  degraded: { type: Boolean, default: false },
  originalLevel: { type: String, default: null },
  waitMinutes: { type: Number, default: 0 },
  redFlags: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  triagedAt: { type: Date, default: null },
});

module.exports = mongoose.model('Patient', PatientSchema);
