import express from 'express'
import Challenge from '../models/Challenge.js'
import Round from '../models/Round.js'
import { authenticate } from '../middleware/authenticate.js'

const router = express.Router()

// Get challenges for active round
router.get('/', authenticate, async (req, res) => {
  try {
    const activeRound = await Round.findOne({ isActive: true })
    if (!activeRound) return res.status(404).json({ message: 'No active round' })

    const challenges = await Challenge.find({ round: activeRound.roundNumber })
      .select('-answer') // never send answer to client

    res.json({ round: activeRound.roundNumber, challenges })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get hint for a challenge (deduction handled at submission)
router.get('/:id/hint', authenticate, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id).select('hint')
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' })
    res.json({ hint: challenge.hint })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Admin: create challenge
router.post('/', async (req, res) => {
  try {
    const challenge = await Challenge.create(req.body)
    res.status(201).json(challenge)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Admin: activate a round
router.post('/round/activate', async (req, res) => {
  try {
    const { roundNumber } = req.body
    await Round.updateMany({}, { isActive: false })
    await Round.findOneAndUpdate(
   { roundNumber },
   { isActive: true, unlockedAt: new Date() },
   { upsert: true, returnDocument: 'after' }
)
    res.json({ message: `Round ${roundNumber} activated` })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})
router.post('/timer/start', async (req, res) => {
  const { durationMinutes } = req.body
  const endsAt = new Date(Date.now() + durationMinutes * 60 * 1000)
  await Round.findOneAndUpdate(
    { isActive: true },
    { timerEndsAt: endsAt, timerStarted: true }
  )
  req.app.get('io').emit('timerStart', { endsAt, durationMinutes })
  res.json({ message: 'Timer started', endsAt })
})

// Stop timer
router.post('/timer/stop', async (req, res) => {
  await Round.findOneAndUpdate(
    { isActive: true },
    { timerStarted: false }
  )
  req.app.get('io').emit('timerStop')
  res.json({ message: 'Timer stopped' })
})

export default router