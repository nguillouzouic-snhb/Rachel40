import { useRef, useEffect, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'

export default function WaveformPlayer({ src, duration }) {
  const containerRef = useRef(null)
  const wsRef = useRef(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!containerRef.current || !src) return

    const ws = WaveSurfer.create({
      container: containerRef.current,
      url: src,
      waveColor: '#d4c5b0',
      progressColor: '#c4956a',
      height: 32,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      interact: true
    })

    ws.on('play', () => setPlaying(true))
    ws.on('pause', () => setPlaying(false))
    ws.on('finish', () => setPlaying(false))

    wsRef.current = ws
    return () => ws.destroy()
  }, [src])

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
      <button
        onClick={() => {
          if (playing) wsRef.current?.pause()
          else wsRef.current?.play()
        }}
        style={{
          width: 28, height: 28, borderRadius: '50%',
          background: '#c4956a', color: 'white',
          fontSize: '0.7rem', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, border: 'none'
        }}
      >
        {playing ? '❚❚' : '▶'}
      </button>
      <div ref={containerRef} style={{ flex: 1, minHeight: 32 }} />
      {duration && (
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0 }}>
          {Number(duration).toFixed(0)}s
        </span>
      )}
    </div>
  )
}