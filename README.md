# 💬 OnboardX — A Capacity-Aware Mentorship Agent Powered by Gemma 4

> **Build with Gemma: AI for Africa Hackathon — Minna 2026**  
> GDGoC FUT Minna

OnboardX is an intelligent mentorship onboarding assistant for growing tech communities.

It helps new members discover what to learn, determine their level, find an available mentor, and keep moving even when a track is full.

Instead of ending the conversation with “come back later,” OnboardX can:
- match a user to a live mentor,
- suggest a real alternative track with open capacity, or
- generate a downloadable starter pack so the user can continue independently.

---

## Why OnboardX exists

Fast-growing communities often face the same problem:
- new members join faster than mentors can respond
- onboarding questions pile up
- mentors become overloaded
- beginners drop off before getting proper guidance

OnboardX turns that problem into a guided, AI-powered conversation.

It is especially relevant to:
- **Autonomous AI Agents**
- **AI for Social Impact**

---

## What the system does

- Provides a WhatsApp-style chat experience
- Streams assistant responses token by token for a responsive demo
- Lets users tap track buttons to jump directly into a learning path
- Infers learning track and experience level from the user’s message
- Uses **Gemma 4 native function calling**
- Checks real mentor capacity before confirming a match
- Suggests an available alternative if the chosen track is full
- Returns a downloadable starter pack for self-guided learning
- Preserves conversation memory across messages
- Tracks token usage and budget information in the backend
- Falls back safely if the AI API is unavailable
- Shows debug information only in development

---

## How Gemma 4 is used

Gemma 4 is the decision-making layer of the app.

### Gemma 4 helps with:
- understanding the user’s intent
- classifying the learning track
- inferring beginner or intermediate level
- deciding when to call `check_mentor_capacity`
- composing a grounded response using live backend data

### The backend ensures:
- mentor availability is checked against real data
- matches decrement capacity correctly
- mentor links are not invented
- follow-up messages reuse session context
- duplicate mentor URLs are removed from prose
- markdown emphasis is stripped for plain-text chat bubbles
- token usage is tracked per request
- the app remains functional even if the model fails

This makes the app more than a chatbot — it is a grounded AI agent.

---

## Supported learning tracks

OnboardX currently supports 12 tracks:

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

Each track has beginner and intermediate learning paths.

---

## Architecture

```text
Frontend (React + Vite)
        │
        │ POST /api/chat { message, sessionId }
        │ POST /api/chat/stream { message, sessionId }
        ▼
Express backend
        │
        ▼
Chat service
        │
        ├── sends prompt + tool definition to Gemma 4
        │
        ├── Gemma may call check_mentor_capacity
        │        │
        │        ├── success → grounded mentor match
        │        └── full    → alternative mentor or starter pack
        │
        ├── streams assistant replies via SSE
        │
        └── if AI fails → deterministic fallback using backend logic
```

The app also uses session memory so follow-up questions can continue from the same conversation without losing context.

---

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React, Vite |
| Backend | Node.js, Express |
| AI | Gemma 4 via `@google/genai` |
| PDF generation | `pdfkit` |
| Testing | Node test runner, frontend tests |

---

## Demo flow

1. A user taps a track button or types what they want to learn.
2. Gemma 4 interprets the message.
3. The backend checks live mentor capacity.
4. The app streams the reply token by token.
5. The final result includes:
   - a mentor match, or
   - an alternative track, or
   - a starter pack link.
6. The conversation keeps context for follow-up questions.

---

## UI and observability

The frontend is designed to make the demo easy to understand:
- track buttons are tappable shortcuts into the conversation flow
- streaming makes the assistant feel responsive live
- a debug panel shows the active model, source, reason, usage, and decision in development mode only

This helps prove that the prototype is not just visually polished — it is observable and testable.

---

## Getting started

### Backend

```bash
cd backend
npm install
cp .env.example .env
# add your GEMINI_API_KEY
npm start
```

Backend runs on `http://localhost:4000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

---

## Environment variables

`backend/.env`

```env
GEMINI_API_KEY=your_actual_api_key_here
PORT=4000
GEMMA_MODEL=gemma-4
```

---

## Testing

The backend includes tests covering:
- Gemma 4 function calling
- mentor capacity matching
- fallback behavior
- session memory
- track inference
- level inference
- starter pack generation
- streaming reply handling
- markdown stripping
- mentor link de-duplication
- usage and token tracking

Run tests with:

```bash
cd backend
npm test
```

---

## API endpoints

### `POST /api/chat`
Example:

```json
{
  "message": "I want to learn frontend, I'm a beginner",
  "sessionId": "any-stable-session-id"
}
```

Returns:
- reply text
- matched track
- mentor data if available
- mentor contact link
- starter pack URL
- alternative suggestion if the track is full
- usage details and token statistics

### `POST /api/chat/stream`
Streams the assistant response token by token using server-sent events.

### `GET /api/resources/starter-pack?track=...&level=...`
Returns a downloadable PDF starter pack.

### `GET /api/mentors/load`
Returns current mentor capacity information.

### `GET /api/health`
Returns health status and the active model.

---

## Why this is a strong hackathon submission

OnboardX demonstrates:
- real Gemma 4 integration
- native function calling
- meaningful social impact
- working prototype functionality
- streaming UX
- stateful session handling
- clear engineering evidence
- observability for judging and debugging

It is a practical example of an autonomous AI agent built for a real community need.

---

## Limitations

This is a hackathon prototype, so some parts are intentionally lightweight:

- mentor data is seeded
- storage is in-memory
- mentor consent flow is not yet implemented
- production deployment would use persistent storage

These are clear next steps for scaling the system.

---

## Credits

Built by team Gemma Duo: Two minds. One agent. Built for impact. for the **Build with Gemma: AI for Africa Hackathon — Minna 2026**.
