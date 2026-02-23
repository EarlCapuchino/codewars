# CodeWords – Fullstack Word-Guessing Game

A multiplayer word-guessing game built with **Express.js** (backend) and **Next.js** (frontend). Players guess letters or full words to uncover a hidden word, with support for up to 5 players, adjustable difficulty, word categories, and a leaderboard.

---

## Architecture

```
codewars/
├── backend/                    # Express.js REST API
│   ├── src/
│   │   ├── config/             # Environment config, fallback word lists
│   │   ├── controllers/        # HTTP request handlers (thin layer)
│   │   ├── errors/             # Custom error classes (AppError hierarchy)
│   │   ├── middleware/         # Error handler, rate limiter, validation, logging
│   │   ├── models/             # Game and Player domain models
│   │   ├── routes/             # Versioned API routes (/api/v1/...)
│   │   ├── services/           # Business logic (GameService, WordService)
│   │   ├── utils/              # Logger utility
│   │   ├── app.js              # Express app setup (middleware stack)
│   │   └── server.js           # Entry point
│   └── .env                    # Environment variables
│
├── frontend/                   # Next.js 14 (App Router) + TypeScript
│   ├── src/
│   │   ├── app/                # Next.js pages and layout
│   │   ├── components/
│   │   │   ├── game/           # Game-specific components (board, keyboard, etc.)
│   │   │   ├── layout/         # Header
│   │   │   ├── leaderboard/    # Leaderboard table
│   │   │   └── ui/             # Reusable primitives (Button, Input, Select, etc.)
│   │   ├── contexts/           # React Context for global game state
│   │   ├── hooks/              # Custom hooks (keyboard listener)
│   │   ├── services/           # API client (axios)
│   │   └── types/              # TypeScript type definitions
│   └── .env.local              # Frontend environment variables
│
└── README.md
```

### Data Flow

```
User Action → React Context (dispatch) → API Service (axios)
                                              ↓
                                      Express Route → Validation Middleware
                                              ↓
                                      Controller → GameService → Game Model
                                              ↓
                                      JSON Response → Context Reducer → UI Update
```

---

## Tech Decisions & Tradeoffs

| Decision | Rationale | Tradeoff |
|---|---|---|
| **In-memory storage** | No database setup needed; fast iteration | Data lost on server restart |
| **Express.js** backend | Mature, minimal, widely understood | Less opinionated than NestJS or Fastify |
| **Next.js 14 App Router** | Modern React with server components, file-based routing | Slightly more complex than plain CRA |
| **React Context** over Redux | Sufficient for single-page game state; less boilerplate | Would need Redux/Zustand for larger state |
| **Datamuse API** for words | Free, no API key, supports topic-based queries | Limited category accuracy; fallback needed |
| **Local word fallback** | Guarantees game works offline or if API fails | Static word list is finite |
| **Tailwind CSS** | Utility-first; rapid styling with consistent design system | Verbose class strings |
| **Joi validation** | Schema-based, expressive, great error messages | Adds dependency vs manual checks |

---

## API Endpoints

Base URL: `http://localhost:8080/api/v1`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/game` | Start a new game |
| `GET` | `/game/:gameId` | Get current game state |
| `POST` | `/game/:gameId/guess` | Submit a guess |
| `GET` | `/leaderboard` | Get leaderboard rankings |
| `DELETE` | `/leaderboard` | Reset leaderboard |

### Create Game – `POST /api/v1/game`

```json
{
  "playerCount": 2,
  "difficulty": "average",
  "category": "animals",
  "players": ["Alice", "Bob"]
}
```

### Make a Guess – `POST /api/v1/game/:gameId/guess`

```json
{
  "guess": "e",
  "playerId": "uuid-of-current-player"
}
```

### Standardized Response Format

All responses follow:

```json
{
  "success": true,
  "data": { ... }
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [{ "field": "guess", "message": "Guess is required" }]
  }
}
```

---

## How to Run

### Prerequisites

- Node.js 18+
- npm

### Backend

```bash
cd backend
npm install
npm run dev       # starts on port 8080
```

### Frontend

```bash
cd frontend
npm install
npm run dev       # starts on port 3000
```

Open **http://localhost:3000** in your browser.

---

## Game Features

- **1–5 players** with turn-based guessing
- **Difficulty levels**: Easy (short words), Average, Hard (long words)
- **Categories**: Animals, Fruits, Food
- **Word length formula**: `baseDifficulty + (playerCount - 1)`
- **6 attempts per player** – eliminated when depleted
- **Virtual keyboard** with color-coded keys (correct/incorrect)
- **Physical keyboard support** – type letters directly
- **Leaderboard** tracking wins, losses, and scores
- **AI word generation** via Datamuse API with local fallback

---

## How to Scale

1. **Persistent storage**: Replace in-memory Map with Redis or PostgreSQL
2. **Real-time multiplayer**: Add WebSocket (Socket.IO) for live turn updates
3. **User accounts**: Add authentication (JWT) for persistent profiles
4. **Horizontal scaling**: Stateless backend + shared Redis store enables multiple instances
5. **CDN for frontend**: Deploy Next.js to Vercel for edge delivery
6. **Word API**: Add more word sources (WordsAPI, GPT-based generation)

---

## Future Improvements

- AI opponent mode (bot guesses using letter frequency analysis)
- Timed rounds for added pressure
- Game history and replay
- Custom word input (host picks the word)
- Achievement system
- Dark/light theme toggle
- Sound effects and haptic feedback
- Room codes for remote multiplayer
