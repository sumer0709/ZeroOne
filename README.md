# Zerone Frontend Handoff

This project is the backend for a team-based challenge platform. Teams log in, view the currently active round, solve challenges, submit answers, unlock hints, and watch the leaderboard update in real time.

This README is written for a frontend developer so they can understand the product flow and integrate with the backend quickly.

## Product Summary

- Teams are pre-created by an admin.
- A team logs in with `teamName` and `password`.
- The backend returns a JWT token and basic team info.
- Logged-in teams can fetch challenges only for the currently active round.
- A challenge can be a `flag` question or an `mcq`.
- Teams can optionally use a hint. If they solve the challenge after using the hint, the hint cost is deducted from the challenge points.
- Each team can submit only once per challenge.
- The leaderboard is public and sorted by highest score.
- Socket events are used for live updates across devices and for round activation notifications.

## Tech Stack

- Node.js
- Express
- MongoDB + Mongoose
- JWT authentication
- Socket.IO

## Project Structure

```text
server/
  index.js
  middleware/
    authenticate.js
  models/
    Challenge.js
    Round.js
    Submission.js
    Team.js
  routes/
    auth.js
    challenges.js
    submissions.js
    leaderboard.js
  socket/
    index.js
```

## Environment Variables

The backend expects these variables in `server/.env`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

## Running The Backend

From the `server` folder:

```bash
npm install
node index.js
```

The API will run on:

```text
http://localhost:5000
```

## Auth Flow

### Login

Frontend sends:

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "teamName": "Alpha",
  "password": "secret123"
}
```

Success response:

```json
{
  "token": "jwt_token_here",
  "team": {
    "teamId": "6612...",
    "teamName": "Alpha",
    "members": ["A", "B", "C"],
    "score": 0,
    "currentRound": 1
  }
}
```

Store the token on the frontend and send it in:

```http
Authorization: Bearer <token>
```

## API Reference

Base URL:

```text
http://localhost:5000/api
```

### 1. Register Team

Used for admin/pre-creation.

```http
POST /auth/register
```

Body:

```json
{
  "teamName": "Alpha",
  "password": "secret123",
  "members": ["A", "B", "C"]
}
```

Response:

```json
{
  "message": "Team created",
  "teamName": "Alpha"
}
```

### 2. Login

```http
POST /auth/login
```

Body:

```json
{
  "teamName": "Alpha",
  "password": "secret123"
}
```

### 3. Get Active Round Challenges

Protected route.

```http
GET /challenges
Authorization: Bearer <token>
```

Response:

```json
{
  "round": 1,
  "challenges": [
    {
      "_id": "6612...",
      "title": "Decode Me",
      "description": "Find the hidden flag",
      "type": "flag",
      "options": [],
      "points": 100,
      "round": 1,
      "hint": {
        "text": "Check the metadata",
        "cost": 20
      },
      "createdAt": "2026-03-31T00:00:00.000Z",
      "updatedAt": "2026-03-31T00:00:00.000Z"
    }
  ]
}
```

Notes:

- The backend removes the `answer` field before sending challenges to the client.
- If no round is active, the backend returns `404` with `No active round`.

### 4. Get Hint For One Challenge

Protected route.

```http
GET /challenges/:id/hint
Authorization: Bearer <token>
```

Response:

```json
{
  "hint": {
    "text": "Check the metadata",
    "cost": 20
  }
}
```

Frontend note:

- The backend does not deduct points when the hint is fetched.
- Hint deduction happens only when submitting an answer with `hintUsed: true`.

### 5. Submit Answer

Protected route.

```http
POST /submissions
Authorization: Bearer <token>
Content-Type: application/json
```

Body:

```json
{
  "challengeId": "6612...",
  "answer": "flag{test}",
  "hintUsed": true
}
```

Response if correct:

```json
{
  "isCorrect": true,
  "pointsAwarded": 80,
  "message": "Correct!"
}
```

Response if wrong:

```json
{
  "isCorrect": false,
  "pointsAwarded": 0,
  "message": "Wrong answer"
}
```

Important behavior:

- Answer checking is case-insensitive and trims spaces.
- A team can submit only once per challenge.
- If the answer is correct, the team score is increased.
- If the answer is correct and `hintUsed` is `true`, awarded points = `challenge.points - challenge.hint.cost`.

### 6. Get Leaderboard

Public route.

```http
GET /leaderboard
```

Response:

```json
[
  {
    "_id": "6612...",
    "teamName": "Alpha",
    "score": 180,
    "members": ["A", "B", "C"]
  }
]
```

## Socket.IO Events

Socket server uses the same backend host.

Example frontend connection:

```js
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");
```

### Client emits

#### `joinTeam`

Use after login so all devices for the same team stay synced.

```js
socket.emit("joinTeam", teamId);
```

#### `challengeSolved`

Use when one device solves a challenge and other devices for the same team should reflect it.

```js
socket.emit("challengeSolved", {
  teamId,
  challengeId
});
```

#### `activateRound`

Likely for admin UI.

```js
socket.emit("activateRound", 2);
```

### Client listens

#### `roundActivated`

```js
socket.on("roundActivated", ({ roundNumber }) => {
  // refresh challenge list or show round unlocked UI
});
```

#### `challengeSolved`

```js
socket.on("challengeSolved", ({ challengeId }) => {
  // disable that challenge or mark it solved in the UI
});
```

#### `scoreUpdate`

Emitted by the server after every submission.

```js
socket.on("scoreUpdate", () => {
  // refetch leaderboard
});
```

## Mongo Data Shapes

### Team

```json
{
  "_id": "ObjectId",
  "teamName": "Alpha",
  "password": "hashed_password",
  "members": ["A", "B", "C"],
  "score": 0,
  "currentRound": 1
}
```

### Challenge

```json
{
  "_id": "ObjectId",
  "title": "Challenge title",
  "description": "Challenge description",
  "type": "flag",
  "answer": "correct_answer",
  "options": [],
  "points": 100,
  "round": 1,
  "hint": {
    "text": "Useful clue",
    "cost": 20
  }
}
```

### Submission

```json
{
  "_id": "ObjectId",
  "teamId": "ObjectId",
  "challengeId": "ObjectId",
  "isCorrect": true,
  "hintUsed": true,
  "pointsAwarded": 80,
  "submittedAt": "2026-03-31T00:00:00.000Z"
}
```

### Round

```json
{
  "_id": "ObjectId",
  "roundNumber": 1,
  "isActive": true,
  "unlockedAt": "2026-03-31T00:00:00.000Z"
}
```

## Suggested Frontend Screens

These are the main UI pieces the frontend should build:

### 1. Login Page

- Inputs: `teamName`, `password`
- On success: save token and team info
- After login: connect socket and emit `joinTeam`

### 2. Dashboard

- Show team name
- Show team members
- Show current score
- Show active round number

### 3. Challenge List

- Fetch `/api/challenges`
- Show title, description, type, points
- If `type === "mcq"`, render options
- If `type === "flag"`, render answer input

### 4. Challenge Details / Solve Panel

- Show hint button
- Show hint cost clearly before using it
- Track whether the user used the hint
- Submit answer once
- Disable input after a submission

### 5. Leaderboard

- Fetch `/api/leaderboard`
- Sort is already handled by the backend
- Refresh when `scoreUpdate` is received

### 6. Round Activation Banner

- Listen for `roundActivated`
- Show toast/modal/banner
- Refetch challenge data

## Frontend Integration Notes

- Protected routes need `Authorization: Bearer <token>`.
- There is no logout endpoint right now. Frontend can logout by clearing local storage/state.
- The leaderboard route is public.
- The challenge answer is never sent to the frontend.
- Duplicate submissions return `400` with `Already submitted`.
- Wrong answers still count as a submission, so the UI should warn users before they submit.

## Admin/Backend-Only Routes

These routes exist but are currently open unless you add admin auth:

- `POST /api/auth/register`
- `POST /api/challenges`
- `POST /api/challenges/round/activate`

If you build an admin frontend later, these are the routes it would use.

## Good Frontend UX Ideas

- Show a clear "hint will cost X points" confirmation.
- Mark solved challenges visually.
- Prevent repeat submissions in the UI.
- Use toasts for `Correct!`, `Wrong answer`, and `Round activated`.
- Auto-refresh leaderboard on socket update instead of polling.
- Keep a team session alive in local storage until logout/token expiry.

## Current Limitations To Be Aware Of

- No admin authentication is implemented yet.
- No endpoint currently returns a team's past submissions.
- No server-side timer/countdown exists yet for rounds.
- `currentRound` exists on the team model but active challenges are actually controlled by the `Round` collection.

## Quick Frontend Checklist

- Login screen
- Token storage
- Axios/fetch wrapper with auth header
- Challenges page
- Hint flow
- Answer submission flow
- Leaderboard page
- Socket connection
- Round activation listener
- Solved-state syncing across team devices

If needed, this README can be expanded later into a proper API spec or Postman collection.
