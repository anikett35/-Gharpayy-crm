require('dotenv').config()
const express    = require('express')
const cors       = require('cors')
const connectDB  = require('./models/db')
const { startReminderJob } = require('./jobs/reminderJob')

const app  = express()
const PORT = process.env.PORT || 5000

// Connect MongoDB
connectDB()

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'https://your-frontend.vercel.app'] }))
app.use(express.json())

// Routes
app.use('/api/auth',      require('./routes/auth'))
app.use('/api/leads',     require('./routes/leads'))
app.use('/api/agents',    require('./routes/agents'))
app.use('/api/dashboard', require('./routes/dashboard'))

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }))

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`🚀 Gharpayy CRM API running on http://localhost:${PORT}`)
  startReminderJob()
})
