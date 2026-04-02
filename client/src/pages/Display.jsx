import { useEffect, useState } from 'react'
import axios from 'axios'
import socket from '../socket'
import { t } from '../theme'

export default function Display() {
  const [leaderboard, setLeaderboard] = useState([])
  const [time, setTime] = useState(60 * 60)

  const fetch = async () => {
    const res = await axios.get(`/api/leaderboard`)
    setLeaderboard(res.data)
  }

  useEffect(() => {
    fetch()
    socket.on('leaderboardUpdate', (data) => setLeaderboard(data))
const timer = setInterval(() => setTime(t => t > 0 ? t - 1 : 0), 1000)
return () => { socket.off('leaderboardUpdate'); clearInterval(timer) }
  }, [])

  const hrs = String(Math.floor(time / 3600)).padStart(2, '0')
  const mins = String(Math.floor((time % 3600) / 60)).padStart(2, '0')
  const secs = String(time % 60).padStart(2, '0')
  const isLow = time < 300

  return (
    <div style={s.container}>
      <style>{`
        body { margin: 0; background: ${t.bg}; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes slideIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
      `}</style>

      {/* Scanlines */}
      <div style={s.scanlines} />

      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>ZER<span style={{ color: t.green }}>0</span>NE</h1>
          <p style={s.sub}>GFG ITER • CAPTURE THE FLAG • LIVE</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ ...s.timer, color: isLow ? t.red : t.green,
            textShadow: isLow ? `0 0 30px ${t.red}` : `0 0 30px ${t.green}`,
            animation: isLow ? 'pulse 1s infinite' : 'none' }}>
            {hrs}:{mins}:{secs}
          </div>
          <p style={s.timerLabel}>TIME_REMAINING</p>
        </div>
        <div style={s.liveBadge}>
          <span style={s.liveDot} />
          LIVE
        </div>
      </div>

      {/* Table header */}
      <div style={s.tableHeader}>
        <span style={s.thRank}>RANK</span>
        <span style={s.thTeam}>TEAM</span>
        <span style={s.thMembers}>MEMBERS</span>
        <span style={s.thScore}>SCORE</span>
      </div>

      {/* Rows */}
      <div style={s.tableBody}>
        {leaderboard.map((team, i) => (
          <div key={team._id} style={{
            ...s.row,
            borderLeft: i === 0 ? `3px solid ${t.green}` : i === 1 ? `3px solid ${t.orange}` : i === 2 ? `3px solid ${t.lime}` : `3px solid transparent`,
            background: i === 0 ? 'rgba(0,255,65,0.05)' : 'transparent',
            animation: `slideIn 0.4s ease ${i * 0.05}s both`
          }}>
            <span style={{ ...s.rank, color: i === 0 ? t.green : i === 1 ? t.orange : i === 2 ? t.lime : t.muted }}>
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
            </span>
            <span style={{ ...s.name, color: i === 0 ? t.green : t.text }}>
              {team.teamName}
            </span>
            <span style={s.members}>{team.members?.join(' • ')}</span>
            <span style={{ ...s.score, color: i === 0 ? t.green : t.lime }}>
              {team.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const s = {
  container: { minHeight: '100vh', background: t.bg, fontFamily: 'monospace',
    padding: '32px 48px', position: 'relative', overflow: 'hidden' },
  scanlines: { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,65,0.015) 2px, rgba(0,255,65,0.015) 4px)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 40, zIndex: 1, position: 'relative' },
  title: { color: t.text, fontSize: 48, margin: 0, letterSpacing: 10, fontWeight: 900 },
  sub: { color: t.muted, fontSize: 12, margin: '4px 0 0', letterSpacing: 4 },
  timer: { fontSize: 56, fontWeight: 900, letterSpacing: 6 },
  timerLabel: { color: t.muted, fontSize: 10, letterSpacing: 3, margin: '4px 0 0', textAlign: 'center' },
  liveBadge: { display: 'flex', alignItems: 'center', gap: 8,
    color: t.green, fontSize: 13, letterSpacing: 3, border: `1px solid ${t.green}`,
    padding: '8px 16px', borderRadius: 2 },
  liveDot: { width: 8, height: 8, borderRadius: '50%', background: t.green,
    animation: 'pulse 1s infinite', display: 'inline-block' },
  tableHeader: { display: 'grid', gridTemplateColumns: '100px 1fr 1fr 140px',
    padding: '10px 20px', color: t.muted, fontSize: 11, letterSpacing: 3,
    borderBottom: `1px solid ${t.border}`, marginBottom: 8 },
  tableBody: { display: 'flex', flexDirection: 'column', gap: 6, zIndex: 1, position: 'relative' },
  row: { display: 'grid', gridTemplateColumns: '100px 1fr 1fr 140px',
    padding: '18px 20px', borderRadius: 2, alignItems: 'center', transition: 'all 0.3s' },
  thRank: {}, thTeam: {}, thMembers: {}, thScore: { textAlign: 'right' },
  rank: { fontSize: 20 },
  name: { fontSize: 22, fontWeight: 700, letterSpacing: 1 },
  members: { color: t.muted, fontSize: 12 },
  score: { fontSize: 28, fontWeight: 900, textAlign: 'right', letterSpacing: 2 }
}