import { useEffect, useState } from 'react'
import axios from 'axios'
import Timer from './Timer'
import socket from '../socket'
import { t } from '../theme'

export default function Sidebar() {
  const [leaderboard, setLeaderboard] = useState([])
  const team = JSON.parse(localStorage.getItem('team') || '{}')

  const fetchLeaderboard = async () => {
    const res = await axios.get(`/api/leaderboard`)
    setLeaderboard(res.data)
  }

  useEffect(() => {
    fetchLeaderboard()
    socket.on('leaderboardUpdate', (data) => setLeaderboard(data))
    return () => socket.off('leaderboardUpdate')
  }, [])

  const myScore = leaderboard.find(t => t.teamName === team.teamName)?.score ?? 0
  const myRank = leaderboard.findIndex(t => t.teamName === team.teamName) + 1

  return (
    <div style={s.sidebar}>
      {/* Timer */}
      <div style={s.block}>
        <p style={s.label}>{'> TIME_REMAINING'}</p>
        <Timer />
      </div>

      {/* Team status */}
      <div style={s.block}>
        <p style={s.label}>{'> TEAM_STATUS'}</p>
        <p style={s.teamName}>{team.teamName}</p>
        <div style={s.statsRow}>
          <div style={s.stat}>
            <span style={s.statVal}>{myScore}</span>
            <span style={s.statKey}>SCORE</span>
          </div>
          <div style={s.stat}>
            <span style={s.statVal}>#{myRank}</span>
            <span style={s.statKey}>RANK</span>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div style={{ ...s.block, flex: 1, overflow: 'hidden' }}>
        <p style={s.label}>{'> LEADERBOARD • LIVE'}</p>
        <div style={s.lbList}>
          {leaderboard.map((tm, i) => (
            <div key={tm._id} style={{
              ...s.row,
              background: tm.teamName === team.teamName ? 'rgba(0,255,65,0.06)' : 'transparent',
              borderLeft: tm.teamName === team.teamName ? `2px solid ${t.green}` : '2px solid transparent'
            }}>
              <span style={{ ...s.rank, color: i === 0 ? t.green : i === 1 ? t.orange : t.muted }}>
                {i === 0 ? '01' : i === 1 ? '02' : i === 2 ? '03' : `${String(i + 1).padStart(2, '0')}`}
              </span>
              <span style={{ ...s.name, color: tm.teamName === team.teamName ? t.green : t.text }}>
                {tm.teamName}
              </span>
              <span style={s.pts}>{tm.score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const s = {
  sidebar: { width: 240, background: t.surface, borderLeft: `1px solid ${t.border}`,
    height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'monospace',
    overflow: 'hidden' },
  block: { padding: '16px', borderBottom: `1px solid ${t.border}` },
  label: { color: t.green, fontSize: 10, letterSpacing: 2, margin: '0 0 10px', opacity: 0.7 },
  teamName: { color: t.text, fontSize: 14, fontWeight: 700, margin: '0 0 10px' },
  statsRow: { display: 'flex', gap: 16 },
  stat: { display: 'flex', flexDirection: 'column', gap: 2 },
  statVal: { color: t.green, fontSize: 22, fontWeight: 900 },
  statKey: { color: t.muted, fontSize: 9, letterSpacing: 2 },
  lbList: { display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto', maxHeight: 400 },
  row: { display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 2 },
  rank: { fontSize: 11, width: 20, fontWeight: 700 },
  name: { fontSize: 12, flex: 1 },
  pts: { color: t.green, fontSize: 12, fontWeight: 700 }
}