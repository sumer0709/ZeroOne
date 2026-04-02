import { useState } from 'react'
import axios from 'axios'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { t } from '../theme'

export default function Login() {
  const [teamName, setTeamName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isBlocked = searchParams.get('blocked')

  const handleLogin = async () => {
    try {
      const res = await axios.post(`/api/auth/login`, {
        teamName, password
      })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('team', JSON.stringify(res.data.team))
      navigate('/arena')
    } catch (err) {
      const data = err.response?.data
      if (data?.blocked) {
        setError('🚫 Your team has been blocked. Contact the admin to restore access.')
      } else {
        setError(data?.message || 'Login failed')
      }
    }
  }

  return (
    <div style={s.container}>
      {/* Scanline overlay */}
      <div style={s.scanlines} />

      <div style={s.box}>
        <div style={s.topbar}>
          <span style={s.dot} />
          <span style={{ ...s.dot, background: t.orange }} />
          <span style={{ ...s.dot, background: t.green }} />
        </div>

        <p style={s.pre}>{'> INITIALIZING ZERONE CTF...'}</p>
        <h1 style={s.title}>ZER<span style={{ color: t.green }}>0</span>NE</h1>
        <p style={s.subtitle}>GFG ITER — CAPTURE THE FLAG</p>
        <p style={s.subtitle}>{'> AUTHENTICATE TO ENTER'}</p>

        {isBlocked && (
          <p style={s.blocked}>🚫 Team blocked. Contact admin.</p>
        )}

        <div style={s.inputGroup}>
          <span style={s.inputLabel}>TEAM_ID:</span>
          <input style={s.input} placeholder="enter team name..."
            value={teamName} onChange={e => setTeamName(e.target.value)} />
        </div>

        <div style={s.inputGroup}>
          <span style={s.inputLabel}>PASSWD: </span>
          <input style={s.input} type="password" placeholder="enter password..."
            value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        </div>

        {error && <p style={s.error}>{error}</p>}

        <button style={s.button} onClick={handleLogin}>
          {'>> ENTER ARENA'}
        </button>

        <p style={s.footer}>ZERONE CTF v1.0 • GFG ITER • {new Date().getFullYear()}</p>
      </div>
    </div>
  )
}

const s = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center',
    height: '100vh', background: t.bg, fontFamily: 'monospace', position: 'relative' },
  scanlines: { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,65,0.015) 2px, rgba(0,255,65,0.015) 4px)' },
  box: { background: t.surface, border: `1px solid ${t.border}`,
    borderTop: `2px solid ${t.green}`, borderRadius: 4, padding: '32px 36px',
    width: 420, display: 'flex', flexDirection: 'column', gap: 14, zIndex: 1,
    boxShadow: `0 0 40px rgba(0,255,65,0.08)` },
  topbar: { display: 'flex', gap: 6, marginBottom: 4 },
  dot: { width: 10, height: 10, borderRadius: '50%', background: t.red },
  pre: { color: t.muted, fontSize: 11, margin: 0 },
  title: { color: t.text, fontFamily: 'monospace', fontSize: 40,
    textAlign: 'center', margin: 0, letterSpacing: 8, fontWeight: 900 },
  subtitle: { color: t.muted, textAlign: 'center', margin: 0, fontSize: 11, letterSpacing: 3 },
  blocked: { color: t.red, fontSize: 12, background: '#1a0a0a',
    padding: '8px 12px', borderRadius: 4, margin: 0, border: `1px solid ${t.red}` },
  inputGroup: { display: 'flex', alignItems: 'center', gap: 10,
    background: t.card, border: `1px solid ${t.border}`, borderRadius: 4, padding: '10px 14px' },
  inputLabel: { color: t.green, fontSize: 12, whiteSpace: 'nowrap', letterSpacing: 1 },
  input: { background: 'transparent', border: 'none', color: t.text,
    fontSize: 13, outline: 'none', flex: 1, fontFamily: 'monospace' },
  button: { background: 'transparent', border: `1px solid ${t.green}`, color: t.green,
    borderRadius: 4, padding: '12px 0', fontWeight: 700, fontSize: 13,
    cursor: 'pointer', fontFamily: 'monospace', letterSpacing: 2,
    transition: 'all 0.2s', marginTop: 4 },
  error: { color: t.red, fontSize: 12, margin: 0, fontFamily: 'monospace' },
  footer: { color: t.muted, fontSize: 10, textAlign: 'center', margin: 0, letterSpacing: 1 }
}