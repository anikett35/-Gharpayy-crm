const router = require('express').Router()
const Lead   = require('../models/Lead')
const Agent  = require('../models/Agent')
const auth   = require('../middleware/auth')
const { assignAgent } = require('../controllers/assignAgent')

router.use(auth)

const STAGE_LABELS = {
  new:'New Lead', contacted:'Contacted', requirement:'Req. Collected',
  suggested:'Property Suggested', visit_scheduled:'Visit Scheduled',
  visit_completed:'Visit Completed', booked:'Booked', lost:'Lost'
}

// GET /api/leads
router.get('/', async (req, res) => {
  try {
    const { stage, agentId, search, page = 1, limit = 50 } = req.query
    const filter = {}
    if (stage)   filter.stage   = stage
    if (agentId) filter.agentId = agentId
    if (search)  filter.$text   = { $search: search }

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .populate('agentId', 'name color isOnline')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Lead.countDocuments(filter)
    ])
    res.json({ leads, total, page: Number(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/leads
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, source, budget, preferredArea, notes, agentId } = req.body
    if (!name || !phone || !source)
      return res.status(400).json({ error: 'name, phone and source are required' })

    const assignedId = agentId || await assignAgent()
    const agent      = await Agent.findById(assignedId)

    const lead = await Lead.create({
      name, phone, email, source, budget, preferredArea, notes,
      agentId: assignedId,
      timeline: [
        { action: `Lead captured from ${source}` },
        { action: `Auto-assigned to ${agent.name}` },
      ]
    })
    await lead.populate('agentId', 'name color isOnline')
    res.status(201).json(lead)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/leads/:id
router.get('/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('agentId', 'name color isOnline')
    if (!lead) return res.status(404).json({ error: 'Lead not found' })
    res.json(lead)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/leads/:id
router.patch('/:id', async (req, res) => {
  try {
    const { stage, notes, agentId, reminder, ...rest } = req.body
    const lead = await Lead.findById(req.params.id)
    if (!lead) return res.status(404).json({ error: 'Lead not found' })

    if (stage && stage !== lead.stage) {
      lead.timeline.push({ action: `Stage moved to "${STAGE_LABELS[stage] || stage}"` })
      lead.stage = stage
    }
    if (notes !== undefined && notes !== lead.notes) {
      lead.timeline.push({ action: 'Note updated' })
      lead.notes = notes
    }
    if (agentId)            lead.agentId  = agentId
    if (reminder !== undefined) lead.reminder = reminder
    lead.lastActivity = new Date()

    await lead.save()
    await lead.populate('agentId', 'name color isOnline')
    res.json(lead)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/leads/:id
router.delete('/:id', async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id)
    res.json({ message: 'Lead deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/leads/:id/visits  — schedule a visit
router.post('/:id/visits', async (req, res) => {
  try {
    const { property, date, time } = req.body
    if (!property || !date || !time)
      return res.status(400).json({ error: 'property, date and time required' })

    const lead = await Lead.findById(req.params.id)
    if (!lead) return res.status(404).json({ error: 'Lead not found' })

    lead.visits.push({ property, date, time, outcome: null })
    lead.stage        = 'visit_scheduled'
    lead.reminder     = false
    lead.lastActivity = new Date()
    lead.timeline.push({ action: `Visit scheduled at ${property} on ${date} at ${time}` })

    await lead.save()
    res.status(201).json(lead.visits[lead.visits.length - 1])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/leads/:id/visits/:visitId  — mark outcome
router.patch('/:id/visits/:visitId', async (req, res) => {
  try {
    const { outcome } = req.body
    const lead  = await Lead.findById(req.params.id)
    if (!lead) return res.status(404).json({ error: 'Lead not found' })

    const visit = lead.visits.id(req.params.visitId)
    if (!visit) return res.status(404).json({ error: 'Visit not found' })

    visit.outcome = outcome
    if (outcome === 'positive') lead.stage = 'visit_completed'
    lead.lastActivity = new Date()
    lead.reminder     = false
    lead.timeline.push({ action: `Visit outcome: ${outcome === 'positive' ? 'Positive ✓' : 'Needs follow-up'}` })

    await lead.save()
    res.json(visit)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
