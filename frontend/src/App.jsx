import { Routes, Route, Navigate } from 'react-router-dom'
import CRM from './components/CRM'

// Simple auth guard — replace with real JWT check
const isLoggedIn = () => !!localStorage.getItem('token')

function PrivateRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />
}

// Minimal login page — wire up to backend /api/auth/login
function LoginPage() {
  const handleLogin = async (e) => {
    e.preventDefault()
    const email    = e.target.email.value
    const password = e.target.password.value
    try {
      // const { data } = await login(email, password)
      // localStorage.setItem('token', data.token)
      // Demo: skip auth and just set a fake token
      localStorage.setItem('token', 'demo-token')
      window.location.href = '/'
    } catch {
      alert('Invalid credentials')
    }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f9fafb' }}>
      <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:36, width:360, boxShadow:'0 4px 24px #0000000e' }}>
        <div style={{ marginBottom:28 }}>
          <div style={{ fontSize:22, fontWeight:800, color:'#111827' }}>Gharpayy CRM</div>
          <div style={{ fontSize:13, color:'#9ca3af', marginTop:4 }}>Sign in to your account</div>
        </div>
        <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:5 }}>Email</label>
            <input name="email" type="email" defaultValue="admin@gharpayy.com"
              style={{ width:'100%', border:'1px solid #e5e7eb', borderRadius:8, padding:'9px 12px', fontSize:13, outline:'none', fontFamily:'inherit' }}/>
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:5 }}>Password</label>
            <input name="password" type="password" defaultValue="password"
              style={{ width:'100%', border:'1px solid #e5e7eb', borderRadius:8, padding:'9px 12px', fontSize:13, outline:'none', fontFamily:'inherit' }}/>
          </div>
          <button type="submit"
            style={{ background:'#2563eb', color:'#fff', border:'none', borderRadius:8, padding:'10px', fontSize:14, fontWeight:600, cursor:'pointer', marginTop:4 }}>
            Sign In
          </button>
        </form>
        <div style={{ marginTop:16, fontSize:11, color:'#d1d5db', textAlign:'center' }}>
          Demo credentials pre-filled — just click Sign In
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={
        <PrivateRoute>
          <CRM />
        </PrivateRoute>
      } />
    </Routes>
  )
}
