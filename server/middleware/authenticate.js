import jwt from 'jsonwebtoken'
import Team from '../models/Team.js'

export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'No token provided' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Check if team is blocked on every request
    const team = await Team.findById(decoded.teamId).select('isBlocked')
    if (!team) return res.status(401).json({ message: 'Team not found' })
    if (team.isBlocked) return res.status(403).json({
      message: 'Your team has been blocked. Contact the admin.',
      blocked: true
    })

    req.team = decoded
    next()
  } catch {
    res.status(401).json({ message: 'Invalid token' })
  }
}