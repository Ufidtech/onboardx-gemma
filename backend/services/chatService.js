const {
  buildMentorContext,
  checkMentorCapacity,
  inferTrackFromMessage,
  inferLevelFromMessage
} = require("../routes/mentorUtils");
const { generateLearningPath } = require("./learningPathService");

function buildStarterPackUrl(track, level) {
  const params = new URLSearchParams({ track, level }).toString();
  return `/api/resources/starter-pack?${params}`;
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
    "When you call check_mentor_capacity, YOU own the decision: read the user's",
    "free-text message, classify it into exactly one track from the tool's enum,",
    "infer their experience level (beginner or intermediate), and pass a one-sentence",
    "'reasoning' explaining why. If the message already implies a track, decide it",
    "yourself instead of asking the user to pick from a raw list.",
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
    "Current mentor inventory:",
    buildMentorContext()
  ].join("\n");
}

function formatHistory(history) {
  if (!Array.isArray(history)) {
    return "";
  }

  return history
    .filter((turn) => turn && typeof turn.content === "string" && turn.content.trim())
    .map((turn) => {
      const speaker = turn.role === "user" ? "User" : "Assistant";
      return `${speaker}: ${turn.content.trim()}`;
    })
    .join("\n");
}

function inferTrackFromConversation(message, history = []) {
  const current = inferTrackFromMessage(message);
  if (current) {
    return current;
  }

  if (!Array.isArray(history)) {
    return null;
  }

  for (let i = history.length - 1; i >= 0; i -= 1) {
    const turn = history[i];
    if (turn && turn.role === "user" && typeof turn.content === "string") {
      const track = inferTrackFromMessage(turn.content);
      if (track) {
        return track;
      }
    }
  }

  return null;
}

function buildModelInput(message, history = []) {
  const transcript = formatHistory(history);

  return [
    "Use the mentor inventory and app context below to answer the user helpfully.",
    "Prioritize the user goal, the available capacity, and the best next action.",
    "Continue the ongoing conversation naturally. Do not re-ask for information the",
    "user already gave you earlier in the conversation.",
    "",
    "App context:",
    buildMentorContext(),
    ...(transcript ? ["", "Conversation so far:", transcript] : []),
    "",
    "User message:",
    message
  ].join("\n");
}

function buildFallbackReply(message, reason = "fallback_response") {
  const track = inferTrackFromMessage(message);
  const level = inferLevelFromMessage(message);

  if (!track) {
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

  const learningPath = generateLearningPath({ track, level });
  const result = checkMentorCapacity(track);

  if (result.status === "success") {
    return {
      reply: `You’re matched with ${result.mentor} for ${result.track}.`,
      status: "success",
      track: result.track,
      level: learningPath.level,
      mentor: result.mentor,
      mentorLink: result.link,
      week1Actions: learningPath.steps,
      estimatedWeeks: learningPath.estimatedWeeks,
      starterPackUrl: buildStarterPackUrl(result.track, learningPath.level),
      source: "fallback",
      reason
    };
  }

  const altText = result.alternative
    ? ` In the meantime, ${result.alternative.mentor} has open capacity for ${result.alternative.track} if you'd like to explore that instead.`
    : "";

  return {
    reply:
      `That track is currently full.${altText} Download the self-guided starter pack below to keep moving, or ask again later when a seat opens.`,
    status: "full",
    track,
    level: learningPath.level,
    week1Actions: learningPath.steps,
    estimatedWeeks: learningPath.estimatedWeeks,
    starterPackUrl: buildStarterPackUrl(track, learningPath.level),
    alternative: result.alternative || null,
    source: "fallback",
    reason
  };
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
  checkMentorCapacityTool,
  tokenBudget = null
}) {
  let totalTokensUsed = 0;

  async function generateReplyInner(message, history, requestUsage) {
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
        input: buildModelInput(message, history),
        tools: [checkMentorCapacityTool],
        system_instruction: buildSystemInstruction()
      });

      addUsage(requestUsage, interaction);

      const functionCall = extractFunctionCall(interaction);

      if (functionCall) {
        const functionResult = checkMentorCapacity(functionCall.arguments?.track);

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

        addUsage(requestUsage, interaction);

        if (!hasUsableInteractionText(interaction)) {
          logChatSource("FALLBACK", "empty_gemma_response_after_tool");
          return {
            statusCode: 200,
            payload: buildFallbackReply(message, "empty_gemma_response_after_tool")
          };
        }

        const decidedLevel =
          functionCall.arguments?.level === "intermediate"
            ? "intermediate"
            : functionCall.arguments?.level === "beginner"
              ? "beginner"
              : inferLevelFromMessage(message);
        const learningPath = generateLearningPath({
          track: functionResult.track,
          level: decidedLevel
        });
        const decision = {
          track: functionResult.track,
          level: learningPath.level,
          reasoning: functionCall.arguments?.reasoning || null,
          decidedBy: "gemma"
        };

        if (functionResult.status === "success") {
          logChatSource("GEMMA", "tool_call_success_response");
          return {
            statusCode: 200,
            payload: {
              reply: extractInteractionText(interaction),
              status: functionResult.status,
              track: functionResult.track,
              level: learningPath.level,
              mentor: functionResult.mentor,
              mentorLink: functionResult.link,
              week1Actions: learningPath.steps,
              estimatedWeeks: learningPath.estimatedWeeks,
              starterPackUrl: buildStarterPackUrl(functionResult.track, learningPath.level),
              decision,
              source: "gemini",
              reason: "tool_call_success_response"
            }
          };
        }

        logChatSource("GEMMA", "tool_call_full_response");
        return {
          statusCode: 200,
          payload: {
            reply: extractInteractionText(interaction),
            status: functionResult.status,
            track: functionResult.track,
            level: learningPath.level,
            week1Actions: learningPath.steps,
            estimatedWeeks: learningPath.estimatedWeeks,
            starterPackUrl: buildStarterPackUrl(functionResult.track, learningPath.level),
            alternative: functionResult.alternative || null,
            decision,
            source: "gemini",
            reason: "tool_call_full_response"
          }
        };
      }

      if (!hasUsableInteractionText(interaction)) {
        logChatSource("FALLBACK", "empty_gemma_response_no_tool");
        return {
          statusCode: 200,
          payload: buildFallbackReply(message, "empty_gemma_response_no_tool")
        };
      }

      // Gemma answered directly without calling check_mentor_capacity this turn.
      // Don't rely on the model choosing to call the tool every time - if we can
      // infer a track from the message ourselves, still attach real, grounded
      // data (mentor link or starter pack) instead of leaving the user with only
      // whatever Gemma improvised in plain text.
      const inferredTrack = inferTrackFromConversation(message, history);

      if (inferredTrack) {
        const level = inferLevelFromMessage(message);
        const learningPath = generateLearningPath({ track: inferredTrack, level });
        const result = checkMentorCapacity(inferredTrack);
        const decision = {
          track: inferredTrack,
          level: learningPath.level,
          reasoning: null,
          decidedBy: "fallback_inference"
        };

        logChatSource("GEMMA", "direct_response_grounded");

        if (result.status === "success") {
          return {
            statusCode: 200,
            payload: {
              reply: extractInteractionText(interaction),
              status: result.status,
              track: result.track,
              level: learningPath.level,
              mentor: result.mentor,
              mentorLink: result.link,
              week1Actions: learningPath.steps,
              estimatedWeeks: learningPath.estimatedWeeks,
              starterPackUrl: buildStarterPackUrl(result.track, learningPath.level),
              decision,
              source: "gemini",
              reason: "direct_response_grounded"
            }
          };
        }

        return {
          statusCode: 200,
          payload: {
            reply: extractInteractionText(interaction),
            status: result.status,
            track: inferredTrack,
            level: learningPath.level,
            week1Actions: learningPath.steps,
            estimatedWeeks: learningPath.estimatedWeeks,
            starterPackUrl: buildStarterPackUrl(inferredTrack, learningPath.level),
            alternative: result.alternative || null,
            decision,
            source: "gemini",
            reason: "direct_response_grounded"
          }
        };
      }

      logChatSource("GEMMA", "direct_response");
      return {
        statusCode: 200,
        payload: {
          reply: extractInteractionText(interaction),
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
        payload: buildFallbackReply(message, "gemma_request_failed")
      };
    }
  }

  async function generateReply(message, history = []) {
    const requestUsage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
    const result = await generateReplyInner(message, history, requestUsage);

    totalTokensUsed += requestUsage.totalTokens;
    const tokensLeft =
      tokenBudget != null ? Math.max(tokenBudget - totalTokensUsed, 0) : null;

    result.payload = {
      ...result.payload,
      usage: {
        requestTokens: requestUsage.totalTokens,
        requestInputTokens: requestUsage.inputTokens,
        requestOutputTokens: requestUsage.outputTokens,
        totalTokensUsed,
        tokenBudget,
        tokensLeft
      }
    };

    return result;
  }

  return { generateReply };
}

module.exports = { createChatService };