const router = require('express').Router()
const Agent  = require('../models/Agent')
const Lead   = require('../models/Lead')
const auth   = require('../middleware/auth')

router.use(auth)

// GET /api/agents  — list all agents with lead stats
router.get('/', async (req, res) => {
  try {
    const agents = await Agent.find().select('-password')
    const withStats = await Promise.all(agents.map(async (a) => {
      const [total, active, booked] = await Promise.all([
        Lead.countDocuments({ agentId: a._id }),
        Lead.countDocuments({ agentId: a._id, stage: { $nin: ['booked','lost'] } }),
        Lead.countDocuments({ agentId: a._id, stage: 'booked' }),
      ])
      return { ...a.toObject(), totalLeads: total, activeLeads: active, booked,
        conversionRate: total ? Math.round(booked / total * 100) : 0 }
    }))
    res.json(withStats)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/agents  — create new agent (admin only)
router.post('/', async (req, res) => {
  try {
    if (req.agent.role !== 'ADMIN')
      return res.status(403).json({ error: 'Admin only' })

    const { name, email, password, color } = req.body
    const agent = await Agent.create({ name, email, password, color: color || '#6366f1' })
    res.status(201).json({ id: agent._id, name: agent.name, email: agent.email, color: agent.color, role: agent.role })
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'Email already exists' })
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/agents/:id/status  — toggle online
router.patch('/:id/status', async (req, res) => {
  try {
    const agent = await Agent.findByIdAndUpdate(
      req.params.id,
      { isOnline: req.body.isOnline },
      { new: true, select: '-password' }
    )
    res.json(agent)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
