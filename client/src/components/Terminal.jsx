import { useEffect, useRef } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import socket from '../socket'

export default function TerminalComponent() {
  const termRef = useRef(null)
  const xtermRef = useRef(null)
  const inputRef = useRef('')
  const team = JSON.parse(localStorage.getItem('team') || '{}')

  useEffect(() => {
    // Init terminal
    const term = new Terminal({
      cursorBlink: true,
      theme: {
        background: '#020408',
        foreground: '#c8e6f0',
        cursor: '#00f5ff',
        selection: '#0f2a3d',
        black: '#020408',
        green: '#39ff14',
        cyan: '#00f5ff',
        red: '#ff3c6e',
      },
      fontFamily: 'Courier New, monospace',
      fontSize: 14,
      lineHeight: 1.4,
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.open(termRef.current)
    fitAddon.fit()
    xtermRef.current = term

    // Welcome message
    term.writeln('\x1b[36m╔══════════════════════════════════════╗\x1b[0m')
    term.writeln('\x1b[36m║       ZerOne — Secure Terminal       ║\x1b[0m')
    term.writeln('\x1b[36m╚══════════════════════════════════════╝\x1b[0m')
    term.writeln('\x1b[33mAllowed: openssl, base64, grep, awk, cat, ls, wc\x1b[0m')
    term.writeln('\x1b[32mHint: Use "ls" to see available challenge data.\x1b[0m')
    term.writeln('')
    prompt(term)

    // Handle key input
    term.onKey(({ key, domEvent }) => {
      const code = domEvent.keyCode

      if (code === 13) {
        // Enter — execute command
        term.writeln('')
        const cmd = inputRef.current.trim()
        inputRef.current = ''

        if (cmd) {
          socket.emit('terminalCommand', { command: cmd, teamId: team.teamId })
        } else {
          prompt(term)
        }

      } else if (code === 8) {
        // Backspace
        if (inputRef.current.length > 0) {
          inputRef.current = inputRef.current.slice(0, -1)
          term.write('\b \b')
        }

      } else if (code >= 32) {
        // Printable characters
        inputRef.current += key
        term.write(key)
      }
    })

    // Receive output from server
    const handleOutput = ({ output }) => {
      if (output) term.write(output)
      prompt(term)
    }

    socket.on('terminalOutput', handleOutput)

    // Fit on resize
    const handleResize = () => fitAddon.fit()
    window.addEventListener('resize', handleResize)

    return () => {
      socket.off('terminalOutput', handleOutput)
      window.removeEventListener('resize', handleResize)
      term.dispose()
    }
  }, [])

  const prompt = (term) => {
    term.write(`\r\n\x1b[36mzerone@${team.teamName || 'team'}:~$\x1b[0m `)
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.topbar}>
        <span style={styles.dot} />
        <span style={{ ...styles.dot, background: '#f5a623' }} />
        <span style={{ ...styles.dot, background: '#39ff14' }} />
        <span style={styles.termTitle}>ZerOne Terminal</span>
      </div>
      <div ref={termRef} style={styles.term} />
    </div>
  )
}

const styles = {
  wrapper: { display: 'flex', flexDirection: 'column', height: '100%',
    background: '#020408', borderRadius: 10, overflow: 'hidden',
    border: '1px solid #0f2a3d' },
  topbar: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
    background: '#0a1520', borderBottom: '1px solid #0f2a3d' },
  dot: { width: 12, height: 12, borderRadius: '50%', background: '#ff3c6e' },
  termTitle: { color: '#4a6070', fontSize: 12, marginLeft: 8,
    fontFamily: 'monospace', letterSpacing: 2 },
  term: { flex: 1, padding: 8 }
}