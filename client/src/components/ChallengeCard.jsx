import { useState } from 'react'
import axios from 'axios'
import socket from '../socket'
import { t } from '../theme'

export default function ChallengeCard({ challenge, solved, onSolved }) {
  const [answer, setAnswer] = useState('')
  const [hint, setHint] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const team = JSON.parse(localStorage.getItem('team') || '{}')
  const token = localStorage.getItem('token')

  const fetchHint = async () => {
    const res = await axios.get(
      `/api/challenges/${challenge._id}/hint`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    setHint(res.data.hint)
  }

  const handleSubmit = async () => {
    if (!answer.trim()) return
    setLoading(true)
    try {
      const res = await axios.post(
        `/api/submissions`,
        { challengeId: challenge._id, answer, hintUsed: !!hint },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setResult(res.data)
      if (res.data.isCorrect) {
        onSolved(challenge._id)
        socket.emit('challengeSolved', { teamId: team.teamId, challengeId: challenge._id })
      }
    } catch (err) {
      setResult({ message: err.response?.data?.message || 'Error' })
    }
    setLoading(false)
  }

  return (
    <div style={{ ...s.card, opacity: solved ? 0.5 : 1,
      borderTop: solved ? `2px solid ${t.green}` : `2px solid ${t.border}` }}>

      {/* Header */}
      <div style={s.header}>
        <div style={s.titleRow}>
          <span style={s.bracket}>[</span>
          <span style={s.title}>{challenge.title}</span>
          <span style={s.bracket}>]</span>
        </div>
        <span style={s.points}>{challenge.points}pts</span>
      </div>

      <div style={s.divider} />

      {/* Description */}
      <pre style={s.desc}>{challenge.description}</pre>

      {solved && (
        <div style={s.solvedBadge}>✓ FLAG_CAPTURED</div>
      )}

      {!solved && (
        <>
          <div style={s.inputRow}>
            <span style={s.prompt}>FLAG:</span>
            <input style={s.input} placeholder="ZERONE{...}"
              value={answer} onChange={e => setAnswer(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>

          {hint && (
            <div style={s.hintBox}>
              <span style={{ color: t.orange }}>HINT: </span>
              <span style={{ color: t.text }}>{hint.text}</span>
              <span style={{ color: t.red }}> (-{hint.cost}pts)</span>
            </div>
          )}

          <div style={s.actions}>
            {!hint && challenge.hint?.text && (
              <button style={s.hintBtn} onClick={fetchHint}>
                REQUEST_HINT
              </button>
            )}
            <button style={{ ...s.submitBtn,
              opacity: loading ? 0.6 : 1 }}
              onClick={handleSubmit} disabled={loading}>
              {loading ? 'SUBMITTING...' : '>> SUBMIT'}
            </button>
          </div>

          {result && (
            <p style={{ color: result.isCorrect ? t.green : t.red,
              fontSize: 12, margin: 0, fontFamily: 'monospace' }}>
              {result.isCorrect ? `✓ CORRECT +${result.pointsAwarded}pts` : `✗ ${result.message}`}
            </p>
          )}
        </>
      )}
    </div>
  )
}

const s = {
  card: { background: t.card, border: `1px solid ${t.border}`,
    borderRadius: 4, padding: 16, display: 'flex', flexDirection: 'column',
    gap: 10, fontFamily: 'monospace' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  titleRow: { display: 'flex', gap: 4, alignItems: 'center' },
  bracket: { color: t.muted, fontSize: 14 },
  title: { color: t.green, fontWeight: 700, fontSize: 13, letterSpacing: 1 },
  points: { color: t.lime, fontSize: 12, fontWeight: 700 },
  divider: { height: 1, background: t.border },
  desc: { color: t.text, fontSize: 12, lineHeight: 1.7, margin: 0,
    whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
  solvedBadge: { color: t.green, fontSize: 12, fontWeight: 700,
    border: `1px solid ${t.green}`, padding: '6px 12px', borderRadius: 2,
    textAlign: 'center', letterSpacing: 2 },
  inputRow: { display: 'flex', alignItems: 'center', gap: 8,
    background: t.surface, border: `1px solid ${t.border}`,
    borderRadius: 2, padding: '8px 12px' },
  prompt: { color: t.green, fontSize: 12, whiteSpace: 'nowrap' },
  input: { background: 'transparent', border: 'none', color: t.text,
    fontSize: 12, outline: 'none', flex: 1, fontFamily: 'monospace' },
  hintBox: { background: t.surface, border: `1px solid ${t.orange}`,
    borderRadius: 2, padding: '8px 12px', fontSize: 12 },
  actions: { display: 'flex', gap: 8 },
  hintBtn: { background: 'transparent', border: `1px solid ${t.orange}`,
    color: t.orange, borderRadius: 2, padding: '7px 14px',
    cursor: 'pointer', fontSize: 11, fontFamily: 'monospace', letterSpacing: 1 },
  submitBtn: { background: t.green, color: t.bg, border: 'none',
    borderRadius: 2, padding: '7px 18px', fontWeight: 900,
    cursor: 'pointer', fontSize: 12, fontFamily: 'monospace', letterSpacing: 1, flex: 1 }
}