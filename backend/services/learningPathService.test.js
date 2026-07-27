const test = require("node:test");
const assert = require("node:assert/strict");
const { generateLearningPath, listAvailableTracks } = require("./learningPathService");

test("generates a distinct path for each known track", () => {
  const tracks = listAvailableTracks();
  assert.ok(tracks.length >= 3);

  const paths = tracks.map((track) => generateLearningPath({ track, level: "beginner" }));
  const stepSets = paths.map((p) => JSON.stringify(p.steps));

  // no two tracks should produce identical content
  assert.equal(new Set(stepSets).size, stepSets.length);
});

test("beginner and intermediate paths differ for the same track", () => {
  const beginner = generateLearningPath({ track: "Frontend", level: "beginner" });
  const intermediate = generateLearningPath({ track: "Frontend", level: "intermediate" });

  assert.notDeepEqual(beginner.steps, intermediate.steps);
});

test("falls back to sensible defaults for unknown track/level", () => {
  const result = generateLearningPath({ track: "Not A Real Track", level: "expert" });

  assert.equal(result.track, "Frontend");
  assert.equal(result.level, "beginner");
  assert.ok(Array.isArray(result.steps));
  assert.ok(result.steps.length > 0);
});

test("all 12 supported tracks are present", () => {
  const tracks = listAvailableTracks();
  const expected = [
    "Frontend",
    "Backend",
    "Project Management",
    "Cloud Computing",
    "Data Analytics",
    "AI / Machine Learning",
    "Android / Mobile Development",
    "UI/UX Design",
    "Cybersecurity",
    "DevOps / SRE",
    "IT Support",
    "Digital Marketing"
  ];

  assert.equal(tracks.length, 12);
  for (const track of expected) {
    assert.ok(tracks.includes(track), `missing track: ${track}`);
  }
});

test("estimatedWeeks matches the number of steps", () => {
  const result = generateLearningPath({ track: "Backend", level: "intermediate" });
  assert.equal(result.estimatedWeeks, result.steps.length);
});
