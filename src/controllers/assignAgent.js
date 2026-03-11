const Agent = require('../models/Agent')
const Lead  = require('../models/Lead')

/**
 * Auto-assign: pick the online agent with fewest active leads.
 * Falls back to all agents if none are online.
 */
async function assignAgent() {
  let agents = await Agent.find({ isOnline: true })
  if (!agents.length) agents = await Agent.find()
  if (!agents.length) throw new Error('No agents available')

  const counts = await Promise.all(
    agents.map(async (a) => ({
      id:    a._id,
      count: await Lead.countDocuments({ agentId: a._id, stage: { $nin: ['booked','lost'] } })
    }))
  )
  counts.sort((a, b) => a.count - b.count)
  return counts[0].id
}

module.exports = { assignAgent }
