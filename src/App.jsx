import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { supabase } from './lib/supabase'
import AuthScreen from './components/AuthScreen'
import DepositScreen from './components/DepositScreen'
import BookScreen from './components/BookScreen'
import AdminDashboard from './components/AdminDashboard'
import InstallBanner from './components/InstallBanner'

function AdminLogin({ onUnlock }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function tryUnlock() {
    if (!code.trim()) return
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchErr } = await supabase
        .from('config')
        .select('value')
        .eq('key', 'admin_code')
        .single()

      if (fetchErr) {
        console.error('Fetch admin_code :', fetchErr)
        setError('Erreur de chargement. Réessaie.')
      } else if (data?.value === code) {
        onUnlock()
      } else {
        setError('Code incorrect')
        setCode('')
      }
    } catch (e) {
      console.error(e)
      setError('Erreur. Réessaie.')
    } finally {
      setLoading(false)
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
          autoFocus
        />
        {error && (
          <p style={{ color: '#e74c3c', fontSize: '0.8rem', marginTop: 8 }}>{error}</p>
        )}
        <button
          className="btn-primary"
          style={{ marginTop: 12 }}
          onClick={tryUnlock}
          disabled={loading || !code.trim()}
        >
          {loading ? '…' : 'Déverrouiller'}
        </button>
      </div>
    </div>
  )
}

function BottomNav({ view, setView, prenom, handleLogout }) {
  return (
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
        style={{
          background: 'transparent',
          color: 'var(--text-muted)',
          fontSize: '0.7rem',
          border: 'none',
          flex: '0 0 32px'
        }}
        onClick={handleLogout}
        title="Se déconnecter"
      >
        {prenom?.charAt(0).toUpperCase()}
      </button>
    </nav>
  )
}

function Router() {
  const { prenom, handleLogout } = useAuth()
  const [view, setView] = useState('deposit')
  const [adminUnlocked, setAdminUnlocked] = useState(false)

  if (!prenom) {
    return (
      <>
        <InstallBanner />
        <AuthScreen />
      </>
    )
  }

  return (
    <>
      <InstallBanner />
      {view === 'deposit' && <DepositScreen />}
      {view === 'book' && <BookScreen />}
      {view === 'admin' && (
        adminUnlocked
          ? <AdminDashboard onUnlockChange={setAdminUnlocked} />
          : <AdminLogin onUnlock={() => setAdminUnlocked(true)} />
      )}
      <BottomNav
        view={view}
        setView={setView}
        prenom={prenom}
        handleLogout={handleLogout}
      />
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