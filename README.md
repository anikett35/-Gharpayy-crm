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
