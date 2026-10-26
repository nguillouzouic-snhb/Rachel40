import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function AuthScreen() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const { handleLogin } = useAuth()

  async function submit() {
    if (!name.trim()) return
    setLoading(true)
    await handleLogin(name)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '0 24px'
    }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: '4rem', fontWeight: 300, color: 'var(--accent)' }}>40</div>
        <h1 style={{
          fontFamily: 'var(--font-hand)',
          fontSize: '1.8rem',
          fontWeight: 400
        }}>
          Les 40 ans de Rachel
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 12, fontSize: '0.95rem', lineHeight: 1.5 }}>
          Un livre d'or, ouvert toute la journée.<br />
          Ajoute ce qui te vient. Un mot. Une voix. Une photo.
        </p>
      </div>

      <div className="card">
        <label className="section-title">Ton prénom</label>
        <input
          type="text"
          placeholder="Ex : Marie"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          autoFocus
        />
        <button
          className="btn-primary"
          style={{ marginTop: 16 }}
          onClick={submit}
          disabled={loading || !name.trim()}
        >
          {loading ? '…' : 'Entrer dans le livre'}
        </button>
      </div>

      <p style={{
        textAlign: 'center',
        marginTop: 24,
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        Pas de compte. Pas de mot de passe. Juste ton prénom.
      </p>
    </div>
  )
}