const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const agentSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  color:    { type: String, default: '#6366f1' },
  isOnline: { type: Boolean, default: false },
  role:     { type: String, enum: ['ADMIN', 'AGENT'], default: 'AGENT' },
}, { timestamps: true })

// Hash password before save
agentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

// Compare password method
agentSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password)
}

module.exports = mongoose.model('Agent', agentSchema)
