import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import socket from '../socket'
import ChallengeCard from '../components/ChallengeCard'
import Sidebar from '../components/Sidebar'
import { useNavigate } from 'react-router-dom'
import TerminalComponent from '../components/Terminal'

export default function Arena() {
  const [challenges, setChallenges] = useState([])
  const [round, setRound] = useState(null)
  const [solvedIds, setSolvedIds] = useState([])
  const [warning, setWarning] = useState(null)
  const [blocked, setBlocked] = useState(false)
  const team = JSON.parse(localStorage.getItem('team') || '{}')
  const token = localStorage.getItem('token')
  const navigate = useNavigate()
  const violationSent = useRef(false)

  const fetchChallenges = async () => {
    try {
      const res = await axios.get(`/api/challenges`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setChallenges(res.data.challenges)
      setRound(res.data.round)
    } catch (err) {
      console.error(err)
    }
  }

  const enterFullscreen = () => {
    document.documentElement.requestFullscreen().catch(err => console.log(err))
  }

  const sendViolation = async () => {
    if (violationSent.current) return
    violationSent.current = true
    try {
      await axios.post(`/api/anticheat/violation`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
    } catch (err) {
      console.error(err)
    }
    violationSent.current = false
  }

  useEffect(() => {
    fetchChallenges()
    enterFullscreen()
    socket.emit('joinTeam', team.teamId)

    socket.on('challengeSolved', ({ challengeId }) => {
      setSolvedIds(prev => [...new Set([...prev, challengeId])])
    })

    // Auto refresh challenges when round activates — no manual refresh needed
    socket.on('roundActivated', () => {
      fetchChallenges()
    })

    const handleVisibility = () => {
      if (document.hidden) sendViolation()
    }

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) sendViolation()
    }

    document.addEventListener('visibilitychange', handleVisibility)
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    socket.on('violationWarning', ({ message }) => {
      setWarning(message)
      setTimeout(() => enterFullscreen(), 500)
    })

    socket.on('forceLogout', () => {
      setBlocked(true)
      setWarning(null)
      setTimeout(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('team')
        navigate('/blocked')  // ← changed from /?blocked=true
      }, 4000)
    })

    return () => {
      socket.off('challengeSolved')
      socket.off('roundActivated')
      socket.off('violationWarning')
      socket.off('forceLogout')
      document.removeEventListener('visibilitychange', handleVisibility)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  return (
    <div style={styles.layout}>

      {warning && (
        <div style={styles.overlay}>
          <div style={styles.warningBox}>
            <p style={styles.warningIcon}>⚠️</p>
            <p style={styles.warningTitle}>VIOLATION WARNING</p>
            <p style={styles.warningText}>{warning}</p>
            <button style={styles.warningBtn} onClick={() => {
              setWarning(null)
              enterFullscreen()
            }}>I Understand</button>
          </div>
        </div>
      )}

      {blocked && (
        <div style={styles.overlay}>
          <div style={{ ...styles.warningBox, borderColor: '#ff3c6e' }}>
            <p style={styles.warningIcon}>🚫</p>
            <p style={{ ...styles.warningTitle, color: '#ff3c6e' }}>TEAM BLOCKED</p>
            <p style={styles.warningText}>
              Your team has been blocked due to repeated violations. Contact the admin to restore access.
            </p>
            <p style={{ color: '#4a6070', fontSize: 13 }}>Logging out in 4 seconds...</p>
          </div>
        </div>
      )}

      {/* Challenges + Terminal side by side */}
      <div style={styles.main}>
        <div style={styles.header}>
          <h2 style={styles.roundTitle}>Round {round}</h2>
          <span style={styles.teamName}>{team.teamName}</span>
        </div>

        <div style={styles.splitLayout}>
          {/* Left — Challenges */}
          <div style={styles.challengesPanel}>
            {challenges.map(c => (
              <ChallengeCard
                key={c._id}
                challenge={c}
                solved={solvedIds.includes(c._id)}
                onSolved={id => setSolvedIds(prev => [...new Set([...prev, id])])}
              />
            ))}
          </div>

          {/* Right — Terminal */}
          <div style={styles.terminalPanel}>
            <TerminalComponent />
          </div>
        </div>
      </div>

      <Sidebar />
    </div>
  )
}

const styles = {
  layout: { display: 'flex', height: '100vh', background: '#020408', overflow: 'hidden' },
  main: { flex: 1, padding: 30, overflowY: 'auto', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  roundTitle: { color: '#00f5ff', fontFamily: 'monospace', fontSize: 22, margin: 0 },
  teamName: { color: '#4a6070', fontSize: 14 },
  splitLayout: { display: 'flex', flexDirection: 'column', gap: 20, flex: 1 },
challengesPanel: { display: 'flex', flexDirection: 'column', gap: 20 },
terminalPanel: { height: 420, minHeight: 380 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(2,4,8,0.95)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  warningBox: { background: '#0a1520', border: '2px solid #f5a623', borderRadius: 12,
    padding: 40, maxWidth: 440, textAlign: 'center', display: 'flex',
    flexDirection: 'column', gap: 16 },
  warningIcon: { fontSize: 48, margin: 0 },
  warningTitle: { color: '#f5a623', fontFamily: 'monospace', fontSize: 22,
    fontWeight: 700, margin: 0, letterSpacing: 3 },
  warningText: { color: '#c8e6f0', fontSize: 15, lineHeight: 1.6, margin: 0 },
  warningBtn: { background: '#f5a623', color: '#020408', border: 'none',
    borderRadius: 8, padding: '12px 0', fontWeight: 700, fontSize: 15, cursor: 'pointer' }
}