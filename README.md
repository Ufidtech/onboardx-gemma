# 💬 OnboardX

> **An AI-powered community continuity and member support platform built for FUT Minna and similar African campus developer communities**  
> Built for the **Build with Gemma: AI for Africa Hackathon — Minna 2026**

OnboardX helps FUT Minna’s developer community keep members learning, supported, and engaged between events.

Instead of losing momentum after workshops, hackathons, or onboarding sessions, members can return to OnboardX to get matched with mentors, continue a learning path, ask follow-up questions, or explore how they can contribute back to the community.

It is designed for real communities where support is not just for beginners. Some members are just starting out, some are intermediate, and some are experienced contributors who want to mentor, guide, or give back. OnboardX supports all of them in one lightweight conversational experience powered by Gemma 4.

---

## Why it matters

Many campus tech communities are active during events, but go quiet afterward.

That creates a real gap:
- new members do not know what to do next
- intermediate members need direction
- mentors are limited and cannot support everyone at once
- experienced members want to help, but there is no simple path
- people lose momentum when the community goes silent

OnboardX bridges that gap by providing ongoing support between events through mentor routing, learning guidance, and contributor-aware conversation.

---

## What it does

- WhatsApp-style chat interface
- Community continuity framing for learners, contributors, and returning members
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

Gemma 4 is core to the app.

It helps OnboardX:
- infer the user’s learning track from natural language
- infer beginner or intermediate level
- recognize when a user wants to mentor or contribute
- decide when to call `check_mentor_capacity`
- compose grounded responses using live backend data
- maintain continuity across follow-up messages

The backend ensures that:
- mentors are not invented
- seats are checked live
- session context is reused
- track pivots are handled safely
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
