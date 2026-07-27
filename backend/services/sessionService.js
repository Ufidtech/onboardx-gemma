/**
 * Lightweight in-memory session store, keyed by a sessionId the frontend
 * generates once per browser tab and sends with every /api/chat request.
 *
 * This exists to fix a real bug: without it, every message was evaluated in
 * total isolation. If a user asked a follow-up question that didn't happen
 * to repeat the track's name ("what does a frontend dev do?" vs "okay" vs
 * "how much does this cost"), the mentor link and curriculum download would
 * silently disappear from the reply - not because anything failed, but
 * because there was nothing remembering "we already established Frontend
 * for this person a few messages ago."
 *
 * It also prevents a second real bug: without memory of an existing match,
 * a later message that causes Gemma (or our own fallback) to re-check
 * capacity for the *same* track a user was already matched to would
 * decrement a second mentor seat for the same person.
 *
 * Scope note: this is process-local memory, fine for a single-instance
 * deploy. For multi-instance production, swap this for Redis - only this
 * file would need to change.
 */

const sessions = new Map();
const SESSION_TTL_MS = 1000 * 60 * 60 * 2; // 2 hours of inactivity

function createEmptySession() {
    return {
        track: null,
        level: null,
        match: null, // { status, track, mentor, mentorLink, alternative, week1Actions, estimatedWeeks, starterPackUrl }
        lastActive: Date.now()
    };
}

/**
 * Returns a real, persisted session if a sessionId is provided, or a fresh
 * throwaway session object (not stored) if none was given - so the app
 * still works, just statelessly, for any caller that doesn't send one.
 */
function getOrCreateSession(sessionId) {
    if (!sessionId || typeof sessionId !== "string") {
        return createEmptySession();
    }

    const existing = sessions.get(sessionId);
    if (existing && Date.now() - existing.lastActive <= SESSION_TTL_MS) {
        existing.lastActive = Date.now();
        return existing;
    }

    const fresh = createEmptySession();
    sessions.set(sessionId, fresh);
    return fresh;
}

// Periodic cleanup so memory doesn't grow unbounded during long uptimes.
setInterval(() => {
    const now = Date.now();
    for (const [id, session] of sessions.entries()) {
        if (now - session.lastActive > SESSION_TTL_MS) sessions.delete(id);
    }
}, 1000 * 60 * 15).unref();

module.exports = { getOrCreateSession };