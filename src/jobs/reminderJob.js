const cron = require('node-cron')
const Lead = require('../models/Lead')

/**
 * Every hour: flag leads inactive for 24h as reminder = true.
 */
function startReminderJob() {
  cron.schedule('0 * * * *', async () => {
    console.log('[ReminderJob] Checking inactive leads...')
    try {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const result = await Lead.updateMany(
        {
          reminder:     false,
          lastActivity: { $lt: cutoff },
          stage:        { $nin: ['booked', 'lost'] }
        },
        { $set: { reminder: true } }
      )
      if (result.modifiedCount > 0)
        console.log(`[ReminderJob] Flagged ${result.modifiedCount} leads for follow-up`)
    } catch (err) {
      console.error('[ReminderJob] Error:', err.message)
    }
  })
  console.log('[ReminderJob] Scheduled — runs every hour')
}

module.exports = { startReminderJob }
