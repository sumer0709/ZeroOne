import { useEffect, useState } from 'react'
import socket from '../socket'
import { t } from '../theme'

export default function Timer() {
  const [timeLeft, setTimeLeft] = useState(null)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    socket.on('timerStart', ({ endsAt }) => {
      setRunning(true)
      const end = new Date(endsAt).getTime()
      const update = () => {
        const diff = Math.max(0, Math.floor((end - Date.now()) / 1000))
        setTimeLeft(diff)
        if (diff <= 0) setRunning(false)
      }
      update()
      const interval = setInterval(update, 1000)
      socket._timerInterval = interval
    })

    socket.on('timerStop', () => {
      setRunning(false)
      setTimeLeft(null)
      clearInterval(socket._timerInterval)
    })

    return () => {
      socket.off('timerStart')
      socket.off('timerStop')
      clearInterval(socket._timerInterval)
    }
  }, [])

  if (timeLeft === null) {
    return (
      <div style={{ ...s.timer, color: t.muted, fontSize: 18 }}>
        TIMER_IDLE
      </div>
    )
  }

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
  timer: { fontFamily: t.fontMono, fontSize: 26, fontWeight: 900, letterSpacing: 4 },
  warning: { color: t.red, fontSize: 10, letterSpacing: 2, margin: '4px 0 0' }
}