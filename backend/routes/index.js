const express = require("express");
const { createHealthRouter } = require("./health");
const { createMentorsRouter } = require("./mentors");
const { createChatRouter } = require("./chat");

function createApiRouter(deps) {
  const router = express.Router();

  router.use(createHealthRouter({ modelName: deps.modelName }));
  router.use(createMentorsRouter());
  router.use(
    createChatRouter({
      aiClient: deps.aiClient,
      modelName: deps.modelName,
      strictGeminiApi: deps.strictGeminiApi,
      includeSource: deps.includeSource,
      checkMentorCapacityTool: deps.checkMentorCapacityTool
    })
  );

  return router;
}

module.exports = { createApiRouter };
