const { mentors } = require("../database");

function getMentorSnapshot() {
  return mentors.map((mentor) => ({
    name: mentor.name,
    track: mentor.track,
    seatsAvailable: mentor.seatsAvailable,
    contactLink: mentor.contactLink
  }));
}

function buildMentorContext() {
  return getMentorSnapshot()
    .map(
      (mentor) =>
        `- ${mentor.track}: ${mentor.name} (${mentor.seatsAvailable} seats left, link: ${mentor.contactLink})`
    )
    .join("\n");
}

function checkMentorCapacity(track) {
  const normalizedTrack = String(track || "").trim().toLowerCase();
  const mentor = mentors.find(
    (m) => m.track.toLowerCase() === normalizedTrack
  );

  if (mentor && mentor.seatsAvailable > 0) {
    mentor.seatsAvailable -= 1;
    return {
      status: "success",
      track: mentor.track,
      mentor: mentor.name,
      link: mentor.contactLink,
      seatsRemaining: mentor.seatsAvailable
    };
  }

  return {
    status: "full",
    track: track || null,
    message: "No seats available. Initiate self-guided track."
  };
}

function inferTrackFromMessage(message) {
  const normalizedMessage = String(message || "").toLowerCase();

  if (normalizedMessage.includes("frontend")) {
    return "Frontend";
  }

  if (normalizedMessage.includes("backend")) {
    return "Backend";
  }

  if (normalizedMessage.includes("project")) {
    return "Project Management";
  }

  return null;
}

/**
 * Infers the user's self-reported experience level from free text.
 * Defaults to "beginner" when nothing is said, since that's the safer
 * assumption for a new community member and matches learningPathService's
 * own default.
 */
function inferLevelFromMessage(message) {
  const normalizedMessage = String(message || "").toLowerCase();

  const intermediateSignals = [
    "intermediate",
    "some experience",
    "already know",
    "not new to",
    "worked with",
    "used it before",
    "comfortable with"
  ];

  if (intermediateSignals.some((signal) => normalizedMessage.includes(signal))) {
    return "intermediate";
  }

  return "beginner";
}

module.exports = {
  getMentorSnapshot,
  buildMentorContext,
  checkMentorCapacity,
  inferTrackFromMessage,
  inferLevelFromMessage
};
