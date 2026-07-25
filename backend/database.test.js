const test = require("node:test");
const assert = require("node:assert/strict");
const { mentors } = require("./database");

test("mentors database is seeded", () => {
  assert.ok(Array.isArray(mentors));
  assert.ok(mentors.length > 0);
});

test("every mentor record includes required fields", () => {
  for (const mentor of mentors) {
    assert.equal(typeof mentor.name, "string");
    assert.equal(typeof mentor.track, "string");
    assert.equal(typeof mentor.seatsAvailable, "number");
    assert.equal(typeof mentor.contactLink, "string");
  }
});
