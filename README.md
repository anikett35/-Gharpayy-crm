# Gharpayy CRM — MVP

Full-stack Lead Management System for Gharpayy PG accommodations.

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18, Vite, React Router v6   |
| Backend    | Node.js, Express 4                |
| Database   | **MongoDB + Mongoose**            |
| Auth       | JWT + bcrypt                      |
| Jobs       | node-cron (follow-up reminders)   |

## Project Structure

```
gharpayy-crm/
├── frontend/
│   ├── src/
│   │   ├── components/CRM.jsx     ← full UI
│   │   ├── App.jsx                ← routing + login
│   │   ├── api.js                 ← axios API calls
│   │   └── constants.js
│   ├── package.json
│   └── .env.example
│
└── backend/
    ├── src/
    │   ├── models/
    │   │   ├── db.js              ← MongoDB connection
    │   │   ├── Agent.js           ← Mongoose Agent model
    │   │   └── Lead.js            ← Mongoose Lead model (visits + timeline embedded)
    │   ├── routes/
    │   │   ├── auth.js
    │   │   ├── leads.js
    │   │   ├── agents.js
    │   │   └── dashboard.js
    │   ├── middleware/auth.js     ← JWT guard
    │   ├── controllers/
    │   │   └── assignAgent.js     ← workload balancing
    │   ├── jobs/reminderJob.js    ← hourly cron
    │   ├── seed.js                ← sample data
    │   └── index.js               ← Express entry
    ├── package.json
    └── .env.example
```

## Quick Start

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run seed     # load sample data
npm run dev      # http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
npm run dev      # http://localhost:5173
```
