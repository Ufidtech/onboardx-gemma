const {
  buildMentorContext,
  checkMentorCapacity,
  inferTrackFromMessage,
  inferLevelFromMessage,
  getMentorSnapshot
} = require("../routes/mentorUtils");
const { generateLearningPath } = require("./learningPathService");
const { getOrCreateSession } = require("./sessionService");

function getTrackOptions() {
  return getMentorSnapshot().map((mentor) => ({
    track: mentor.track,
    seatsAvailable: mentor.seatsAvailable
  }));
}

function buildStarterPackUrl(track, level) {
  const params = new URLSearchParams({ track, level }).toString();
  return `/api/resources/starter-pack?${params}`;
}

/**
 * The chat UI renders plain text, not markdown - so if Gemma writes
 * "**Priya**" it shows up as literal, broken-looking asterisks instead of
 * bold text. This strips common markdown emphasis syntax as a guaranteed
 * safety net, on top of (not instead of) asking Gemma not to use it in the
 * system prompt - prompt instructions alone aren't 100% reliable.
 */
function stripMarkdownEmphasis(text) {
  return text
    .replace(/\*\*\*(.+?)\*\*\*/g, "$1") // ***bold italic***
    .replace(/\*\*(.+?)\*\*/g, "$1") // **bold**
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "$1") // *italic*
    .replace(/__(.+?)__/g, "$1") // __bold__
    .replace(/ {2,}/g, " ") // collapse any double spaces left behind
    .trim();
}

/**
 * The frontend already renders the mentor's contact link in its own
 * dedicated "Mentor link" box. If Gemma also writes the raw URL out in its
 * prose, it shows up twice - once redundantly inline, once in the box.
 * Strip the exact URL (and light trailing punctuation) from the prose so
 * it only appears once, in the box where it belongs.
 */
function stripDuplicateLink(text, link) {
  if (!link) return text;

  const escaped = link.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text
    .replace(new RegExp(`:?\\s*${escaped}[.,;:!?]?`, "g"), "")
    .replace(/ {2,}/g, " ")
    .replace(/\s+([.,;:!?])/g, "$1") // no stray space before leftover punctuation
    .trim();
}

function cleanReplyText(text, link) {
  return stripDuplicateLink(stripMarkdownEmphasis(text), link);
}

/**
 * Returns the grounded track context (mentor match + curriculum info) for
 * this turn, reusing an already-established session match instead of
 * re-computing (and re-decrementing a mentor seat) whenever possible.
 *
 * Behavior:
 *  - If this message names a DIFFERENT track than the session currently
 *    has (or the session has none yet), that's a fresh pick or a pivot -
 *    compute a new match, store it on the session, and return it.
 *  - If this message doesn't name any track, but the session already has
 *    an established one, reuse that stored match so links don't silently
 *    disappear on follow-up questions like "what does a frontend dev do?"
 *  - If neither the message nor the session has a track, return null -
 *    genuinely nothing to ground yet (e.g. the very first "hi").
 *
 * @returns {null | {status, track, level, mentor, mentorLink, alternative, week1Actions, estimatedWeeks, starterPackUrl, reused}}
 */
function resolveGroundedContext(message, session, explicitTrack, explicitLevel) {
  const inferredTrack = explicitTrack || inferTrackFromMessage(message);
  const isNewOrPivot = inferredTrack && inferredTrack !== session.track;

  if (isNewOrPivot) {
    const level =
      explicitLevel === "intermediate" || explicitLevel === "beginner"
        ? explicitLevel
        : inferLevelFromMessage(message);
    const learningPath = generateLearningPath({ track: inferredTrack, level });
    const result = checkMentorCapacity(inferredTrack);

    const match = {
      status: result.status,
      track: result.track || inferredTrack,
      level: learningPath.level,
      mentor: result.mentor || null,
      mentorLink: result.link || null,
      alternative: result.alternative || null,
      week1Actions: learningPath.steps,
      estimatedWeeks: learningPath.estimatedWeeks,
      starterPackUrl: buildStarterPackUrl(result.track || inferredTrack, learningPath.level)
    };

    session.track = inferredTrack;
    session.level = learningPath.level;
    session.match = match;

    return { ...match, reused: false };
  }

  if (session.track && session.match) {
    return { ...session.match, reused: true };
  }

  return null;
}

function buildReplyFromContext(context, textOverride) {
  if (context.status === "success") {
    return {
      reply: textOverride || `You’re matched with ${context.mentor} for ${context.track}.`,
      status: "success",
      track: context.track,
      level: context.level,
      mentor: context.mentor,
      mentorLink: context.mentorLink,
      week1Actions: context.week1Actions,
      estimatedWeeks: context.estimatedWeeks,
      starterPackUrl: context.starterPackUrl
    };
  }

  const altText = context.alternative
    ? ` In the meantime, ${context.alternative.mentor} has open capacity for ${context.alternative.track} if you'd like to explore that instead.`
    : "";

  return {
    reply:
      textOverride ||
      `That track is currently full.${altText} Download the self-guided starter pack below to keep moving, or ask again later when a seat opens.`,
    status: "full",
    track: context.track,
    level: context.level,
    week1Actions: context.week1Actions,
    estimatedWeeks: context.estimatedWeeks,
    starterPackUrl: context.starterPackUrl,
    alternative: context.alternative || null
  };
}

function extractInteractionText(interaction) {
  if (typeof interaction?.text === "string" && interaction.text.trim()) {
    return interaction.text.trim();
  }

  if (
    typeof interaction?.output_text === "string" &&
    interaction.output_text.trim()
  ) {
    return interaction.output_text.trim();
  }

  const textFromOutputs = (interaction?.outputs || [])
    .filter((output) => output.type === "text" && typeof output.text === "string")
    .map((output) => output.text.trim())
    .filter(Boolean);

  if (textFromOutputs.length > 0) {
    return textFromOutputs.join("\n");
  }

  const textFromSteps = (interaction?.steps || [])
    .filter((step) => step.type === "model_output" && Array.isArray(step.content))
    .flatMap((step) => step.content)
    .filter((part) => part.type === "text" && typeof part.text === "string")
    .map((part) => part.text.trim())
    .filter(Boolean);

  if (textFromSteps.length > 0) {
    return textFromSteps.join("\n");
  }

  return "I could not generate a response at the moment.";
}

function hasUsableInteractionText(interaction) {
  return extractInteractionText(interaction) !== "I could not generate a response at the moment.";
}

function buildSystemInstruction() {
  return [
    "You are OnboardX, a practical onboarding agent for new community members.",
    "Think through the user's message together with the grounded facts you are given,",
    "then give a concise, helpful reply. Do not reveal private chain-of-thought.",
    "IMPORTANT - mentor framing: mentors are experienced community members who offer",
    "guidance, answer questions, and point the mentee in the right direction. They are",
    "NOT formal instructors running lessons or teaching a curriculum. Always frame a",
    "mentor match as 'someone to talk to for guidance and advice', never as 'someone",
    "who will teach you' or 'your instructor'. The actual learning happens through the",
    "self-guided track content; the mentor is community support alongside it.",
    "Use only facts you are given - never invent mentors, seats, links, or tracks.",
    "FORMATTING: this is a plain-text chat bubble, not a markdown renderer. Never use",
    "**bold**, *italics*, markdown headers, or bullet dashes in your reply - write plain,",
    "natural sentences only. Never write out the mentor's raw WhatsApp link yourself -",
    "the app already displays it in its own dedicated link button, so just refer to the",
    "mentor by name (e.g. 'reach out to Priya') instead of repeating the URL.",
    "When you don't yet know the user's track and are inviting them to choose, do NOT",
    "list or name the tracks in your reply - the app shows every track as a tappable",
    "button right below your message. Just briefly invite the user to tap a track below.",
    "Current mentor inventory:",
    buildMentorContext()
  ].join("\n");
}

function buildComposeInput(message, context) {
  const lines = [
    "You are replying to a community member. Think about their message together with",
    "the grounded facts below, then write ONE warm, concise, natural reply (2-4",
    "sentences) that helps them act next. Use ONLY the facts provided - never invent",
    "mentors, seats, links, tracks, or curriculum.",
    "",
    "User message:",
    message,
    ""
  ];

  if (context && context.status === "success") {
    lines.push(
      "Grounded match (real data you must use):",
      `- Track: ${context.track}`,
      `- Experience level: ${context.level}`,
      `- Mentor to reach out to for guidance and advice: ${context.mentor}`,
      `- First things to focus on: ${(context.week1Actions || []).join("; ")}`,
      "",
      "Encourage them, name the mentor as someone to reach out to for guidance and",
      "advice (not an instructor who teaches), and briefly point at what to start with."
    );
  } else if (context && context.status === "full") {
    const alt = context.alternative;
    lines.push(
      "Grounded situation (real data you must use):",
      `- The ${context.track} track is currently FULL (no mentor seats right now).`,
      alt
        ? `- A real alternative with open capacity: ${alt.mentor} for ${alt.track}.`
        : "- No other mentor currently has open capacity.",
      "- A self-guided starter pack for the requested track is shown below your reply.",
      "",
      "Be honest that the track is full. If an alternative mentor exists, offer them by",
      "name as a genuine option, then mention the self-guided starter pack below."
    );
  } else {
    lines.push(
      "No specific track is established yet.",
      "Invite the user, in one short sentence, to tap one of the track buttons shown",
      "below your message. Do NOT list or name any tracks in your text."
    );
  }

  return lines.join("\n");
}

function buildFallbackReply(message, session, reason = "fallback_response") {
  const context = resolveGroundedContext(message, session);

  if (!context) {
    return {
      reply:
        "I can help you find a mentor and a learning path. Tap one of the tracks " +
          "below to get started, or tell me what you're interested in.",
      source: "fallback",
      reason
    };
  }

  return { ...buildReplyFromContext(context), source: "fallback", reason };
}

function logChatSource(source, reason) {
  console.log(`[chat-source] ${source} (${reason})`);
}

function extractUsage(interaction) {
  const usage = interaction?.usage || {};
  const inputTokens = usage.total_input_tokens || 0;
  const outputTokens = usage.total_output_tokens || 0;
  const totalTokens = usage.total_tokens || inputTokens + outputTokens;

  return { inputTokens, outputTokens, totalTokens };
}

function addUsage(accumulator, interaction) {
  const { inputTokens, outputTokens, totalTokens } = extractUsage(interaction);
  accumulator.inputTokens += inputTokens;
  accumulator.outputTokens += outputTokens;
  accumulator.totalTokens += totalTokens;
}

function createChatService({
  aiClient,
  modelName,
  strictGeminiApi,
  tokenBudget = null,
  thinkingLevel = null,
  maxOutputTokens = null
}) {
  let totalTokensUsed = 0;

  // A thinking model (Gemma 4) spends time generating internal reasoning
  // tokens before answering. Some model variants reject an explicit
  // thinking_level (400 "Thinking budget is not supported"), so it stays
  // off unless GEMMA_THINKING_LEVEL is set for a model that supports it.
  const generationConfig = {
    ...(thinkingLevel ? { thinking_level: thinkingLevel } : {}),
    ...(maxOutputTokens ? { max_output_tokens: maxOutputTokens } : {})
  };
  const hasGenerationConfig = Object.keys(generationConfig).length > 0;

  async function generateReplyInner(message, sessionId, requestUsage) {
    const session = getOrCreateSession(sessionId);

    if (!aiClient) {
      logChatSource("FALLBACK", "missing_api_key");
      return {
        statusCode: 500,
        payload: {
          reply: "GEMINI_API_KEY is not configured on the backend.",
          source: "fallback",
          reason: "missing_api_key"
        }
      };
    }

    try {
      // Resolve the grounded match deterministically up front (mentor, seats,
      // curriculum) - no model call needed. Then hand those real facts to the
      // thinking model in a SINGLE call and let it reason over them to compose
      // a warm, personalized reply, instead of returning a canned template.
      const context = resolveGroundedContext(message, session);

      const interaction = await aiClient.interactions.create({
        model: modelName,
        input: buildComposeInput(message, context),
        system_instruction: buildSystemInstruction(),
        ...(hasGenerationConfig ? { generation_config: generationConfig } : {})
      });

      addUsage(requestUsage, interaction);

      if (!hasUsableInteractionText(interaction)) {
        logChatSource("FALLBACK", "empty_gemma_response");
        return {
          statusCode: 200,
          payload: buildFallbackReply(message, session, "empty_gemma_response")
        };
      }

      const replyText = cleanReplyText(
        extractInteractionText(interaction),
        context?.mentorLink
      );

      if (context) {
        logChatSource("GEMMA", "grounded_compose");
        return {
          statusCode: 200,
          payload: {
            ...buildReplyFromContext(context, replyText),
            decision: {
              track: context.track,
              level: context.level,
              reasoning: null,
              decidedBy: "inference"
            },
            source: "gemini",
            reason: "grounded_compose"
          }
        };
      }

      logChatSource("GEMMA", "compose_no_context");
      return {
        statusCode: 200,
        payload: {
          reply: replyText,
          status: "agent",
          week1Actions: [],
          source: "gemini",
          reason: "compose_no_context"
        }
      };
    } catch (error) {
      console.error("POST /api/chat failed:", error);

      if (strictGeminiApi) {
        logChatSource("GEMMA_ERROR", "strict_mode_error_returned");
        return {
          statusCode: error?.statusCode || error?.status || 500,
          payload: {
            reply:
              error?.message ||
              "Gemini request failed and strict mode is enabled.",
            code: error?.code || "gemini_error",
            statusCode: error?.statusCode || error?.status || 500,
            source: "gemini_error",
            reason: "strict_mode_error_returned"
          }
        };
      }

      logChatSource("FALLBACK", "gemma_request_failed");
      return {
        statusCode: 200,
        payload: buildFallbackReply(message, session, "gemma_request_failed")
      };
    }
  }

  function finalizePayload(payload, requestUsage) {
    totalTokensUsed += requestUsage.totalTokens;
    const tokensLeft =
      tokenBudget != null ? Math.max(tokenBudget - totalTokensUsed, 0) : null;

    return {
      ...payload,
      ...(payload.track ? {} : { trackOptions: getTrackOptions() }),
      usage: {
        requestTokens: requestUsage.totalTokens,
        requestInputTokens: requestUsage.inputTokens,
        requestOutputTokens: requestUsage.outputTokens,
        totalTokensUsed,
        tokenBudget,
        tokensLeft
      }
    };
  }

  async function generateReply(message, sessionId) {
    const requestUsage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
    const result = await generateReplyInner(message, sessionId, requestUsage);
    result.payload = finalizePayload(result.payload, requestUsage);
    return result;
  }

  // Streaming variant of grounded compose: resolve the grounded facts, then
  // stream the thinking model's composed reply token-by-token via onDelta.
  // Returns the finalized payload (reply + cards + usage) once complete.
  async function streamReply(message, sessionId, onDelta) {
    const requestUsage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
    const session = getOrCreateSession(sessionId);

    if (!aiClient) {
      logChatSource("FALLBACK", "missing_api_key");
      return finalizePayload(
        {
          reply: "GEMINI_API_KEY is not configured on the backend.",
          source: "fallback",
          reason: "missing_api_key"
        },
        requestUsage
      );
    }

    const context = resolveGroundedContext(message, session);

    try {
      const stream = await aiClient.interactions.create({
        model: modelName,
        input: buildComposeInput(message, context),
        system_instruction: buildSystemInstruction(),
        stream: true,
        ...(hasGenerationConfig ? { generation_config: generationConfig } : {})
      });

      let rawText = "";
      for await (const event of stream) {
        if (
          event?.event_type === "step.delta" &&
          event.delta?.type === "text" &&
          typeof event.delta.text === "string"
        ) {
          rawText += event.delta.text;
          onDelta(event.delta.text);
        }

        const usage = event?.metadata?.total_usage || event?.interaction?.usage;
        if (usage) {
          requestUsage.inputTokens = usage.total_input_tokens || requestUsage.inputTokens;
          requestUsage.outputTokens = usage.total_output_tokens || requestUsage.outputTokens;
          requestUsage.totalTokens = usage.total_tokens || requestUsage.totalTokens;
        }
      }

      const replyText = cleanReplyText(rawText, context?.mentorLink);

      if (context) {
        logChatSource("GEMMA", "grounded_compose_stream");
        return finalizePayload(
          {
            ...buildReplyFromContext(context, replyText),
            decision: {
              track: context.track,
              level: context.level,
              reasoning: null,
              decidedBy: "inference"
            },
            source: "gemini",
            reason: "grounded_compose_stream"
          },
          requestUsage
        );
      }

      logChatSource("GEMMA", "compose_no_context_stream");
      return finalizePayload(
        {
          reply: replyText,
          status: "agent",
          week1Actions: [],
          source: "gemini",
          reason: "compose_no_context_stream"
        },
        requestUsage
      );
    } catch (error) {
      console.error("POST /api/chat/stream failed:", error);
      logChatSource("FALLBACK", "gemma_request_failed");
      return finalizePayload(
        buildFallbackReply(message, session, "gemma_request_failed"),
        requestUsage
      );
    }
  }

  return { generateReply, streamReply };
}

module.exports = { createChatService };