const express = require("express");

function createHealthRouter({ modelName }) {
  const router = express.Router();

  router.get("/health", (_req, res) => {
    res.json({ ok: true, model: modelName });
  });

  return router;
}

module.exports = { createHealthRouter };
