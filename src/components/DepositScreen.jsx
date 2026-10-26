import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import PhotoUploader from './PhotoUploader'
import VoiceRecorder from './VoiceRecorder'
import TextDeposit from './TextDeposit'

export default function DepositScreen() {
  const { prenom } = useAuth()
  const [photo, setPhoto] = useState(null)
  const [audio, setAudio] = useState(null)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function submit() {
    if (!photo && !audio && !text.trim()) return
    setSubmitting(true)
    try {
      await supabase.from('deposits').insert({
        participant_id: prenom.toLowerCase(),
        photo_url: photo?.url || null,
        photo_caption: photo?.caption || null,
        audio_url: audio?.url || null,
        waveform_url: audio?.waveformUrl || null,
        audio_duration_secs: audio?.duration || null,
        written_text: text.trim() || null,
      })
      setDone(true)
      setTimeout(() => {
        setDone(false)
        setPhoto(null)
        setAudio(null)
        setText('')
      }, 3000)
    } catch (e) {
      console.error('Dépôt échoué :', e)
      alert('Oups, le dépôt n\'a pas passé. Vérifie ta connexion et réessaie.')
    }
    setSubmitting(false)
  }

  if (done) {
    return (
      <div style={{
        minHeight: '60dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24
      }}>
        <div className="card" style={{ textAlign: 'center', width: '100%' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🕊️</div>
          <h2 style={{ fontFamily: 'var(--font-hand)', fontSize: '1.5rem', marginBottom: 8, fontWeight: 400 }}>
            Merci {prenom}.
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>C'est dans le livre.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px 20px 80px' }}>
      <h2 style={{
        fontFamily: 'var(--font-hand)',
        fontSize: '1.6rem',
        marginBottom: 4,
        fontWeight: 400
      }}>
        Vu par <span style={{ color: 'var(--accent)' }}>{prenom}</span>
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 24 }}>
        Ajoute ce qui te vient. Rien n'est obligatoire.
      </p>

      <PhotoUploader onPhoto={setPhoto} />
      <VoiceRecorder onAudio={setAudio} />
      <TextDeposit value={text} onChange={setText} />

      <button
        className="btn-primary"
        onClick={submit}
        disabled={submitting || (!photo && !audio && !text.trim())}
        style={{ marginTop: 8 }}
      >
        {submitting ? 'Dépôt en cours…' : 'Déposer dans le livre'}
      </button>
    </div>
  )
}