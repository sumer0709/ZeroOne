import { useEffect, useState } from 'react'
import { t } from '../theme'

export default function Timer({ durationMinutes = 60 }) {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => prev <= 0 ? 0 : prev - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const hrs = String(Math.floor(timeLeft / 3600)).padStart(2, '0')
  const mins = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0')
  const secs = String(timeLeft % 60).padStart(2, '0')
  const isLow = timeLeft < 300

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ ...s.timer, color: isLow ? t.red : t.green,
        textShadow: isLow ? `0 0 20px ${t.red}` : `0 0 20px ${t.green}` }}>
        {hrs}:{mins}:{secs}
      </div>
      {isLow && <p style={s.warning}>⚠ TIME CRITICAL</p>}
    </div>
  )
}

const s = {
  timer: { fontFamily: 'monospace', fontSize: 26, fontWeight: 900, letterSpacing: 4 },
  warning: { color: t.red, fontSize: 10, letterSpacing: 2, margin: '4px 0 0', animation: 'pulse 1s infinite' }
}