const express = require("express");
const { getMentorSnapshot } = require("./mentorUtils");

function createMentorsRouter() {
  const router = express.Router();

  router.get("/mentors", (_req, res) => {
    res.json({ mentors: getMentorSnapshot() });
  });

  router.get("/tracks", (_req, res) => {
    res.json({
      tracks: getMentorSnapshot().map((mentor) => ({
        track: mentor.track,
        mentor: mentor.name,
        seatsAvailable: mentor.seatsAvailable,
        contactLink: mentor.contactLink
      }))
    });
  });

  return router;
}

module.exports = { createMentorsRouter };
