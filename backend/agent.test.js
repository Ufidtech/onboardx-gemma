const test = require("node:test");
const assert = require("node:assert/strict");
const { checkMentorCapacityTool } = require("./agent");

test("checkMentorCapacityTool exposes expected function schema", () => {
  assert.equal(checkMentorCapacityTool.type, "function");
  assert.equal(checkMentorCapacityTool.name, "check_mentor_capacity");
  assert.equal(checkMentorCapacityTool.parameters.type, "object");
  assert.deepEqual(checkMentorCapacityTool.parameters.required, ["track"]);
});

test("checkMentorCapacityTool supports all expected tracks", () => {
  assert.deepEqual(checkMentorCapacityTool.parameters.properties.track.enum, [
    "Frontend",
    "Backend",
    "Project Management",
  ]);
});
