import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Team from './models/Team.js'
import Challenge from './models/Challenge.js'
import Round from './models/Round.js'

dotenv.config()

const teams = [
  {
    teamName: 'Team Alpha',
    password: 'alpha123',
    members: ['Alice', 'Bob', 'Charlie']
  },
  {
    teamName: 'Team Beta',
    password: 'beta123',
    members: ['Dave', 'Eve', 'Frank']
  }
]

const challenges = [
  // Round 1 — Cipher Basics
  {
    title: 'Caesar Shift',
    description: 'Decrypt this message: "Khoor Zruog". The key is 3.',
    type: 'flag',
    answer: 'Hello World',
    points: 100,
    round: 1,
    hint: { text: 'Shift each letter back by the key value.', cost: 20 }
  },
  {
    title: 'ROT13 Decode',
    description: 'Decode this ROT13 message: "TrrxsbeTrrxf"',
    type: 'flag',
    answer: 'GeeksforGeeks',
    points: 100,
    round: 1,
    hint: { text: 'ROT13 shifts each letter by 13 positions.', cost: 20 }
  },

  // Round 2 — Encryption & Decryption
  {
    title: 'Base64 Decode',
    description: 'Decode this Base64 string: "WmVyT25l"\nUse the terminal to solve this.',
    type: 'flag',
    answer: 'ZerOne',
    points: 150,
    round: 2,
    hint: { text: 'Use: python -c "import base64; print(base64.b64decode(\'WmVyT25l\').decode())"', cost: 30 }
  },
  {
    title: 'AES Encrypted',
    description: `This message was encrypted using AES-256-CBC with password "zerone2025":
U2FsdGVkX1+6Z3J5kDlzYWJjZGVmZ2g=
Decrypt it using openssl in the terminal.`,
    type: 'flag',
    answer: 'ITER',
    points: 200,
    round: 2,
    hint: { text: 'Use: openssl enc -aes-256-cbc -d -pbkdf2 -pass pass:zerone2025', cost: 50 }
  },

  // Round 3 — RSA
  {
    title: 'RSA Decrypt',
    description: `Given: p=61, q=53, e=17, encrypted message M=2790.
Use RSA decryption to find the original message.
Formula: d = e^-1 mod φ(n), then decrypt: m = M^d mod n
Use the terminal to compute.`,
    type: 'flag',
    answer: '65',
    points: 300,
    round: 3,
    hint: { text: 'φ(n) = (p-1)(q-1). Use python: pow(M, d, n)', cost: 60 }
  },
  {
    title: 'RSA Modulus',
    description: `In RSA, given p=17 and q=19, calculate n (the modulus).
Enter just the number.`,
    type: 'flag',
    answer: '323',
    points: 150,
    round: 3,
    hint: { text: 'n = p * q. Use python -c "print(17 * 19)"', cost: 30 }
  }
]

const rounds = [
  { roundNumber: 1, isActive: true, unlockedAt: new Date() },
  { roundNumber: 2, isActive: false },
  { roundNumber: 3, isActive: false }
]

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await Team.deleteMany()
  await Challenge.deleteMany()
  await Round.deleteMany()

  for (const t of teams) {
    await Team.create(t)
  }
  console.log('✅ Teams seeded')

  await Challenge.insertMany(challenges)
  console.log('✅ Challenges seeded')

  await Round.insertMany(rounds)
  console.log('✅ Rounds seeded')

  console.log('\n--- LOGIN CREDENTIALS ---')
  console.log('Team Alpha → alpha123')
  console.log('Team Beta  → beta123')
  console.log('Admin Panel → /admin')
  console.log('Display Screen → /display')
  console.log('-------------------------\n')

  process.exit()
}).catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})