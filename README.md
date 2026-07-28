# 💬 OnboardX

> **A capacity-aware mentorship agent powered by Gemma 4**  
> Built for the **Build with Gemma: AI for Africa Hackathon — Minna 2026**

OnboardX helps new community members find the right learning track, get matched with an available mentor, and continue learning even when a track is full.

It turns onboarding into a guided chat experience powered by Gemma 4 native function calling and grounded backend logic.

---

## Why it matters

Growing communities often face:
- mentor overload
- repeated “where do I start?” questions
- weak onboarding
- learner drop-off

OnboardX reduces friction by routing users to:
- a live mentor,
- an available alternative track, or
- a downloadable starter pack.

---

## What it does

- WhatsApp-style chat interface
- Tappable track buttons
- Streaming responses for a responsive demo
- Gemma 4 native function calling
- Real mentor capacity checks
- Alternative mentor suggestions when a track is full
- Downloadable starter packs
- Session-aware conversation memory
- Token usage and budget tracking
- Development-only debug panel
- Safe fallback when the AI API is unavailable

---

## How Gemma 4 is used

Gemma 4 helps:
- infer the user’s learning track
- infer beginner or intermediate level
- decide when to call `check_mentor_capacity`
- compose grounded responses based on live backend data

The backend ensures:
- mentors are not invented
- seats are updated correctly
- follow-up messages reuse session context
- model output is cleaned for the plain-text UI

---

## Architecture

```text
Frontend (React + Vite)
        │
        ▼
Express backend
        │
        ▼
Gemma 4 + mentor capacity tool
        │
        ├── success → mentor match
        ├── full    → alternative track / starter pack
        └── fail    → deterministic fallback
```

---

## Supported tracks

Frontend  
Backend  
Project Management  
Cloud Computing  
Data Analytics  
AI / Machine Learning  
Android / Mobile Development  
UI/UX Design  
Cybersecurity  
DevOps / SRE  
IT Support  
Digital Marketing

---

## Run locally

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## API

- `POST /api/chat` — send a message
- `POST /api/chat/stream` — stream a response
- `GET /api/resources/starter-pack` — download a curriculum PDF
- `GET /api/mentors/load` — view mentor capacity
- `GET /api/health` — check service health

---

## Testing ideas

Try these in the app:
- ask for a track as a beginner
- ask for the same track again in a follow-up
- change to a different track mid-conversation
- select a track using the buttons
- try a full track
- test with AI unavailable

---

## Credits

Built by the Gemma Duo Team Two minds. One agent. Built for impact. for the **Build with Gemma: AI for Africa Hackathon — Minna 2026**.
