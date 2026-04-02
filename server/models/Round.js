import mongoose from 'mongoose'

const roundSchema = new mongoose.Schema({
  roundNumber: { type: Number, required: true, unique: true },
  isActive: { type: Boolean, default: false },
  unlockedAt: { type: Date },
  timerEndsAt: { type: Date, default: null },
  timerStarted: { type: Boolean, default: false }
}, { timestamps: true })

export default mongoose.model('Round', roundSchema)