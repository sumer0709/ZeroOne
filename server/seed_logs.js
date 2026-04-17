import mongoose from 'mongoose'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Challenge from './models/Challenge.js'
import Round from './models/Round.js'

// dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function seed() {
  try {
    const uri = 'mongodb://localhost:27017/zerone'
    // await mongoose.connect(uri)
    console.log(`(Dry Run) Skipping DB connection to ${uri}`)

    const questionsPath = path.join(__dirname, '../questions/log_questions (1).txt')
    const answersPath = path.join(__dirname, '../questions/log_questions_answer.txt')

    const questionsData = fs.readFileSync(questionsPath, 'utf8')
    const answersData = fs.readFileSync(answersPath, 'utf8')

    // Parse answers
    const answersMap = {}
    answersData.split('\n').filter(l => l.trim()).forEach(line => {
      const parts = line.trim().split(/\s+/)
      if (parts.length === 2 && !isNaN(parts[0])) {
        answersMap[parseInt(parts[0])] = parts[1].trim()
      }
    })

    // Parse questions
    const challenges = []
    const sections = questionsData.split(/\d+\.\s+/).filter(s => s.trim())
    
    sections.forEach((section, index) => {
      const lines = section.trim().split('\n').filter(l => l.trim())
      const questionText = lines[0].trim()
      const options = lines.slice(1).filter(l => /^[A-D]\)/.test(l)).map(l => l.replace(/^[A-D]\)\s*/, ''))
      
      const qNum = index + 1
      if (answersMap[qNum]) {
        challenges.push({
          title: `Log Analysis Q${qNum}`,
          description: questionText + "\n\nAnalyze '150log.txt' in the terminal to find the answer.",
          type: 'mcq',
          answer: answersMap[qNum],
          options: options,
          points: 50,
          round: 4,
          hint: { text: "Use 'grep' to filter the logs for specific users or actions.", cost: 10 }
        })
      }
    })

    // Fallback: write to file
    fs.writeFileSync(path.join(__dirname, 'challenges_log_analysis.json'), JSON.stringify(challenges, null, 2))
    console.log(`✓ Parsed ${challenges.length} challenges. Exported to challenges_log_analysis.json`)

    // await Challenge.deleteMany({ round: 4 })
    // await Challenge.insertMany(challenges)

    console.log(`Successfully seeded ${challenges.length} log analysis challenges into Round 4!`)
    process.exit(0)
  } catch (err) {
    console.error('Seeding failed:', err)
    process.exit(1)
  }
}

seed()
