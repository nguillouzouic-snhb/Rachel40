export default function TextDeposit({ value, onChange }) {
  return (
    <div className="card">
      <div className="section-title">Un mot</div>
      <textarea
        placeholder="Ce que tu lui dis. Un mot, une phrase, un poème. Tout est bon."
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, textAlign: 'right' }}>
        {value.length} caractères
      </p>
    </div>
  )
}