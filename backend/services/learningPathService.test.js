const test = require("node:test");
const assert = require("node:assert/strict");
const {
  generateStarterPackMarkdown,
  generateStarterPackFilename,
  generateStarterPackPdf
} = require("./starterPackService");

test("generates 4 distinct weeks of real content, not just titles", () => {
  const markdown = generateStarterPackMarkdown({ track: "Frontend", level: "beginner" });
  const weekHeadingCount = (markdown.match(/^## Week \d/gm) || []).length;
  assert.equal(weekHeadingCount, 4);
  assert.ok(markdown.includes("**Resources:**"));
  assert.ok(markdown.includes("**This week's task:**"));
});

test("beginner and intermediate packs differ for the same track", () => {
  const beginner = generateStarterPackMarkdown({ track: "Backend", level: "beginner" });
  const intermediate = generateStarterPackMarkdown({ track: "Backend", level: "intermediate" });
  assert.notEqual(beginner, intermediate);
});

test("falls back to sensible defaults for unknown track/level", () => {
  const markdown = generateStarterPackMarkdown({ track: "Not Real", level: "expert" });
  assert.ok(markdown.startsWith("# Frontend Starter Pack (beginner)"));
});

test("filename is a safe, lowercase, hyphenated .pdf slug", () => {
  const filename = generateStarterPackFilename({ track: "Project Management", level: "intermediate" });
  assert.equal(filename, "project-management-intermediate-starter-pack.pdf");
});

test("filename strips unsafe characters like slashes from track names", () => {
  const filename = generateStarterPackFilename({ track: "AI / Machine Learning", level: "beginner" });
  assert.equal(filename, "ai-machine-learning-beginner-starter-pack.pdf");
  assert.ok(!filename.includes("/"), "filename must never contain a literal slash");
});

test("generates a real, non-empty PDF buffer with a valid PDF header", async () => {
  const buffer = await generateStarterPackPdf({ track: "Frontend", level: "beginner" });
  assert.ok(Buffer.isBuffer(buffer));
  assert.ok(buffer.length > 500);
  assert.equal(buffer.subarray(0, 5).toString(), "%PDF-");
});

test("PDF generation works for every known track/level combination", async () => {
  const tracks = [
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
  const levels = ["beginner", "intermediate"];

  for (const track of tracks) {
    for (const level of levels) {
      const buffer = await generateStarterPackPdf({ track, level });
      assert.ok(buffer.length > 500, `${track}/${level} produced a suspiciously small PDF`);
    }
  }
});