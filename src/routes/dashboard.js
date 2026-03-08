const router = require('express').Router()
const Lead   = require('../models/Lead')
const auth   = require('../middleware/auth')

router.use(auth)

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    const [total, active, booked, lost, visits, reminders, byStage, bySource] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ stage: { $nin: ['booked','lost'] } }),
      Lead.countDocuments({ stage: 'booked' }),
      Lead.countDocuments({ stage: 'lost' }),
      Lead.countDocuments({ stage: { $in: ['visit_scheduled','visit_completed'] } }),
      Lead.countDocuments({ reminder: true, stage: { $nin: ['booked','lost'] } }),

      // Group by stage using MongoDB aggregation
      Lead.aggregate([{ $group: { _id: '$stage', count: { $sum: 1 } } }]),

      // Group by source
      Lead.aggregate([{ $group: { _id: '$source', count: { $sum: 1 } } }]),
    ])

    res.json({
      total, active, booked, lost, visits, reminders,
      conversionRate: total ? Math.round(booked / total * 100) : 0,
      byStage:  byStage.map(r  => ({ stage:  r._id, count: r.count })),
      bySource: bySource.map(r => ({ source: r._id, count: r.count })),
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
