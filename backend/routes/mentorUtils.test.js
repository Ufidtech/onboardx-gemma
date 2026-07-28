const test = require("node:test");
const assert = require("node:assert/strict");
const { checkMentorCapacity, findBestAlternativeMentor, inferTrackFromMessage } = require("./mentorUtils");

// Note: these tests only exercise the "full" path deliberately, since
// checkMentorCapacity mutates real seat counts on success, and other test
// files in this suite share the same in-process mentor data.
//
// Current seed data (database.js) has Tunde/Data Analytics as the mentor
// with the most free capacity (4 seats) - so that's the expected "best
// alternative" winner whenever Data Analytics itself isn't excluded.

test("suggests a real alternative mentor when the requested track is full", () => {
  // Project Management (David) is seeded with 0 seats in database.js
  const result = checkMentorCapacity("Project Management");

  assert.equal(result.status, "full");
  assert.ok(result.alternative, "expected an alternative mentor to be suggested");
  assert.notEqual(result.alternative.track.toLowerCase(), "project management");
  assert.ok(result.alternative.seatsAvailable > 0);
});

test("alternative suggestion prefers the mentor with the most free capacity", () => {
  // Tunde/Data Analytics has 4 seats, the most of any mentor - should win
  // whenever Data Analytics itself isn't the excluded track.
  const alternative = findBestAlternativeMentor("project management");

  assert.ok(alternative);
  assert.equal(alternative.track, "Data Analytics");
});

test("falls back to the next-best mentor when the top one is excluded", () => {
  // Excluding Data Analytics itself, Alex/Backend (3 seats) should win next.
  const alternative = findBestAlternativeMentor("data analytics");

  assert.ok(alternative);
  assert.equal(alternative.track, "Backend");
});

test("never suggests the same track as the alternative", () => {
  const result = checkMentorCapacity("Project Management");
  if (result.alternative) {
    assert.notEqual(result.alternative.track, "Project Management");
  }
});

test("prefers the LAST-mentioned track over an earlier passing mention", () => {
  // A passing mention of "cloud computing" (about a cousin's job) should
  // lose to the person's actual, later-stated interest in frontend - not
  // win just because Cloud Computing happens to be first in the priority
  // array. This is a real scenario found during testing: users ramble.
  const result = inferTrackFromMessage(
    "my cousin does cloud computing and honestly frontend maybe"
  );
  assert.equal(result, "Frontend");
});

test("picks the later track when pivoting mid-sentence", () => {
  const result = inferTrackFromMessage("I did backend before but now I want frontend");
  assert.equal(result, "Frontend");
});

test("infers each of the 12 supported tracks from natural phrasing", () => {
  const cases = [
    ["I want to learn frontend development", "Frontend"],
    ["interested in backend work", "Backend"],
    ["can you teach me project management", "Project Management"],
    ["I'd like to get into cloud computing", "Cloud Computing"],
    ["looking to learn data analytics", "Data Analytics"],
    ["I want to study machine learning", "AI / Machine Learning"],
    ["interested in android development", "Android / Mobile Development"],
    ["I want to learn ux design", "UI/UX Design"],
    ["can I learn cybersecurity", "Cybersecurity"],
    ["I'm curious about devops", "DevOps / SRE"],
    ["I want to get into it support", "IT Support"],
    ["teach me digital marketing", "Digital Marketing"]
  ];

  for (const [message, expectedTrack] of cases) {
    assert.equal(inferTrackFromMessage(message), expectedTrack, `failed for: "${message}"`);
  }
});

test("does not false-positive on short ambiguous words like 'ai' or 'ui' inside other words", () => {
  assert.equal(inferTrackFromMessage("wait, can you explain that again"), null);
  assert.equal(inferTrackFromMessage("please guide me and build my confidence"), null);
});