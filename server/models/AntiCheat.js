import mongoose from 'mongoose'

const antiCheatSchema = new mongoose.Schema({
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  teamName: String,
  type: { type: String, enum: ['tabswitch', 'suspicious_timing', 'identical_answer', 'warning_issued', 'blocked'] },
  challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' },
  detail: String,
  timestamp: { type: Date, default: Date.now }
})

export default mongoose.model('AntiCheat', antiCheatSchema)