const express = require("express");
const {
  generateStarterPackPdf,
  generateStarterPackFilename
} = require("../services/starterPackService");

function createResourcesRouter() {
  const router = express.Router();

  router.get("/resources/starter-pack", async (req, res) => {
    const { track, level } = req.query;

    try {
      const pdfBuffer = await generateStarterPackPdf({ track, level });
      const filename = generateStarterPackFilename({ track, level });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(pdfBuffer);
    } catch (err) {
      res.status(500).json({ error: "Failed to generate starter pack PDF." });
    }
  });

  return router;
}

module.exports = { createResourcesRouter };