const express = require("express");
const { createChatService } = require("../services/chatService");
const { createChatController } = require("../controllers/chatController");

function createChatRouter({
  aiClient,
  modelName,
  strictGeminiApi,
  includeSource,
  checkMentorCapacityTool,
  tokenBudget,
  thinkingLevel,
  maxOutputTokens
}) {
  const router = express.Router();

  const chatService = createChatService({
    aiClient,
    modelName,
    strictGeminiApi,
    includeSource,
    checkMentorCapacityTool,
    tokenBudget,
    thinkingLevel,
    maxOutputTokens
  });
  const postChat = createChatController({ chatService });

  router.post("/chat", postChat);

  // Streaming variant: server-sent events so the composed reply appears
  // token-by-token in the UI instead of arriving all at once.
  router.post("/chat/stream", async (req, res) => {
    const { message, sessionId } = req.body || {};

    if (!message || typeof message !== "string") {
      return res
        .status(400)
        .json({ reply: "Please provide a message field in the request body." });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

    try {
      const payload = await chatService.streamReply(message, sessionId, (delta) => {
        send({ type: "delta", text: delta });
      });
      send({ type: "done", payload });
    } catch (error) {
      console.error("POST /api/chat/stream handler failed:", error);
      send({
        type: "done",
        payload: {
          reply: "Connection error. Please try again.",
          source: "fallback",
          reason: "stream_failed"
        }
      });
    }

    res.end();
  });

  return router;
}

module.exports = { createChatRouter };
