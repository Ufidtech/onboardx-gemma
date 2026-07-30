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

function findBestAlternativeMentor(excludeTrackLower) {
  const candidates = mentors.filter(
    (m) => m.track.toLowerCase() !== excludeTrackLower && m.seatsAvailable > 0
  );

  if (candidates.length === 0) return null;

  // Prefer whichever mentor has the most free capacity, to naturally spread
  // load across mentors rather than always suggesting the same one.
  return candidates.reduce((best, current) =>
    current.seatsAvailable > best.seatsAvailable ? current : best
  );
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

  // Requested track has no capacity (or doesn't exist). Instead of leaving
  // the user with only the self-guided fallback, check whether a different
  // track has real, live capacity right now and surface it as a named
  // alternative. This is a stateless, deterministic lookup - no new
  // persistence, nothing that can fail across requests.
  const alternative = findBestAlternativeMentor(normalizedTrack);

  return {
    status: "full",
    track: track || null,
    message: "No seats available. Initiate self-guided track.",
    alternative: alternative
      ? {
        track: alternative.track,
        mentor: alternative.name,
        link: alternative.contactLink,
        seatsAvailable: alternative.seatsAvailable
      }
      : null
  };
}

const TRACK_PATTERNS = [
  { track: "Cloud Computing", patterns: [/cloud computing/, /google cloud/, /\bgcp\b/, /\bcloud\b/, /cloud engineering/, /cloud platform/] },
  { track: "AI / Machine Learning", patterns: [/machine learning/, /artificial intelligence/, /deep learning/, /\bml\b/, /\bai\b/, /chatgpt/, /llm/, /genai/] },
  { track: "Android / Mobile Development", patterns: [/android/, /mobile development/, /mobile app/, /mobile apps/, /\bkotlin\b/, /app development/] },
  { track: "UI/UX Design", patterns: [/ux design/, /ui design/, /user experience/, /user interface/, /\bfigma\b/, /\bux\b/, /\bui\b/, /design stuff/, /product design/] },
  { track: "Cybersecurity", patterns: [/cybersecurity/, /cyber security/, /security/, /ethical hacking/, /infosec/] },
  { track: "DevOps / SRE", patterns: [/devops/, /site reliability/, /\bsre\b/, /ci\/cd/, /deployment/, /infrastructure/] },
  { track: "IT Support", patterns: [/it support/, /tech support/, /help ?desk/, /troubleshooting/, /desktop support/] },
  { track: "Digital Marketing", patterns: [/digital marketing/, /\bseo\b/, /social media marketing/, /marketing/, /content marketing/] },
  { track: "Data Analytics", patterns: [/data analytics/, /data analysis/, /data analyst/, /\bsql\b/, /power bi/, /tableau/, /analytics/] },
  { track: "Frontend", patterns: [/frontend/, /front-end/, /front end/, /web dev/, /web development/, /website development/, /react/, /html/, /css/, /javascript/] },
  { track: "Backend", patterns: [/backend/, /back-end/, /back end/, /api/, /server side/, /server-side/, /node\.js/, /express/, /database/] },
  { track: "Project Management", patterns: [/project management/, /project/, /\bpm\b/, /scrum/, /agile/] }
];

function inferTrackFromMessage(message) {
  const normalizedMessage = String(message || "")
    .toLowerCase()
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // When a message mentions more than one track (people genuinely ramble -
  // "my cousin does cloud computing but honestly frontend maybe"), prefer
  // whichever track is mentioned LAST in the text, not whichever happens to
  // be first in this array. The last-mentioned thing is a much better proxy
  // for someone's actual, current intent than an arbitrary priority order.
  let bestTrack = null;
  let bestIndex = -1;

  for (const { track, patterns } of TRACK_PATTERNS) {
    for (const pattern of patterns) {
      const match = normalizedMessage.match(pattern);
      if (match && typeof match.index === "number" && match.index > bestIndex) {
        bestIndex = match.index;
        bestTrack = track;
      }
    }
  }

  return bestTrack;
}

/**
 * Infers the user's self-reported experience level from free text.
 * Defaults to "beginner" when nothing is said, since that's the safer
 * assumption for a new community member and matches learningPathService's
 * own default.
 */
function inferLevelFromMessage(message) {
  const normalizedMessage = String(message || "")
    .toLowerCase()
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const intermediateSignals = [
    "intermediate",
    "some experience",
    "already know",
    "not new to",
    "worked with",
    "used it before",
    "comfortable with",
    "not a beginner",
    "more advanced",
    "next level"
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
  findBestAlternativeMentor,
  inferTrackFromMessage,
  inferLevelFromMessage
};