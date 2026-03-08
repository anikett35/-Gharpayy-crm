const mongoose = require('mongoose')

// Embedded sub-schemas (no separate collections needed in MongoDB)
const visitSchema = new mongoose.Schema({
  property: { type: String, required: true },
  date:     { type: String, required: true },
  time:     { type: String, required: true },
  outcome:  { type: String, enum: ['positive', 'followup', null], default: null },
}, { timestamps: true })

const timelineSchema = new mongoose.Schema({
  action: { type: String, required: true },
}, { timestamps: true })

const leadSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  phone:         { type: String, required: true, trim: true },
  email:         { type: String, trim: true, default: '' },
  source:        { type: String, required: true },
  stage: {
    type: String,
    enum: ['new','contacted','requirement','suggested','visit_scheduled','visit_completed','booked','lost'],
    default: 'new',
  },
  budget:        { type: String, default: '' },
  preferredArea: { type: String, default: '' },
  notes:         { type: String, default: '' },
  reminder:      { type: Boolean, default: false },
  agentId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
  lastActivity:  { type: Date, default: Date.now },

  // Embedded arrays — no JOINs needed, perfect for MongoDB
  visits:   [visitSchema],
  timeline: [timelineSchema],
}, { timestamps: true })

// Index for fast filtering
leadSchema.index({ stage: 1 })
leadSchema.index({ agentId: 1 })
leadSchema.index({ reminder: 1 })
leadSchema.index({ name: 'text', phone: 'text' }) // text search

module.exports = mongoose.model('Lead', leadSchema)
