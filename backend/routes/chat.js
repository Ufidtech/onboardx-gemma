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
  fastReply,
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
    fastReply,
    maxOutputTokens
  });
  const postChat = createChatController({ chatService });

  router.post("/chat", postChat);

  return router;
}

module.exports = { createChatRouter };
