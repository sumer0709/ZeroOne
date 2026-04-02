import { useState } from 'react'
import axios from 'axios'
import { t } from '../theme'

export default function Admin() {
  const [form, setForm] = useState({
    title: '', description: '', type: 'flag', answer: '',
    points: '', round: '', hint: '', hintCost: ''
  })
  const [roundNum, setRoundNum] = useState('')
  const [duration, setDuration] = useState('30')
  const [msg, setMsg] = useState({ text: '', ok: true })
  const [unblockTeam, setUnblockTeam] = useState('')
  const [flags, setFlags] = useState([])
  const [showFlags, setShowFlags] = useState(false)

  const notify = (text, ok = true) => setMsg({ text, ok })

  const handleAdd = async () => {
    try {
      await axios.post(`/api/challenges`, {
        title: form.title, description: form.description,
        type: 'flag', answer: form.answer, options: [],
        points: Number(form.points), round: Number(form.round),
        hint: { text: form.hint, cost: Number(form.hintCost) }
      })
      notify('✓ Challenge added successfully')
      setForm({ title: '', description: '', type: 'flag', answer: '', points: '', round: '', hint: '', hintCost: '' })
    } catch (err) {
      notify(err.response?.data?.message || 'Error adding challenge', false)
    }
  }

  const handleActivateRound = async () => {
    try {
      await axios.post(`/api/challenges/round/activate`, { roundNumber: Number(roundNum) })
      notify(`✓ Round ${roundNum} is now active`)
    } catch {
      notify('Error activating round', false)
    }
  }

  const handleStartTimer = async () => {
    try {
      await axios.post(`/api/challenges/timer/start`, { durationMinutes: Number(duration) })
      notify(`✓ Timer started for ${duration} minutes`)
    } catch {
      notify('Error starting timer', false)
    }
  }

  const handleStopTimer = async () => {
    try {
      await axios.post(`/api/challenges/timer/stop`)
      notify('✓ Timer stopped')
    } catch {
      notify('Error stopping timer', false)
    }
  }

  const handleUnblock = async () => {
    try {
      await axios.post(`/api/anticheat/unblock`, { teamName: unblockTeam })
      notify(`✓ ${unblockTeam} has been unblocked`)
      setUnblockTeam('')
    } catch {
      notify('Error unblocking team', false)
    }
  }

  const fetchFlags = async () => {
    const res = await axios.get(`/api/anticheat`)
    setFlags(res.data)
    setShowFlags(true)
  }

  const Field = ({ label, placeholder, stateKey, type = 'text', big = false }) => (
    <div style={s.fieldWrap}>
      <label style={s.fieldLabel}>{label}</label>
      {big
        ? <textarea style={{ ...s.input, ...s.textarea }} placeholder={placeholder}
            value={form[stateKey]} onChange={e => setForm({ ...form, [stateKey]: e.target.value })} />
        : <input style={s.input} placeholder={placeholder} type={type}
            value={form[stateKey]} onChange={e => setForm({ ...form, [stateKey]: e.target.value })} />
      }
    </div>
  )

  return (
    <div style={s.container}>
      <div style={s.topbar}>
        <span style={s.logo}>ZER<span style={{ color: t.green }}>0</span>NE</span>
        <span style={s.topbarLabel}>ADMIN_PANEL</span>
        <span style={s.live}>● LIVE</span>
      </div>

      <div style={s.body}>

        {/* Left column */}
        <div style={s.col}>

          {/* Round Control + Timer */}
          <div style={s.card}>
            <p style={s.cardTitle}>{'>'} ROUND_CONTROL</p>
            <p style={s.cardSub}>Activate rounds and control the timer</p>

            {/* Activate Round */}
            <div style={s.fieldWrap}>
              <label style={s.fieldLabel}>ROUND NUMBER</label>
              <input style={s.input} type="number" placeholder="e.g. 2"
                value={roundNum} onChange={e => setRoundNum(e.target.value)} />
            </div>
            <button style={s.btnGreen} onClick={handleActivateRound}>
              ▶ ACTIVATE ROUND
            </button>

            <div style={s.divider} />

            {/* Timer */}
            <div style={s.fieldWrap}>
              <label style={s.fieldLabel}>TIMER DURATION (minutes)</label>
              <input style={s.input} type="number" placeholder="e.g. 30"
                value={duration} onChange={e => setDuration(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={s.btnGreen} onClick={handleStartTimer}>
                ▶ START TIMER
              </button>
              <button style={{ ...s.btnOutline, borderColor: t.red, color: t.red }}
                onClick={handleStopTimer}>
                ■ STOP TIMER
              </button>
            </div>
          </div>

          {/* Unblock Team */}
          <div style={s.card}>
            <p style={s.cardTitle}>{'>'} TEAM_UNBLOCK</p>
            <p style={s.cardSub}>Restore access for a blocked team</p>
            <div style={s.fieldWrap}>
              <label style={s.fieldLabel}>TEAM NAME</label>
              <input style={s.input} placeholder="e.g. Team Alpha"
                value={unblockTeam} onChange={e => setUnblockTeam(e.target.value)} />
            </div>
            <button style={s.btnOutline} onClick={handleUnblock}>
              🔓 UNBLOCK TEAM
            </button>
          </div>

          {/* Anti-cheat flags */}
          <div style={s.card}>
            <p style={s.cardTitle}>{'>'} ANTICHEAT_LOGS</p>
            <p style={s.cardSub}>View violation flags from all teams</p>
            <button style={s.btnOutline} onClick={fetchFlags}>
              ⚠ FETCH FLAGS
            </button>
            {showFlags && (
              <div style={s.flagList}>
                {flags.length === 0 && <p style={s.noFlags}>No violations logged</p>}
                {flags.map((f, i) => (
                  <div key={i} style={s.flagRow}>
                    <span style={{ color: t.red, fontSize: 11 }}>[{f.type}]</span>
                    <span style={{ color: t.text, fontSize: 11 }}> {f.teamName}</span>
                    <span style={{ color: t.muted, fontSize: 10 }}> — {new Date(f.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column — Add Challenge */}
        <div style={s.col}>
          <div style={s.card}>
            <p style={s.cardTitle}>{'>'} ADD_CHALLENGE</p>
            <p style={s.cardSub}>Create a new challenge for any round</p>

            <div style={s.twoCol}>
              <Field label="TITLE" placeholder="e.g. Caesar Shift" stateKey="title" />
              <Field label="ROUND" placeholder="1, 2, 3..." stateKey="round" type="number" />
            </div>

            <Field label="DESCRIPTION" placeholder="Challenge description and instructions..."
              stateKey="description" big />

            <div style={s.twoCol}>
              <Field label="ANSWER / FLAG" placeholder="correct answer" stateKey="answer" />
              <Field label="POINTS" placeholder="100" stateKey="points" type="number" />
            </div>

            <div style={s.twoCol}>
              <Field label="HINT TEXT" placeholder="hint to show participants" stateKey="hint" />
              <Field label="HINT COST (pts)" placeholder="20" stateKey="hintCost" type="number" />
            </div>

            <button style={s.btnGreen} onClick={handleAdd}>
              + ADD CHALLENGE
            </button>
          </div>
        </div>
      </div>

      {/* Message bar */}
      {msg.text && (
        <div style={{ ...s.msgBar, borderColor: msg.ok ? t.green : t.red,
          color: msg.ok ? t.green : t.red }}>
          {msg.text}
        </div>
      )}
    </div>
  )
}

const s = {
  container: { background: t.bg, minHeight: '100vh', fontFamily: 'monospace',
    display: 'flex', flexDirection: 'column' },
  topbar: { display: 'flex', alignItems: 'center', gap: 16, padding: '14px 28px',
    background: t.surface, borderBottom: `1px solid ${t.border}` },
  logo: { color: t.text, fontSize: 18, fontWeight: 900, letterSpacing: 6 },
  topbarLabel: { color: t.muted, fontSize: 11, letterSpacing: 3, flex: 1 },
  live: { color: t.green, fontSize: 11, letterSpacing: 2 },
  body: { display: 'flex', gap: 20, padding: 24, flex: 1, alignItems: 'flex-start' },
  col: { display: 'flex', flexDirection: 'column', gap: 20, flex: 1 },
  card: { background: t.surface, border: `1px solid ${t.border}`,
    borderTop: `2px solid ${t.green}`, borderRadius: 4, padding: 24,
    display: 'flex', flexDirection: 'column', gap: 16 },
  cardTitle: { color: t.green, fontSize: 12, fontWeight: 700, letterSpacing: 2, margin: 0 },
  cardSub: { color: t.muted, fontSize: 11, margin: 0 },
  divider: { height: 1, background: t.border, margin: '4px 0' },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: 6, flex: 1 },
  fieldLabel: { color: t.muted, fontSize: 10, letterSpacing: 2 },
  input: { background: t.card, border: `1px solid ${t.border}`, borderRadius: 2,
    padding: '10px 12px', color: t.text, fontSize: 13, outline: 'none',
    fontFamily: 'monospace', width: '100%', boxSizing: 'border-box' },
  textarea: { minHeight: 90, resize: 'vertical' },
  twoCol: { display: 'flex', gap: 12 },
  btnGreen: { background: t.green, color: t.bg, border: 'none', borderRadius: 2,
    padding: '12px 20px', fontWeight: 900, fontSize: 12, cursor: 'pointer',
    fontFamily: 'monospace', letterSpacing: 1 },
  btnOutline: { background: 'transparent', border: `1px solid ${t.green}`,
    color: t.green, borderRadius: 2, padding: '10px 20px', fontWeight: 700,
    fontSize: 12, cursor: 'pointer', fontFamily: 'monospace', letterSpacing: 1 },
  flagList: { display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' },
  flagRow: { padding: '6px 8px', background: t.card, borderRadius: 2 },
  noFlags: { color: t.muted, fontSize: 12, margin: 0 },
  msgBar: { margin: '0 24px 24px', padding: '12px 20px', border: '1px solid',
    borderRadius: 2, fontSize: 13, fontFamily: 'monospace' }
}