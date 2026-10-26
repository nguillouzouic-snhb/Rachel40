import { useRef, useState, useCallback, useEffect } from 'react'
import WaveSurfer from 'wavesurfer.js'
import { uploadAudio, uploadWaveform } from '../lib/storage'

const MAX_DURATION = 10

export default function VoiceRecorder({ onAudio }) {
  const [isRecording, setIsRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [duration, setDuration] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const wsRef = useRef(null)
  const wsContainerRef = useRef(null)

  // Nettoyer au unmount
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current)
      wsRef.current?.destroy()
    }
  }, [])

  function startRecording() {
    if (isRecording || uploading) return
    setError(null)

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setPreviewUrl(url)

        // Afficher la waveform en live
        if (wsContainerRef.current) {
          if (wsRef.current) wsRef.current.destroy()
          const ws = WaveSurfer.create({
            container: wsContainerRef.current,
            url,
            waveColor: '#d4c5b0',
            progressColor: 'var(--accent)',
            height: 40,
            barWidth: 2,
            barGap: 1,
            barRadius: 2
          })
          wsRef.current = ws
          await ws.load(url)
          setDuration(ws.getDuration())
        }

        // Upload
        setUploading(true)
        try {
          const audioUrl = await uploadAudio(blob)

          // Générer waveform PNG pour l'album papier
          let wfUrl = null
          const canvas = wsContainerRef.current?.querySelector('canvas')
          if (canvas) {
            const exportCanvas = document.createElement('canvas')
            exportCanvas.width = 800
            exportCanvas.height = 60
            const ctx = exportCanvas.getContext('2d')
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, 800, 60)
            ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, 800, 60)
            const pngBlob = await new Promise(r => exportCanvas.toBlob(r, 'image/png'))
            wfUrl = await uploadWaveform(pngBlob)
          }

          onAudio({ url: audioUrl, waveformUrl: wfUrl, duration: wsRef.current?.getDuration() || 10 })
        } catch (e) {
          console.error(e)
          setError('Upload audio échoué. Réessaie.')
        }
        setUploading(false)

        // Libérer le micro
        stream.getTracks().forEach(t => t.stop())
        setIsRecording(false)
      }

      recorder.start(100)
      setIsRecording(true)
      setElapsed(0)
      timerRef.current = setInterval(() => {
        setElapsed(prev => {
          if (prev + 1 >= MAX_DURATION) {
            clearInterval(timerRef.current)
            recorder.stop()
            return MAX_DURATION
          }
          return prev + 1
        })
      }, 1000)
    }).catch(err => {
      setError('Micro refusé. Vérifie les permissions du navigateur.')
      console.error(err)
    })
  }

  function stopRecording() {
    clearInterval(timerRef.current)
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }

  function clear() {
    setPreviewUrl(null)
    setDuration(0)
    setElapsed(0)
    setError(null)
    onAudio(null)
    wsRef.current?.destroy()
    wsRef.current = null
  }

  return (
    <div className="card">
      <div className="section-title">
        Voix <span style={{ textTransform: 'none', fontWeight: 400 }}>({MAX_DURATION}s max)</span>
      </div>

      {!previewUrl && !isRecording && (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <button
            onClick={startRecording}
            disabled={uploading}
            style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'var(--accent)', color: 'white',
              fontSize: '1.5rem', display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center',
              border: 'none'
            }}
          >
            🎤
          </button>
          <p style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Appuie, parle, relâche.
          </p>
        </div>
      )}

      {isRecording && (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <button
            onClick={stopRecording}
            style={{
              width: 64, height: 64, borderRadius: '50%',
              background: '#e74c3c', color: 'white',
              fontSize: '1.5rem', display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center',
              border: 'none'
            }}
          >
            ⏹
          </button>
          <p style={{ marginTop: 8, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {elapsed}s / {MAX_DURATION}s
          </p>
        </div>
      )}

      {previewUrl && (
        <div>
          <div ref={wsContainerRef} style={{ margin: '8px 0', minHeight: 40 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <audio src={previewUrl} controls style={{ flex: 1, height: 40 }} />
            <button
              className="btn-small"
              onClick={clear}
              style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none' }}
            >
              ✕
            </button>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Durée : {duration.toFixed(1)}s
          </p>
        </div>
      )}

      {uploading && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 8 }}>Upload…</p>}
      {error && <p style={{ fontSize: '0.8rem', color: '#e74c3c', marginTop: 8 }}>{error}</p>}
    </div>
  )
}