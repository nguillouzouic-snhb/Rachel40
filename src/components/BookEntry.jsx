import WaveformPlayer from './WaveformPlayer'

export default function BookEntry({ name, deposits }) {
  return (
    <div className="card" style={{ borderLeft: '3px solid var(--accent)' }}>
      <h3 style={{
        fontFamily: 'var(--font-hand)',
        fontSize: '1.4rem',
        fontWeight: 400,
        marginBottom: 12
      }}>
        {name}
      </h3>

      {deposits.map((d, i) => (
        <div key={d.id} style={{ marginBottom: i < deposits.length - 1 ? 16 : 0 }}>
          {d.photo_url && (
            <div style={{ marginBottom: 8 }}>
              <img
                src={d.photo_url}
                alt={d.photo_caption || 'Photo'}
                style={{ width: '100%', borderRadius: 8, maxHeight: 280, objectFit: 'cover' }}
                loading="lazy"
              />
              {d.photo_caption && (
                <p style={{
                  fontSize: '0.85rem', color: 'var(--text-muted)',
                  marginTop: 4, fontStyle: 'italic', textAlign: 'center'
                }}>
                  {d.photo_caption}
                </p>
              )}
            </div>
          )}

          {d.audio_url && (
            <div style={{ marginBottom: 8 }}>
              <WaveformPlayer src={d.audio_url} duration={d.audio_duration_secs} />
            </div>
          )}

          {d.written_text && (
            <p style={{
              fontFamily: 'var(--font-hand)',
              fontSize: '1.15rem',
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap'
            }}>
              {d.written_text}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}