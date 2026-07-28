# 💬 OnboardX — The Autonomous, Capacity-Aware Mentorship Engine

> **Built for the Build with Gemma: AI for Africa Hackathon — Minna 2026**
> Google Developer Groups on Campus, Federal University of Technology, Minna

Every fast-growing tech community hits the same wall: new members join faster than a handful of volunteer mentors can personally guide them. The result is predictable — a backlog of "where do I start?" questions, mentor burnout, and members who quietly drop off before they ever get real direction.

**OnboardX solves this by putting Gemma 4 in charge of the actual decision-making**, not just the small talk. It meets new members inside a familiar, zero-friction WhatsApp-style chat, figures out what they want to learn and how experienced they are, and then makes a real, capacity-aware call: match them to a live mentor, suggest a genuinely available alternative track if their first choice is full, or hand them a real downloadable curriculum so they never hit a dead end.

---

## 🧠 Why this isn't "just a chatbot"

A basic chat prompt bolted onto an app doesn't count as meaningful AI integration. Here's what Gemma 4 is actually doing under the hood:

- **Native function calling, not prompt-stuffing.** Gemma decides *when* to call `check_mentor_capacity` based on the conversation, receives real, live data back, and reasons over it — it never invents a mentor, a seat count, or a link.
- **It drives real backend state changes.** A successful match genuinely decrements a mentor's seat count. This isn't decorative text generation sitting on top of a static app.
- **It gets grounded even when it doesn't call a tool.** If Gemma answers directly without invoking the function, the backend still cross-checks the message and attaches real data — so the app never silently degrades into hallucinated advice.
- **It fails safely.** If the live API is unreachable, a deterministic fallback engine takes over using the exact same mentor data and learning-path logic — the user experience degrades gracefully instead of breaking.

---

## ✨ What it actually does

- **12 real learning tracks** — Frontend, Backend, Project Management, Cloud Computing, Data Analytics, AI/Machine Learning, Android/Mobile Development, UI/UX Design, Cybersecurity, DevOps/SRE, IT Support, and Digital Marketing — each with a distinct beginner and intermediate learning path.
- **Capacity-aware mentor matching.** Real seat tracking per mentor, per track. No overselling a mentor who's already at capacity.
- **Cross-track suggestions when a track is full.** Instead of a dead end, the agent surfaces a genuinely available mentor in a different track — deterministically, never invented by the model.
- **Downloadable, real 4-week starter packs.** Every track and level has a real PDF curriculum — with clickable links, generated on demand — built entirely around **official Google and GDGoC learning resources** (web.dev, Firebase, Google Cloud Skills Boost, the Google Career Certificates on Coursera, Android Developers, the Google SRE book, Kaggle, and more).
- **Conversation memory that actually persists.** A follow-up question like *"what does a frontend dev do?"* doesn't lose the mentor link or curriculum that was already established — the agent remembers the conversation's context instead of evaluating every message in isolation.
- **Debug observability in development, invisible in production.** A live model/source/reason panel helps during development and is automatically stripped from production builds.

---

## 🏗️ Architecture

```
Frontend (React 19 + Vite + Tailwind CSS 4)
        │  POST /api/chat  { message, sessionId }
        ▼
Express 5 backend
        │
        ▼
Chat service (agent loop)
        │  sends conversation + tool definitions to Gemma 4
        ▼
Gemma 4 (@google/genai Interactions API)
        │
        ├─ calls check_mentor_capacity ──► Mentor capacity engine (real seat tracking)
        │                                          │
        │                                          ├─ success  → real mentor + curriculum link
        │                                          └─ full     → cross-track alternative + starter pack
        │
        └─ answers directly ──► grounded against session memory or the current message
                                          │
                                          ▼
                              Session store (per-conversation memory)
```

If the live Gemma API is unreachable, the same mentor-matching and curriculum logic runs through a deterministic fallback path — the user gets the same real data, just without live conversational nuance.

---

## 🛠️ Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS 4 |
| Backend | Node.js, Express 5 |
| AI | Gemma 4 via `@google/genai` (native function calling, Interactions API) |
| PDF generation | `pdfkit` — real, downloadable curricula with embedded clickable links |
| Testing | Node's built-in test runner (backend), Vitest + Testing Library (frontend) |

---

## 🚀 Getting Started

### Backend

```bash
cd backend
npm install
cp .env.example .env
# then edit .env and add your real GEMINI_API_KEY (from https://aistudio.google.com/apikey)
npm start
```

Runs on `http://localhost:4000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173` and talks to the backend automatically in local development.

### Environment variables (`backend/.env`)

```
GEMINI_API_KEY=your_actual_api_key_here
PORT=4000
GEMMA_MODEL=gemma-4
```

---

## ✅ Testing

This isn't a demo held together with hope — it's actually tested:

```bash
cd backend
npm test
```

**31 passing tests**, covering:
- Gemma's native `check_mentor_capacity` function-call/result continuation loop
- Mentor capacity matching and cross-track alternative logic
- Track and level inference from natural language (including word-boundary safety, so short tokens like "ai" or "ux" don't false-match inside words like "wait" or "guide")
- All 12 tracks generating real, distinct learning paths and starter packs
- Real PDF generation and safe filename handling
- Session memory — proving a follow-up question reuses an established match instead of losing it, and that pivoting tracks mid-conversation updates correctly without double-booking a mentor seat

```bash
cd frontend
npm test
```

---

## 📡 API Reference

### `POST /api/chat`
```json
{ "message": "I want to learn frontend, I'm a beginner", "sessionId": "any-stable-id-per-conversation" }
```
Returns the agent's reply plus structured data: matched track, level, mentor (if available), a real mentor contact link, a downloadable curriculum URL, and — if the track is full — a genuine cross-track alternative.

### `GET /api/resources/starter-pack?track=...&level=...`
Returns a real, generated PDF — the 4-week self-guided curriculum for that track and level.

### `GET /api/mentors/load`
Debug/admin visibility into current mentor capacity.

### `GET /api/health`
Liveness check, also reports the active Gemma model.

---

## 🔭 Honest Limitations & Next Steps

In the interest of the documentation actually being useful instead of just impressive:

- **Mentor contact data is placeholder.** Seeded mentor names and WhatsApp links are illustrative, not real community mentors yet — swapping in real data is a config change, not a rebuild.
- **In-memory storage.** Mentor capacity and session memory currently live in process memory, which is fine for a single-instance demo but would move to a real database (and Redis for sessions) for production, multi-instance use.
- **No mentor-side consent flow yet.** A match currently reveals contact info immediately rather than requiring the mentor to accept first — a natural next iteration.

---

## 🙌 Credits

Built by the GDGoC FUT Minna team for the Build with Gemma: AI for Africa Hackathon.
