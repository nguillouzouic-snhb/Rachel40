import { useState, useEffect } from 'react'

export default function InstallBanner() {
  const [show, setShow] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // 1. Déjà installée ? → ne rien afficher
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true
    if (standalone) {
      setIsStandalone(true)
      return
    }

    // 2. Déjà masqué par l'utilisateur ?
    if (localStorage.getItem('rachel40_install_dismissed')) return

    // 3. Est-ce un mobile ?
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
      .test(navigator.userAgent)
      || (navigator.maxTouchPoints > 2 && /Mac/.test(navigator.userAgent)) // iPad
    if (!isMobile) return

    // 4. iOS ?
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent))

    // 5. Android : écouter beforeinstallprompt
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // 6. iOS / Android sans event → afficher quand même après 3s
    const fallbackTimer = setTimeout(() => {
      if (!deferredPrompt) {
        setIsIOS(true) // si pas de beforeinstallprompt, on traite comme iOS
        setShow(true)
      }
    }, 3000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      clearTimeout(fallbackTimer)
    }
  }, [])

  function install() {
    if (deferredPrompt) {
      // Android : déclencher la dialog native
      deferredPrompt.prompt()
      deferredPrompt.userChoice.then(() => {
        setShow(false)
        localStorage.setItem('rachel40_install_dismissed', '1')
      })
    } else {
      // iOS : on ne peut pas, on montre les instructions
      setShow(false)
      setIOSInstructions(true)
    }
  }

  function dismiss() {
    setShow(false)
    localStorage.setItem('rachel40_install_dismissed', '1')
  }

  // Overlay iOS instructions
  const [showIOSHelp, setShowIOSHelp] = useState(false)

  if (isStandalone || !show) return null

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 480px,
        background: 'var(--accent)',
        color: 'white',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        zIndex: 200,
        fontSize: '0.85rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}>
        <span>📲 Installer pour une meilleure expérience</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={install}
            style={{
              background: 'white',
              color: 'var(--accent)',
              padding: '6px 12px',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: '0.8rem',
              border: 'none'
            }}
          >
            Installer
          </button>
          <button
            onClick={dismiss}
            style={{
              background: 'transparent',
              color: 'rgba(255,255,255,0.8)',
              padding: '6px 8px',
              border: 'none',
              fontSize: '0.8rem'
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Décalage du contenu pour pas cacher le bandeau */}
      <div style={{ height: 48 }} />

      {/* Overlay instructions iOS */}
      {showIOSHelp && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 300,
          padding: 24
        }} onClick={() => setShowIOSHelp(false)}>
          <div className="card" style={{ maxWidth: 320, padding: 24 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-hand)', fontSize: '1.3rem', marginBottom: 12, fontWeight: 400 }}>
              Installer sur iPhone
            </h3>
            <ol style={{ fontSize: '0.9rem', lineHeight: 2, paddingLeft: 20, color: 'var(--text)' }}>
              <li>Appuie sur <strong>Partager</strong> <span style={{ fontSize: '1.2rem' }}>⎋</span> (en bas)</li>
              <li>Fais défiler → <strong>Ajouter à l'écran d'accueil</strong></li>
              <li>Confirme avec <strong>Ajouter</strong></li>
            </ol>
            <button
              className="btn-primary"
              style={{ marginTop: 16 }}
              onClick={() => setShowIOSHelp(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  )
}