import express from 'express'
import AntiCheat from '../models/AntiCheat.js'
import Submission from '../models/Submission.js'
import Team from '../models/Team.js'
import { authenticate } from '../middleware/authenticate.js'

const router = express.Router()

// Called when tab switch or fullscreen exit detected
router.post('/violation', authenticate, async (req, res) => {
  const teamId = req.team.teamId
  const team = await Team.findById(teamId)

  if (team.warningIssued) {
    await Team.findByIdAndUpdate(teamId, { isBlocked: true })

    await AntiCheat.create({
      teamId,
      teamName: team.teamName,
      type: 'blocked',
      detail: 'Team blocked after second violation'
    })

    req.app.get('io').to(teamId.toString()).emit('forceLogout', {
      message: 'Your team has been blocked due to repeated violations.'
    })

    return res.json({ action: 'blocked' })
  } else {
    await Team.findByIdAndUpdate(teamId, { warningIssued: true })

    await AntiCheat.create({
      teamId,
      teamName: team.teamName,
      type: 'warning_issued',
      detail: 'First violation warning issued'
    })

    req.app.get('io').to(teamId.toString()).emit('violationWarning', {
      message: '⚠️ Warning: Tab switching or exiting fullscreen is not allowed. Next violation will block your entire team.'
    })

    return res.json({ action: 'warning' })
  }
})

// Admin: unblock a team
router.post('/unblock', async (req, res) => {
  try {
    const { teamName } = req.body
    await Team.findOneAndUpdate(
      { teamName },
      { isBlocked: false, warningIssued: false }
    )
    res.json({ message: `${teamName} has been unblocked` })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Check suspicious timing — called after every correct submission
export const checkSuspiciousTiming = async (teamId, challengeId) => {
  const recentCorrect = await Submission.find({
    challengeId,
    isCorrect: true,
    submittedAt: { $gte: new Date(Date.now() - 30000) }
  })

  if (recentCorrect.length >= 2) {
    for (const sub of recentCorrect) {
      await AntiCheat.create({
        teamId: sub.teamId,
        type: 'suspicious_timing',
        challengeId,
        detail: `${recentCorrect.length} teams solved within 30 seconds`
      })
    }
  }
}

// Admin: view all flags
router.get('/', async (req, res) => {
  try {
    const flags = await AntiCheat.find().sort({ timestamp: -1 })
    res.json(flags)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router