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

Built by the GDGoC FUT Minna team for the **Build with Gemma: AI for Africa Hackathon — Minna 2026**.
```

---

# 2) Updated Kaggle writeup

```text
OnboardX is an AI-powered mentorship onboarding assistant designed for fast-growing tech communities. The problem we are solving is simple but real: new members often join faster than mentors can personally support them. This creates a backlog of “where do I start?” questions, increases mentor burnout, and causes learners to lose momentum before they receive meaningful guidance.

Our solution turns onboarding into a guided conversation powered by Gemma 4. A user can describe what they want to learn in natural language, or tap a learning track button in the UI, and the system infers their likely learning track and experience level. If the user is ready for mentorship, Gemma 4 can trigger a backend function call to check whether a mentor is available in that track. If a seat is open, the user is matched to a mentor. If the track is full, the system suggests a real alternative track with open capacity or provides a downloadable starter pack so the user can continue learning immediately.

What makes OnboardX different from a basic chatbot is that Gemma 4 is not just writing text. It participates in an agentic workflow. The model helps classify the user’s intent and decide when to call the mentor capacity tool, while the backend remains the source of truth for mentor availability, track inference fallback, session memory, resource generation, and token usage tracking. This keeps the system grounded in real data even when the model answers directly or when the live AI API is unavailable.

The application has three main layers:

1. Frontend — A React + Vite interface styled like a familiar messaging app. The UI streams assistant responses token by token, includes tappable track buttons, and shows debug information only in development.
2. Backend — An Express API that handles chat, streaming responses, mentor load visibility, health checks, and starter pack generation.
3. AI layer — Gemma 4 via the @google/genai Interactions API, using native function calling to determine when mentor capacity should be checked.

The backend maintains per-conversation session memory so follow-up questions can reuse an already established track and mentor match. This means a user can ask something like “what does a frontend dev do?” and the system will preserve the earlier context instead of starting over. The system also supports track pivots, so if the user changes their mind mid-conversation, the session is updated cleanly without double-booking mentor capacity.

We also built a deterministic fallback path. If the live AI API is unavailable, the app still returns a useful response using the same mentor data and learning-path logic. This makes the prototype resilient and ensures the demo does not collapse if the model service is temporarily unreachable.

Technically, the project includes:
- 12 supported learning tracks
- beginner and intermediate learning paths
- real mentor capacity tracking
- cross-track alternatives when a track is full
- downloadable PDF starter packs with curated learning resources
- session-aware conversation memory
- streaming responses for a better user experience
- tappable track buttons for faster onboarding
- token usage and budget tracking
- development-only debug observability
- automated tests covering the agent/tool flow and core backend behaviors

The supported tracks are:
Frontend, Backend, Project Management, Cloud Computing, Data Analytics, AI / Machine Learning, Android / Mobile Development, UI/UX Design, Cybersecurity, DevOps / SRE, IT Support, and Digital Marketing.

This project fits the hackathon especially well because it demonstrates Autonomous AI Agents in a practical way. Gemma 4 is used to reason about user intent, call tools, and help drive a real workflow. It also fits AI for Social Impact because it addresses a practical onboarding and mentorship problem faced by growing communities.

During the sprint, the main engineering challenges were:
- keeping model output grounded in real data
- preventing hallucinated mentor names or links
- preserving conversation state across turns
- safely handling model or API failure
- ensuring mentor capacity was updated correctly when a match succeeded
- keeping the UI responsive through streaming
- making the system observable with usage and decision tracking

We solved these challenges by combining Gemma’s native function calling with deterministic backend logic, session storage, SSE-based streaming, and automated tests.

OnboardX is intentionally a strong prototype rather than a full production system. The mentor data is currently seeded, storage is in-memory, and mentor-side acceptance flow is not yet implemented. These are clear next steps for scaling the application into a production-ready system with persistent storage and real mentor workflows.

Public code repository:
[Insert GitHub repo link]

Live demo:
[Insert demo link]

In summary, OnboardX shows how Gemma 4 can power a practical autonomous agent that does more than chat. It can reason about user intent, call tools, stay grounded in live data, stream responses to the user, and help people move forward immediately. For communities with limited mentor capacity, that makes onboarding faster, more reliable, and more inclusive.
