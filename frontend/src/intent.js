export function inferLocalIntent(message) {
  const text = String(message || "")
    .toLowerCase()
    .trim();

  if (/^(hi|hello|hey|good (morning|afternoon|evening))[!.?]*$/.test(text)) {
    return "greeting";
  }

  if (/^(thanks?|thank you)[!.?]*$/.test(text)) {
    return "thanks";
  }

  if (
    /\b(contribute|contribution|help (the community|others)|give back|volunteer|become a mentor|be a mentor|(want|like|ready) to mentor|mentor (the community|others|people|members|beginners)|support the community|share my experience)\b/.test(
      text,
    )
  ) {
    return "contributor";
  }

  if (
    text.length < 4 ||
    /^(what|how|why|help|more|tell me more|okay|ok|hmm+|not sure|unsure)[!.?]*$/.test(text)
  ) {
    return "clarification";
  }

  const mentionsTrack =
    /\b(frontend|backend|cloud computing|cloud|data analytics|ai|machine learning|android|mobile|ui\/ux|cybersecurity|devops|sre|it support|digital marketing|project management)\b/.test(
      text,
    );
  const requestsMentorFlow =
    /\b(mentor|mentorship|match me|learning track|learning path|roadmap|availability|available|openings?|seats?|spots?)\b/.test(
      text,
    ) ||
    /\b(want|need|learn|study|start|begin|join|take|choose|select|switch|change|pivot|explore|improve|teach|guide|recommend|find|connect|interested|looking|trying|get into)\b/.test(
      text,
    ) ||
    /\b(would like|i'd like|let'?s do|help me (with|learn|choose|find))\b/.test(
      text,
    );

  const asksAvailability =
    /\b(availability|available|openings?|seats?|spots?)\b/.test(text);
  const isInformationalQuestion =
    /^(what (is|does|are)|how (does|is)|tell me about|explain|describe)\b/.test(
      text,
    );

  if (
    mentionsTrack &&
    requestsMentorFlow &&
    (asksAvailability || !isInformationalQuestion)
  ) {
    return "learner";
  }

  if (
    !isInformationalQuestion &&
    /\b(mentor|mentorship|match me|learning track|learning path|roadmap|availability)\b/.test(
      text,
    )
  ) {
    return "clarification";
  }

  return "unknown";
}
