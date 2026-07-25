const {
  buildMentorContext,
  checkMentorCapacity,
  inferTrackFromMessage,
  inferLevelFromMessage
} = require("../routes/mentorUtils");
const { generateLearningPath } = require("./learningPathService");

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
    "If a track is full, recommend the self-guided path.",
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

function buildFallbackReply(message, reason = "fallback_response") {
  const track = inferTrackFromMessage(message);
  const level = inferLevelFromMessage(message);

  if (!track) {
    return {
      reply:
        "I can help with Frontend, Backend, or Project Management. Tell me which track you want and I’ll match you with the right mentor.",
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
      source: "fallback",
      reason
    };
  }

  return {
    reply:
      "That track is currently full. Use the self-guided path below to continue, or ask again later when a seat opens.",
    status: "full",
    track,
    level: learningPath.level,
    week1Actions: learningPath.steps,
    estimatedWeeks: learningPath.estimatedWeeks,
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

function createChatService({
  aiClient,
  modelName,
  strictGeminiApi,
  checkMentorCapacityTool
}) {
  async function generateReply(message) {
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

        if (!hasUsableInteractionText(interaction)) {
          logChatSource("FALLBACK", "empty_gemma_response_after_tool");
          return {
            statusCode: 200,
            payload: buildFallbackReply(message, "empty_gemma_response_after_tool")
          };
        }

        const learningPath = generateLearningPath({
          track: functionResult.track,
          level: inferLevelFromMessage(message)
        });

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

  return { generateReply };
}

module.exports = { createChatService };
