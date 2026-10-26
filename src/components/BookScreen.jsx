import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import BookEntry from './BookEntry'

export default function BookScreen() {
  const [entries, setEntries] = useState([])
  const [bookClosed, setBookClosed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchEntries = useCallback(async () => {
    // Participants + leurs dépôts (nested select)
    const { data: participants, error: pErr } = await supabase
      .from('participants')
      .select('display_name, deposits(id, photo_url, photo_caption, audio_url, waveform_url, audio_duration_secs, written_text, created_at)')

    if (pErr) {
      console.error('Fetch participants :', pErr)
      setLoading(false)
      return
    }

    // Verrou
    const { data: config } = await supabase
      .from('config')
      .select('value')
      .eq('key', 'book_closed')
    if (config?.[0]) setBookClosed(config[0].value === 'true')

    if (participants) {
      const withDeposits = participants
        .map(p => ({
          name: p.display_name,
          deposits: (p.deposits || []).filter(d =>
            d.photo_url || d.audio_url || d.written_text
          )
        }))
        .filter(p => p.deposits.length > 0)
        .sort((a, b) => a.name.localeCompare(b.name, 'fr'))

      setEntries(withDeposits)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchEntries()
    const interval = setInterval(fetchEntries, 15000)
    return () => clearInterval(interval)
  }, [fetchEntries])

  function handleRefresh() {
    setRefreshing(true)
    fetchEntries().finally(() => setRefreshing(false))
  }

  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '2rem', marginBottom: 8 }}>📖</div>
        Le livre s'ouvre…
      </div>
    )
  }

  return (
    <div style={{ padding: '20px 20px 80px' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-hand)', fontSize: '1.5rem', fontWeight: 400 }}>
          Les 40 ans de Rachel, vus par…
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
          {entries.length} regard{entries.length > 1 ? 's' : ''}
          {bookClosed && ' · 🔒 fermé'}
        </p>
        <button
          className="btn-small"
          style={{ marginTop: 8, background: 'transparent', color: 'var(--accent)', border: 'none' }}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? '…' : '↻ Actualiser'}
        </button>
      </div>

      {entries.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Le livre est vide pour l'instant.<br />
            Sois le premier à y déposer quelque chose.
          </p>
        </div>
      )}

      {entries.map(entry => (
        <BookEntry key={entry.name} name={entry.name} deposits={entry.deposits} />
      ))}

      {entries.length > 0 && (
        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          — Fin du livre —
        </div>
      )}
    </div>
  )
}