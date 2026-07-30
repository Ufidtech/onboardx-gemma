# 💬 OnboardX

> **An AI-powered community continuity and member support platform built for FUT Minna and similar African campus developer communities**
> Built for the **Build with Gemma: AI for Africa Hackathon — Minna 2026**

## Table of Contents

- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [Why Gemma 4?](#why-gemma-4)
- [Core Capabilities](#core-capabilities)
- [How Gemma 4 Is Used](#how-gemma-4-is-used)
- [Example User Journey](#example-user-journey)
- [Architecture](#architecture)
- [Challenges](#challenges)
- [Screenshots](#screenshots)
- [Run Locally](#run-locally)
- [API](#api)
- [Testing Ideas](#testing-ideas)
- [Supported Tracks](#supported-tracks)
- [Scalability](#scalability)
- [Impact](#impact)
- [Future Work](#future-work)
- [Built With](#built-with)
- [Credits](#credits)

---

## The Problem

Every semester, campus developer communities successfully onboard new members through workshops, hackathons, and bootcamps. Yet within weeks, many become inactive — not because they lack interest, but because they lose access to personalized guidance, timely mentor support, and a clear next step.

That creates a real retention gap:

- new members do not know what to do after the event
- intermediate members need direction
- mentors are limited and cannot support everyone at once
- experienced members want to help, but there is no simple path
- communities go quiet after onboarding momentum fades

## The Solution

OnboardX solves this by giving FUT Minna and similar African campus developer communities a lightweight conversational support layer that keeps members learning, supported, and engaged between events.

Members can return to OnboardX to:

- get matched with mentors
- continue a learning path
- ask follow-up questions
- pivot to a new track
- explore how they can contribute back to the community

It is designed for real communities where support is not just for beginners. Some members are just starting out, some are intermediate, and some are experienced contributors who want to mentor, guide, or give back. OnboardX supports all of them in one lightweight conversational experience powered by Gemma 4.

## Why Gemma 4?

OnboardX relies on Gemma 4 because it is not just generating text — it is acting as the reasoning engine behind community support.

Gemma 4 enables:

- native function calling to query live mentor capacity instead of inventing recommendations
- long-context reasoning to maintain continuity across multiple onboarding conversations
- efficient inference suitable for lightweight campus and community deployments
- grounded response generation so recommendations stay aligned with real backend data

Without Gemma 4, OnboardX would be a static FAQ. With Gemma 4, it becomes an adaptive community support system.

## Core Capabilities

### Community support
- mentor routing
- learning track guidance
- contributor-aware conversation
- session-aware continuity
- track pivots and follow-ups

### AI capabilities
- natural language track inference
- beginner/intermediate level inference
- Gemma 4 native function calling
- grounded mentor matching
- streamed responses

### Reliability
- live mentor capacity checks
- alternative mentor suggestions when a track is full
- downloadable starter packs
- deterministic fallback when AI is unavailable
- token usage and budget tracking

### User experience
- WhatsApp-style chat interface
- tappable track buttons
- helper text for learners and contributors
- development-only debug panel

## How Gemma 4 Is Used

Gemma 4 serves as the reasoning engine that enables OnboardX to:

- infer the user's learning track from natural language
- infer beginner or intermediate level
- recognize when a user wants to mentor or contribute
- decide when to call `check_mentor_capacity`
- compose grounded responses using live backend data
- maintain continuity across follow-up messages

The backend ensures that:

- mentor recommendations are grounded in live backend data rather than model hallucinations
- mentor availability is verified in real time through backend tool invocation
- session context is reused across messages
- track pivots are handled safely
- model output is cleaned for the plain-text UI

## Example User Journey

```text
Student joins FUT Minna community
↓
Needs Frontend guidance
↓
Gemma identifies intent
↓
Backend checks mentor capacity
↓
Mentor available?
├── Yes → Connect mentor
└── No  → Recommend alternative mentor
          + Starter Pack
          + Personalized roadmap
↓
Conversation remembered
↓
Returns next week
↓
Continues learning without starting over
```

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

## Challenges

Some of the main engineering challenges were:

- keeping mentor recommendations grounded in live backend data
- preserving conversation context across multiple turns
- handling full tracks gracefully
- making sure the app still works when AI output is unavailable

These were addressed using native function calling, session-based context, and deterministic fallback logic.

## Screenshots

### Home Screen
![Home Screen](https://github.com/user-attachments/assets/d3eb2bd2-d392-4460-abe1-c5aef8eb0e2c)

### Learner Match
![Learner Match](https://github.com/user-attachments/assets/01b003d2-3128-4da3-bf8f-dd4f597dfc4c)

### Full Track / Alternative Mentor
![Full Track / Alternative Mentor](https://github.com/user-attachments/assets/fe105654-ee6d-43c4-b80f-d0ece35ec7cf)

### Contributor Intent
![Contributor Intent](https://github.com/user-attachments/assets/a683ec79-45ca-465c-9a24-59fc2d2b8b36)

## Run Locally

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

## API

- `POST /api/chat` — send a message
- `POST /api/chat/stream` — stream a response
- `GET /api/resources/starter-pack` — download a curriculum PDF
- `GET /api/mentors/load` — view mentor capacity
- `GET /api/health` — check service health

## Testing Ideas

Try these in the app:

- ask for a track as a beginner
- ask how to contribute to the community
- ask for the same track again in a follow-up
- change to a different track mid-conversation
- select a track using the buttons
- try a full track
- test with AI unavailable

## Supported Tracks

- Frontend
- Backend
- Project Management
- Cloud Computing
- Data Analytics
- AI / Machine Learning
- Android / Mobile Development
- UI/UX Design
- Cybersecurity
- DevOps / SRE
- IT Support
- Digital Marketing

## Scalability

While OnboardX is demonstrated using FUT Minna, the same platform can be adapted for GDG on Campus chapters, MLSA communities, AWS Student Builder Group, university innovation hubs, and other African campus tech communities facing the same retention challenge.

## Impact

OnboardX helps campus developer communities:

- reduce member drop-off after onboarding
- make limited mentor time more effective
- provide continuous support between events
- create clearer pathways from learner to contributor
- scale community support without requiring mentors to answer repetitive questions

## Track

AI for Social Impact

## Future Work

- WhatsApp integration
- local language support
- offline Gemma deployment
- organizer analytics dashboard
- community health metrics

## Built With

Gemma 4 · React · Vite · Express · Native Function Calling

## Credits

Built by the Gemma Duo Team for the **Build with Gemma: AI for Africa Hackathon — Minna 2026**.
