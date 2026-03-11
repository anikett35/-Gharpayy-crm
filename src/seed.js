require('dotenv').config()
const mongoose = require('mongoose')
const Agent    = require('./models/Agent')
const Lead     = require('./models/Lead')

async function seed() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('🌱 Connected to MongoDB. Seeding...')

  await Lead.deleteMany()
  await Agent.deleteMany()

  const agents = await Agent.create([
    { name: 'Admin User',   email: 'admin@gharpayy.com',  password: 'password', color: '#2563eb', role: 'ADMIN',  isOnline: true  },
    { name: 'Priya Sharma', email: 'priya@gharpayy.com',  password: 'password', color: '#6366f1', role: 'AGENT',  isOnline: true  },
    { name: 'Rohit Verma',  email: 'rohit@gharpayy.com',  password: 'password', color: '#0ea5e9', role: 'AGENT',  isOnline: true  },
    { name: 'Ananya Iyer',  email: 'ananya@gharpayy.com', password: 'password', color: '#10b981', role: 'AGENT',  isOnline: false },
  ])
  console.log(`✅ ${agents.length} agents created`)

  await Lead.create([
    {
      name:'Arjun Mehta', phone:'9876543210', email:'arjun@gmail.com',
      source:'Website Form', stage:'visit_scheduled', agentId: agents[1]._id,
      budget:'8000-10000', preferredArea:'Koramangala', notes:'Single occupancy, veg preferred',
      visits:[{ property:'Gharpayy Koramangala', date: new Date(Date.now()+2*864e5).toISOString().slice(0,10), time:'11:00' }],
      timeline:[{ action:'Lead captured from Website Form' },{ action:`Auto-assigned to ${agents[1].name}` },{ action:'Visit scheduled' }]
    },
    {
      name:'Sneha Patil', phone:'9123456789', email:'sneha@outlook.com',
      source:'WhatsApp', stage:'requirement', agentId: agents[2]._id,
      budget:'7000-9000', preferredArea:'Indiranagar',
      timeline:[{ action:'Lead captured from WhatsApp' },{ action:`Auto-assigned to ${agents[2].name}` }]
    },
    {
      name:'Kavya Reddy', phone:'9988776655',
      source:'Lead Form', stage:'new', agentId: agents[3]._id,
      budget:'6000-8000', preferredArea:'HSR Layout',
      timeline:[{ action:'Lead captured from Lead Form' },{ action:`Auto-assigned to ${agents[3].name}` }]
    },
    {
      name:'Rahul Nair', phone:'9001122334', email:'rahul@gmail.com',
      source:'Social Media', stage:'booked', agentId: agents[1]._id,
      budget:'9000-12000', preferredArea:'Indiranagar', notes:'Confirmed — Indiranagar unit 4B',
      visits:[{ property:'Gharpayy Indiranagar', date: new Date(Date.now()-3*864e5).toISOString().slice(0,10), time:'14:00', outcome:'positive' }],
      timeline:[{ action:'Lead captured from Social Media' },{ action:'Visit completed — positive' },{ action:'Booking confirmed!' }]
    },
    {
      name:'Divya Krishnan', phone:'9771234567', email:'divya@yahoo.com',
      source:'Phone Call', stage:'lost', agentId: agents[2]._id,
      budget:'5000-7000', preferredArea:'BTM Layout', notes:'Found accommodation elsewhere',
      timeline:[{ action:'Lead captured from Phone Call' },{ action:'Marked as Lost' }]
    },
  ])
  console.log('✅ 5 sample leads created')
  console.log('\n🎉 Seed complete!')
  console.log('Login: admin@gharpayy.com / password')
  await mongoose.disconnect()
}

seed().catch(err => { console.error(err); process.exit(1) })
