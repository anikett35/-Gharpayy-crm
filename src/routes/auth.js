const router = require('express').Router()
const jwt    = require('jsonwebtoken')
const Agent  = require('../models/Agent')

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' })

    const agent = await Agent.findOne({ email }).select('+password')
    if (!agent)
      return res.status(401).json({ error: 'Invalid credentials' })

    const valid = await agent.comparePassword(password)
    if (!valid)
      return res.status(401).json({ error: 'Invalid credentials' })

    await Agent.findByIdAndUpdate(agent._id, { isOnline: true })

    const token = jwt.sign(
      { id: agent._id, email: agent.email, role: agent.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    res.json({
      token,
      agent: { id: agent._id, name: agent.name, email: agent.email, role: agent.role, color: agent.color }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  try {
    const header = req.headers.authorization
    if (header && header.startsWith('Bearer ')) {
      const token   = header.split(' ')[1]
      const payload = jwt.verify(token, process.env.JWT_SECRET)
      await Agent.findByIdAndUpdate(payload.id, { isOnline: false })
    }
    res.json({ message: 'Logged out' })
  } catch {
    res.json({ message: 'Logged out' })
  }
})

module.exports = router
