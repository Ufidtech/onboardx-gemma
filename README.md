# 💬 OnboardX

> **A Gemma 4-powered community continuity and learning support agent**  
> Built for the **Build with Gemma: AI for Africa Hackathon — Minna 2026**

OnboardX helps community members stay supported between events by matching them with mentors, guiding them to the right learning track, and keeping the conversation going when a track is full.

It is designed for real communities where support is not limited to beginners. Some people are just getting started, some are already intermediate, and some want to mentor, contribute, or support others. OnboardX gives all of them a lightweight conversational path forward.

---

## Why it matters

In many communities, energy is high during hackathons, workshops, and onboarding events, but momentum drops afterward.

People often:

- do not know where to start
- lose access to support after events end
- need a mentor but cannot find one immediately
- want to contribute, but do not know how
- stop showing up when guidance disappears

OnboardX bridges that gap by keeping support available through a simple chat experience powered by Gemma 4.

---

## What it does

- WhatsApp-style chat interface
- Community continuity framing for learners and contributors
- Tappable track buttons
- Streaming responses for a responsive demo
- Gemma 4 native function calling
- Real mentor capacity checks
- Alternative mentor suggestions when a track is full
- Downloadable starter packs
- Session-aware conversation memory
- Learner/contributor intent support
- Token usage and budget tracking
- Development-only debug panel
- Safe fallback when the AI API is unavailable

---

## How Gemma 4 is used

Gemma 4 helps:

- infer the user’s learning track
- infer beginner or intermediate level
- recognize contributor intent when the user wants to help others
- decide when to call `check_mentor_capacity`
- compose grounded responses based on live backend data

The backend ensures:

- mentors are not invented
- seats are updated correctly
- follow-up messages reuse session context
- intent is stored in the session and returned to the UI
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
- ask how to contribute to the community
- ask for the same track again in a follow-up
- change to a different track mid-conversation
- select a track using the buttons
- try a full track
- test with AI unavailable

---

## Credits

Built by the Gemma Duo Team for the **Build with Gemma: AI for Africa Hackathon — Minna 2026**.
