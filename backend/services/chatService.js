const {
  buildMentorContext,
  checkMentorCapacity,
  inferTrackFromMessage,
  inferLevelFromMessage
} = require("../routes/mentorUtils");
const { generateLearningPath } = require("./learningPathService");
const { getOrCreateSession } = require("./sessionService");

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
function resolveGroundedContext(message, session, explicitTrack) {
  const inferredTrack = explicitTrack || inferTrackFromMessage(message);
  const isNewOrPivot = inferredTrack && inferredTrack !== session.track;

  if (isNewOrPivot) {
    const level = inferLevelFromMessage(message);
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
    "Think through the user's message internally and use the mentor inventory below to choose the most useful next step.",
    "Do not reveal private chain-of-thought. Give a concise answer that helps the user act quickly.",
    "If the user is vague, ask exactly one clarifying question.",
    "If the user wants a track with available seats, call check_mentor_capacity.",
    "IMPORTANT - mentor framing: mentors are experienced community members who offer",
    "guidance, answer questions, and point the mentee in the right direction. They are",
    "NOT formal instructors running lessons or teaching a curriculum. Always frame a",
    "mentor match as 'someone to talk to for guidance and advice', never as 'someone",
    "who will teach you' or 'your instructor'. The actual learning happens through the",
    "self-guided track content; the mentor is community support alongside it.",
    "If check_mentor_capacity returns status 'success', that means the CURRENT user has",
    "just been matched successfully - say so plainly and do not contradict it by talking",
    "about remaining seat counts. If a track is full, check whether the result includes",
    "an 'alternative' mentor in a different track with real open capacity. If it does,",
    "name that mentor and track as a genuine option before mentioning the self-guided",
    "starter pack - do not present the alternative as the same track, and do not invent",
    "an alternative yourself if the tool result did not provide one.",
    "If the user has already been matched earlier in this conversation and asks a",
    "follow-up question that doesn't mention a track, just answer their question - you",
    "do not need to call check_mentor_capacity again for the same track.",
    "FORMATTING: this is a plain-text chat bubble, not a markdown renderer. Never use",
    "**bold**, *italics*, markdown headers, or bullet dashes in your reply - write plain,",
    "natural sentences only. Never write out the mentor's raw WhatsApp link yourself -",
    "the app already displays it in its own dedicated link button, so just refer to the",
    "mentor by name (e.g. 'reach out to Priya') instead of repeating the URL.",
    "Current mentor inventory:",
    buildMentorContext()
  ].join("\n");
}

function buildModelInput(message) {
  return [
    "Use the mentor inventory and app context below to answer the user helpfully.",
    "Prioritize the user goal, the available capacity, and the best next action.",
    "",
    "App context:",
    buildMentorContext(),
    "",
    "User message:",
    message
  ].join("\n");
}

function buildFallbackReply(message, session, reason = "fallback_response") {
  const context = resolveGroundedContext(message, session);

  if (!context) {
    return {
      reply:
        "I can help you find a mentor and a learning path across Frontend, Backend, " +
          "Project Management, Cloud Computing, Data Analytics, AI/Machine Learning, " +
          "Android/Mobile Development, UI/UX Design, Cybersecurity, DevOps/SRE, IT " +
          "Support, or Digital Marketing. Tell me which one you're interested in.",
      source: "fallback",
      reason
    };
  }

  return { ...buildReplyFromContext(context), source: "fallback", reason };
}

function logChatSource(source, reason) {
  console.log(`[chat-source] ${source} (${reason})`);
}

function extractFunctionCall(interaction) {
  const fromOutputs = (interaction?.outputs || []).find(
    (output) =>
      output.type === "function_call" && output.name === "check_mentor_capacity"
  );

  if (fromOutputs) {
    return fromOutputs;
  }

  const fromSteps = (interaction?.steps || []).find(
    (step) =>
      step.type === "function_call" && step.name === "check_mentor_capacity"
  );

  return fromSteps || null;
}

function createChatService({
  aiClient,
  modelName,
  strictGeminiApi,
  checkMentorCapacityTool
}) {
  async function generateReply(message, sessionId) {
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
      let interaction = await aiClient.interactions.create({
        model: modelName,
        input: buildModelInput(message),
        tools: [checkMentorCapacityTool],
        system_instruction: buildSystemInstruction()
      });

      const functionCall = extractFunctionCall(interaction);

      if (functionCall) {
        // Gemma explicitly asked to check a track. Reuse the session's
        // existing match if it's the same track (avoids re-decrementing a
        // seat for someone already matched), otherwise compute fresh.
        const requestedTrack = functionCall.arguments?.track;
        const context = resolveGroundedContext(message, session, requestedTrack);
        const functionResult = context
          ? {
              status: context.status,
              track: context.track,
              mentor: context.mentor,
              link: context.mentorLink,
              alternative: context.alternative
            }
          : checkMentorCapacity(requestedTrack);

        interaction = await aiClient.interactions.create({
          model: modelName,
          previous_interaction_id: interaction.id,
          input: [
            {
              type: "function_result",
              name: functionCall.name,
              call_id: functionCall.id,
              result: functionResult
            }
          ]
        });

        if (!hasUsableInteractionText(interaction)) {
          logChatSource("FALLBACK", "empty_gemma_response_after_tool");
          return {
            statusCode: 200,
            payload: buildFallbackReply(message, session, "empty_gemma_response_after_tool")
          };
        }

        const replyText = cleanReplyText(extractInteractionText(interaction), context?.mentorLink);

        if (context) {
          logChatSource(
            "GEMMA",
            context.status === "success" ? "tool_call_success_response" : "tool_call_full_response"
          );
          return {
            statusCode: 200,
            payload: {
              ...buildReplyFromContext(context, replyText),
              source: "gemini",
              reason:
                context.status === "success" ? "tool_call_success_response" : "tool_call_full_response"
            }
          };
        }

        logChatSource("GEMMA", "tool_call_no_context");
        return {
          statusCode: 200,
          payload: {
            reply: replyText,
            status: "agent",
            week1Actions: [],
            source: "gemini",
            reason: "tool_call_no_context"
          }
        };
      }

      if (!hasUsableInteractionText(interaction)) {
        logChatSource("FALLBACK", "empty_gemma_response_no_tool");
        return {
          statusCode: 200,
          payload: buildFallbackReply(message, session, "empty_gemma_response_no_tool")
        };
      }

      // Gemma answered directly without calling check_mentor_capacity this
      // turn. Ground it from the message OR, importantly, from the
      // session's already-established track - so a follow-up question
      // that doesn't repeat the track's name still keeps its mentor
      // link/curriculum attached instead of silently losing them.
      const context = resolveGroundedContext(message, session);
      const replyText = cleanReplyText(extractInteractionText(interaction), context?.mentorLink);

      if (context) {
        logChatSource("GEMMA", "direct_response_grounded");
        return {
          statusCode: 200,
          payload: {
            ...buildReplyFromContext(context, replyText),
            source: "gemini",
            reason: "direct_response_grounded"
          }
        };
      }

      logChatSource("GEMMA", "direct_response");
      return {
        statusCode: 200,
        payload: {
          reply: replyText,
          status: "agent",
          week1Actions: [],
          source: "gemini",
          reason: "direct_response"
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

  return { generateReply };
}

module.exports = { createChatService };