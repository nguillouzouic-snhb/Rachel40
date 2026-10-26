import { useRef, useState } from 'react'
import { uploadPhoto } from '../lib/storage'

export default function PhotoUploader({ onPhoto }) {
  const cameraRef = useRef(null)
  const galleryRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  function handleFile(file) {
    if (!file) return
    setError(null)
    setUploading(true)

    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(file)

    uploadPhoto(file).then(url => {
      onPhoto({ url, caption: caption.trim() })
      setUploading(false)
    }).catch(err => {
      setError('Upload photo échoué : ' + err.message)
      setUploading(false)
    })
  }

  function clear() {
    setPreview(null)
    setCaption('')
    onPhoto(null)
    if (cameraRef.current) cameraRef.current.value = ''
    if (galleryRef.current) galleryRef.current.value = ''
  }

  return (
    <div className="card">
      <div className="section-title">Photo</div>

      {!preview ? (
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-secondary btn-small" onClick={() => cameraRef.current?.click()}>
            📷 Prendre
          </button>
          <button className="btn-secondary btn-small" onClick={() => galleryRef.current?.click()}>
            🖼️ Galerie
          </button>
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden
            onChange={e => handleFile(e.target.files[0])} />
          <input ref={galleryRef} type="file" accept="image/*" hidden
            onChange={e => handleFile(e.target.files[0])} />
        </div>
      ) : (
        <>
          <img src={preview} alt="Aperçu" style={{
            width: '100%', borderRadius: 8, marginTop: 8, maxHeight: 240, objectFit: 'cover'
          }} />
          <input
            style={{ marginTop: 8, fontSize: '0.9rem' }}
            placeholder="Légende (facultatif)"
            value={caption}
            onChange={e => {
              setCaption(e.target.value)
              if (preview) onPhoto({ ...onPhoto, caption: e.target.value })
            }}
          />
          <button
            className="btn-small"
            style={{ marginTop: 8, background: 'transparent', color: 'var(--text-muted)' }}
            onClick={clear}
          >
            ✕ Retirer
          </button>
        </>
      )}

      {uploading && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 8 }}>Upload…</p>}
      {error && <p style={{ fontSize: '0.8rem', color: '#e74c3c', marginTop: 8 }}>{error}</p>}
    </div>
  )
}