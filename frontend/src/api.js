import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auth
export const login = (email, password) => api.post('/auth/login', { email, password })

// Leads
export const getLeads    = (params) => api.get('/leads', { params })
export const createLead  = (data)   => api.post('/leads', data)
export const updateLead  = (id, data) => api.patch(`/leads/${id}`, data)
export const deleteLead  = (id)     => api.delete(`/leads/${id}`)

// Visits
export const createVisit  = (leadId, data) => api.post(`/leads/${leadId}/visits`, data)
export const updateVisit  = (leadId, visitId, data) => api.patch(`/leads/${leadId}/visits/${visitId}`, data)

// Agents
export const getAgents   = () => api.get('/agents')

// Dashboard stats
export const getStats    = () => api.get('/dashboard/stats')

export default api
