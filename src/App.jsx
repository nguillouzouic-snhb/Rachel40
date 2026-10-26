import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import AuthScreen from './components/AuthScreen'
import DepositScreen from './components/DepositScreen'
import BookScreen from './components/BookScreen'
import AdminDashboard from './components/AdminDashboard'
import { supabase } from './lib/supabase'

function AdminLogin({ onUnlock }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState(null)

  async function tryUnlock() {
    const { data } = await supabase
      .from('config')
      .select('value')
      .eq('key', 'admin_code')
      .single()
    if (data?.value === code) {
      onUnlock()
    } else {
      setError('Code incorrect')
      setCode('')
    }
  }

  return (
    <div style={{ padding: '40px 20px 80px' }}>
      <div className="card">
        <p className="section-title">Accès organisateur</p>
        <input
          type="password"
          placeholder="Code"
          value={code}
          onChange={e => { setCode(e.target.value); setError(null) }}
          onKeyDown={e => e.key === 'Enter' && tryUnlock()}
        />
        {error && <p style={{ color: '#e74c3c', fontSize: '0.8rem', marginTop: 8 }}>{error}</p>}
        <button className="btn-primary" style={{ marginTop: 12 }} onClick={tryUnlock}>
          Déverrouiller
        </button>
      </div>
    </div>
  )
}

function Router() {
  const { prenom, handleLogout } = useAuth()
  const [view, setView] = useState('deposit')
  const [adminUnlocked, setAdminUnlocked] = useState(false)

  if (!prenom) return <AuthScreen />

  return (
    <>
      {view === 'deposit' && <DepositScreen />}
      {view === 'book' && <BookScreen />}
      {view === 'admin' && (
        adminUnlocked
          ? <AdminDashboard onUnlockChange={setAdminUnlocked} />
          : <AdminLogin onUnlock={() => setAdminUnlocked(true)} />
      )}

      <nav className="bottom-nav">
        <button
          className={view === 'deposit' ? 'active' : ''}
          onClick={() => setView('deposit')}
        >
          ✍️ Déposer
        </button>
        <button
          className={view === 'book' ? 'active' : ''}
          onClick={() => setView('book')}
        >
          📖 Livre
        </button>
        <button
          className={view === 'admin' ? 'active' : ''}
          onClick={() => setView('admin')}
        >
          ⚙️
        </button>
        <button
          style={{ background: 'transparent', color: 'var(--text-muted)', fontSize: '0.7rem', border: 'none' }}
          onClick={handleLogout}
          title="Se déconnecter"
        >
          {prenom.charAt(0).toUpperCase()}
        </button>
      </nav>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  )
}