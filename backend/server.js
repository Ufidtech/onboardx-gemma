const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");
const { checkMentorCapacityTool } = require("./agent");
const { createApiRouter } = require("./routes");

dotenv.config();

const PORT = Number(process.env.PORT) || 4000;
const MODEL_NAME = process.env.GEMMA_MODEL || "gemma-4-26b-a4b-it";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const STRICT_GEMINI_API = process.env.GEMINI_STRICT === "true";
const INCLUDE_SOURCE = process.env.GEMINI_DEBUG_SOURCE === "true";

const app = express();

app.use(cors());
app.use(express.json());

let aiClient = null;
if (GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
}

app.use(
  "/api",
  createApiRouter({
    aiClient,
    modelName: MODEL_NAME,
    strictGeminiApi: STRICT_GEMINI_API,
    includeSource: INCLUDE_SOURCE,
    checkMentorCapacityTool
  })
);

app.listen(PORT, () => {
  console.log(`OnboardX backend running on port ${PORT}`);
});
