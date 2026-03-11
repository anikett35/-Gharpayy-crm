<<<<<<< HEAD
# Gharpayy CRM — Backend

Node.js + Express REST API with **MongoDB + Mongoose**.

## Setup

```bash
npm install
cp .env.example .env      # add your MONGO_URI and JWT_SECRET
npm run seed              # seed agents + sample leads
npm run dev               # http://localhost:5000
```

## MongoDB Options

**Local (MongoDB installed):**
```
MONGO_URI=mongodb://localhost:27017/gharpayy_crm
```

**MongoDB Atlas (free cloud — recommended):**
1. Go to https://cloud.mongodb.com → create free cluster
2. Click Connect → get connection string
3. Paste into .env:
```
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/gharpayy_crm
```

## API Endpoints

### Auth
| Method | Path              | Description     |
|--------|-------------------|-----------------|
| POST   | /api/auth/login   | Login → JWT     |
| POST   | /api/auth/logout  | Logout          |

### Leads
| Method | Path                       | Description          |
|--------|----------------------------|----------------------|
| GET    | /api/leads                 | List + filter/search |
| POST   | /api/leads                 | Create + auto-assign |
| GET    | /api/leads/:id             | Single lead          |
| PATCH  | /api/leads/:id             | Update stage/notes   |
| DELETE | /api/leads/:id             | Delete               |
| POST   | /api/leads/:id/visits      | Schedule visit       |
| PATCH  | /api/leads/:id/visits/:vid | Mark outcome         |

### Agents
| Method | Path                    | Description      |
|--------|-------------------------|------------------|
| GET    | /api/agents             | List with stats  |
| POST   | /api/agents             | Create (admin)   |
| PATCH  | /api/agents/:id/status  | Toggle online    |

### Dashboard
| Method | Path                 | Description   |
|--------|----------------------|---------------|
| GET    | /api/dashboard/stats | Summary stats |

## Default Logins (after seed)
- admin@gharpayy.com / password
- priya@gharpayy.com / password
- rohit@gharpayy.com / password
# -Gharpayy-crm
=======
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
>>>>>>> 69101ad973457b618e54b2ba5a83785d609c9c63
