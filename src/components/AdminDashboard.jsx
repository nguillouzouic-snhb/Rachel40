import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export default function AdminDashboard({ onUnlockChange }) {
  const [stats, setStats] = useState({ installed: 0, deposited: 0 })
  const [participants, setParticipants] = useState([])
  const [bookClosed, setBookClosed] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    const { data: parts } = await supabase.from('participants').select('*')
    const { data: deps } = await supabase.from('deposits').select('participant_id')
    const { data: config } = await supabase
      .from('config').select('value').eq('key', 'book_closed')

    const depositedIds = new Set((deps || []).map(d => d.participant_id))

    if (parts) {
      setStats({
        installed: parts.length,
        deposited: parts.filter(p => depositedIds.has(p.id)).length
      })
      setParticipants(
        parts.map(p => ({
          name: p.display_name,
          hasDeposit: depositedIds.has(p.id)
        })).sort((a, b) => b.hasDeposit - a.hasDeposit)
      )
    }
    if (config?.[0]) setBookClosed(config[0].value === 'true')
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [fetchData])

  async function toggleBookClosed() {
    const newVal = bookClosed ? 'false' : 'true'
    await supabase.from('config').update({ value: newVal }).eq('key', 'book_closed')
    setBookClosed(!bookClosed)
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Chargement…</div>

  return (
    <div style={{ padding: '20px 20px 80px' }}>
      <h2 style={{ fontFamily: 'var(--font-hand)', fontSize: '1.4rem', marginBottom: 16, fontWeight: 400 }}>
        Tableau de bord
      </h2>

      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', fontWeight: 300, color: 'var(--accent)' }}>
          {stats.deposited}
          <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}> / {stats.installed}</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>ont déposé</p>
      </div>

      <div className="card">
        <div className="section-title">Livre</div>
        <p style={{ marginBottom: 12, fontSize: '0.9rem' }}>
          {bookClosed ? '🔒 FERMÉ — plus de dépôts possibles' : '🔓 OUVERT — dépôts actifs'}
        </p>
        <button
          className="btn-primary"
          onClick={toggleBookClosed}
          style={{ background: bookClosed ? '#27ae60' : '#e74c3c' }}
        >
          {bookClosed ? 'Rouvrir le livre' : 'FERMER le livre'}
        </button>
      </div>

      <div className="card">
        <div className="section-title">Participants</div>
        <div style={{ maxHeight: 280, overflowY: 'auto' }}>
          {participants.map(p => (
            <div key={p.name} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '6px 0', borderBottom: '1px solid var(--border)',
              fontSize: '0.9rem'
            }}>
              <span>{p.name}</span>
              <span style={{ color: p.hasDeposit ? 'var(--accent)' : 'var(--text-muted)' }}>
                {p.hasDeposit ? '✓' : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        className="btn-small"
        style={{ background: 'transparent', color: 'var(--text-muted)', width: '100%', marginTop: 16 }}
        onClick={() => onUnlockChange(false)}
      >
        Verrouiller le tableau
      </button>
    </div>
  )
}