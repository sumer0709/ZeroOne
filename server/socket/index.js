import { exec } from 'child_process'

const ALLOWED_COMMANDS = [
  /^openssl\s+/,
  /^base64\s+/,
  /^python3\s+-c\s+/,
  /^python3\s+-c\s+/,
  /^python\s+-c\s+/,    // ← add this
  /^echo\s+/,
  /^cat\s+/,
  /^grep\s+/,
  /^awk\s+/,
  /^sort\s+/,
  /^uniq\s+/,
  /^wc\s+/,
  /^ls\s+/,
]

import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const isAllowed = (cmd) => ALLOWED_COMMANDS.some(pattern => pattern.test(cmd.trim()))

export const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    // Team joins their own room
    socket.on('joinTeam', (teamId) => {
      socket.join(teamId)
      console.log(`Socket ${socket.id} joined team room: ${teamId}`)
    })

    // Admin broadcasts round activation
    socket.on('activateRound', (roundNumber) => {
      io.emit('roundActivated', { roundNumber })
    })

    // Sync submission across team's 3 computers
    socket.on('challengeSolved', ({ teamId, challengeId }) => {
      io.to(teamId).emit('challengeSolved', { challengeId })
    })

    // Terminal command execution
    socket.on('terminalCommand', ({ command, teamId }) => {
      // Block empty commands
      if (!command || !command.trim()) {
        socket.emit('terminalOutput', { output: '' })
        return
      }

      // Block disallowed commands
      if (!isAllowed(command)) {
        socket.emit('terminalOutput', {
          output: `\x1b[31mCommand not allowed: ${command.split(' ')[0]}\x1b[0m\r\n`
        })
        return
      }

      // Execute with strict limits
      exec(command, {
        timeout: 5000,
        maxBuffer: 1024 * 10,
        cwd: path.join(__dirname, '../data'),
        shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/sh'
      }, (error, stdout, stderr) => {
        if (error?.killed) {
          socket.emit('terminalOutput', {
            output: `\x1b[31mCommand timed out\x1b[0m\r\n`
          })
          return
        }
        const output = stdout || stderr || ''
        socket.emit('terminalOutput', {
          output: output.replace(/\n/g, '\r\n')
        })
      })
    })
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })
}