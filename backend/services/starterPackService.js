/**
 * Generates a real, downloadable 4-week self-guided starter pack for users
 * whose chosen track has no open mentor seats. This replaces the previous
 * behavior of just repeating the same short milestone titles used for the
 * "week1Actions" chat bullets - this is meant to actually stand on its own
 * as something a mentee reads and works through without a mentor.
 */

const STARTER_PACKS = {
  Frontend: {
    beginner: [
      {
        title: "Week 1 — Foundations",
        focus: "HTML, CSS, and responsive layout basics.",
        resources: [
          "web.dev: Learn HTML — https://web.dev/learn/html",
          "web.dev: Learn CSS — https://web.dev/learn/css",
          "web.dev: Learn Responsive Design — https://web.dev/learn/design"
        ],
        task: "Build a static one-page personal profile using only HTML and CSS (no JavaScript yet)."
      },
      {
        title: "Week 2 — JavaScript Fundamentals",
        focus: "Core JavaScript (ES6+): variables, functions, arrays, objects, DOM basics.",
        resources: [
          "web.dev: Learn JavaScript — https://web.dev/learn/javascript",
          "Google's JavaScript style guide — https://google.github.io/styleguide/jsguide.html"
        ],
        task: "Add interactivity to last week's profile page: a button that changes text, a simple form with validation."
      },
      {
        title: "Week 3 — A Modern Web App",
        focus: "Components and state management in a modern frontend framework.",
        resources: [
          "web.dev: Learn PWA / modern app basics — https://web.dev/learn/pwa",
          "Google Codelabs (search 'web') — https://codelabs.developers.google.com/"
        ],
        task: "Rebuild your profile page as a small component-based app with at least 2 components."
      },
      {
        title: "Week 4 — Ship Something with Firebase",
        focus: "Deploying a real, working small app on Google infrastructure.",
        resources: [
          "Firebase Hosting quickstart — https://firebase.google.com/docs/hosting",
          "web.dev: Lighthouse performance checks — https://web.dev/measure"
        ],
        task: "Deploy your app on Firebase Hosting, run a Lighthouse audit, and share both the link and score in the GDGoC channel."
      }
    ],
    intermediate: [
      {
        title: "Week 1 — Component Architecture",
        focus: "Advanced component composition and state patterns.",
        resources: [
          "web.dev: Learn PWA advanced patterns — https://web.dev/learn/pwa",
          "Google's Web Fundamentals architecture articles — https://web.dev/explore/learn"
        ],
        task: "Refactor an existing project to remove prop drilling using a shared state pattern or context."
      },
      {
        title: "Week 2 — TypeScript",
        focus: "Typing components, props, and app state properly.",
        resources: [
          "TypeScript handbook (used across Google's own OSS projects) — https://www.typescriptlang.org/docs/handbook/intro.html",
          "Google's TypeScript style guide — https://google.github.io/styleguide/tsguide.html"
        ],
        task: "Convert a small existing component file to TypeScript."
      },
      {
        title: "Week 3 — Performance & Testing",
        focus: "Auditing and improving real-world performance.",
        resources: [
          "web.dev: Lighthouse & Core Web Vitals — https://web.dev/explore/vitals",
          "web.dev: Performance patterns — https://web.dev/explore/fast"
        ],
        task: "Run a Lighthouse audit on a real project, fix the top 3 flagged issues, and re-measure."
      },
      {
        title: "Week 4 — Contribute or Compete",
        focus: "Applying your skills to something real.",
        resources: [
          "Google Solution Challenge — https://developers.google.com/community/gdsc-solution-challenge",
          "'good first issue' search on GitHub for frontend projects"
        ],
        task: "Join or start a Solution Challenge team, or open a pull request on a real open-source frontend repo."
      }
    ]
  },
  Backend: {
    beginner: [
      {
        title: "Week 1 — Node & JavaScript Runtime",
        focus: "How Node.js works, npm, running scripts.",
        resources: [
          "Node.js official 'Learn' docs — https://nodejs.org/en/learn",
          "Google Codelabs (search 'node') — https://codelabs.developers.google.com/"
        ],
        task: "Write a small CLI script (e.g. a to-do list) that runs entirely in the terminal."
      },
      {
        title: "Week 2 — Building REST APIs",
        focus: "Express basics, or Google Cloud Functions as a serverless alternative.",
        resources: [
          "Express.js official guide — https://expressjs.com/en/starter/guide.html",
          "Cloud Functions for Firebase quickstart — https://firebase.google.com/docs/functions/get-started"
        ],
        task: "Build a simple REST API for the to-do list from week 1 with GET/POST/DELETE routes."
      },
      {
        title: "Week 3 — Databases",
        focus: "Storing real data with a Google-managed database.",
        resources: [
          "Firestore quickstart — https://firebase.google.com/docs/firestore/quickstart",
          "Cloud SQL basics — https://cloud.google.com/sql/docs"
        ],
        task: "Persist your to-do API's data in Firestore instead of an in-memory array."
      },
      {
        title: "Week 4 — Deploy on Google Cloud",
        focus: "Getting a backend live and reachable using Google's free tier.",
        resources: [
          "Cloud Run quickstart — https://cloud.google.com/run/docs/quickstarts",
          "Google Cloud free tier overview — https://cloud.google.com/free"
        ],
        task: "Deploy your API on Cloud Run and test it with a tool like Postman or curl."
      }
    ],
    intermediate: [
      {
        title: "Week 1 — API Design & Versioning",
        focus: "Designing clean, versioned, RESTful APIs the way Google does internally.",
        resources: [
          "Google API Design Guide — https://docs.cloud.google.com/apis/design"
        ],
        task: "Redesign an existing API of yours following the Google API Design Guide's resource-oriented conventions."
      },
      {
        title: "Week 2 — Database Performance",
        focus: "Indexing and query optimization on managed Google databases.",
        resources: [
          "Firestore indexing — https://firebase.google.com/docs/firestore/query-data/indexing",
          "Cloud SQL query insights — https://cloud.google.com/sql/docs/mysql/using-query-insights"
        ],
        task: "Profile a slow query in one of your projects and add an index to speed it up."
      },
      {
        title: "Week 3 — Caching & Rate Limiting",
        focus: "Protecting and speeding up your API with managed infrastructure.",
        resources: [
          "Memorystore (managed Redis) — https://cloud.google.com/memorystore/docs/redis",
          "Cloud Armor rate limiting — https://cloud.google.com/armor/docs/rate-limiting-overview"
        ],
        task: "Add rate limiting and one caching layer to an existing API project."
      },
      {
        title: "Week 4 — Testing & CI",
        focus: "Automated tests and continuous integration for backend code.",
        resources: [
          "Cloud Build quickstart — https://cloud.google.com/build/docs/quickstarts",
          "Node's built-in test runner docs — https://nodejs.org/api/test.html"
        ],
        task: "Add a test suite and a CI pipeline (Cloud Build or GitHub Actions) that runs it on every push."
      }
    ]
  },
  "Project Management": {
    beginner: [
      {
        title: "Week 1 — Agile & Scrum Basics",
        focus: "Core Agile principles and what makes teams effective.",
        resources: [
          "Google re:Work — Guide: Understand team effectiveness — https://rework.withgoogle.com/intl/en/guides/understand-team-effectiveness",
          "scrum.org 'Learn Scrum' free guide — https://www.scrum.org/resources/what-is-scrum"
        ],
        task: "Write a one-page summary of what makes a team effective, using Google's re:Work research as a reference."
      },
      {
        title: "Week 2 — Writing User Stories",
        focus: "Clear backlogs and acceptance criteria for a real project idea.",
        resources: [
          "Google Design Sprint kit — https://designsprintkit.withgoogle.com/"
        ],
        task: "Write 10 user stories with acceptance criteria for a Solution Challenge-style project idea."
      },
      {
        title: "Week 3 — Running Ceremonies",
        focus: "Standups, sprint planning, and Google's own Design Sprint method.",
        resources: [
          "Design Sprint methodology — https://designsprintkit.withgoogle.com/methodology"
        ],
        task: "Draft an agenda for a standup, a sprint planning session, and a 1-day Design Sprint."
      },
      {
        title: "Week 4 — Practice a Real Sprint",
        focus: "Applying everything to a real GDGoC project.",
        resources: [
          "Google Solution Challenge — https://developers.google.com/community/gdsc-solution-challenge",
          "Google Sheets or Google Tasks for tracking (any Workspace account)"
        ],
        task: "Run one full simulated sprint end-to-end for a Solution Challenge team idea, tracked in Google Sheets or Tasks."
      }
    ],
    intermediate: [
      {
        title: "Week 1 — Stakeholder Management",
        focus: "Communicating with and managing expectations of stakeholders.",
        resources: [
          "Google re:Work — Guides on manager effectiveness — https://rework.withgoogle.com/intl/en/guides/"
        ],
        task: "Draft a stakeholder communication plan for a project you've worked on."
      },
      {
        title: "Week 2 — Risk Management",
        focus: "Identifying and mitigating project risks.",
        resources: [
          "PMI's free risk management articles — https://www.pmi.org/learning/library"
        ],
        task: "Build a risk register for a real or hypothetical GDGoC project with mitigation plans."
      },
      {
        title: "Week 3 — Metrics That Matter",
        focus: "Tracking velocity and progress with real dashboards.",
        resources: [
          "Looker Studio (free Google dashboard tool) — https://lookerstudio.google.com/"
        ],
        task: "Build a simple burndown or progress dashboard for a sample two-week sprint in Looker Studio."
      },
      {
        title: "Week 4 — Lead Something",
        focus: "Applying PM skills in a real, visible GDGoC role.",
        resources: [
          "Google Developer Program — Community and Events — https://developers.google.com/community"
        ],
        task: "Volunteer to run one real standup or retro for a GDGoC project team, or lead a Solution Challenge sub-team."
      }
    ]
  }
};

const PDFDocument = require("pdfkit");

const DEFAULT_TRACK = "Frontend";
const DEFAULT_LEVEL = "beginner";

function resolveStarterPack({ track, level }) {
  const normalizedTrack = STARTER_PACKS[track] ? track : DEFAULT_TRACK;
  const normalizedLevel = level === "intermediate" ? "intermediate" : DEFAULT_LEVEL;
  return {
    track: normalizedTrack,
    level: normalizedLevel,
    weeks: STARTER_PACKS[normalizedTrack][normalizedLevel]
  };
}

function generateStarterPackMarkdown({ track, level }) {
  const pack = resolveStarterPack({ track, level });

  const header = [
    `# ${pack.track} Starter Pack (${pack.level})`,
    "",
    "This is a self-guided 4-week plan built around official Google learning " +
    "resources - fitting since you're part of GDGoC (Google Developer Groups " +
    "on Campus). All mentor seats for this track are full right now, so use " +
    "this to keep moving, and check back any time since seats open up as " +
    "mentees complete the program.",
    ""
  ];

  const body = pack.weeks.flatMap((week) => [
    `## ${week.title}`,
    "",
    `**Focus:** ${week.focus}`,
    "",
    "**Resources:**",
    ...week.resources.map((r) => `- ${r}`),
    "",
    `**This week's task:** ${week.task}`,
    ""
  ]);

  return [...header, ...body].join("\n");
}

function generateStarterPackFilename({ track, level }) {
  const pack = resolveStarterPack({ track, level });
  const slug = pack.track.toLowerCase().replace(/\s+/g, "-");
  return `${slug}-${pack.level}-starter-pack.pdf`;
}

/**
 * Renders the starter pack as a real PDF, since a raw .md file just shows
 * literal "#" and "**" symbols to anyone without a markdown viewer - not
 * something a brand new community member should have to deal with. PDF
 * opens cleanly in any browser or phone with no extra app required.
 *
 * Returns a Promise<Buffer> so the route can just send it directly.
 */
function generateStarterPackPdf({ track, level }) {
  const pack = resolveStarterPack({ track, level });

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc
      .fontSize(20)
      .fillColor("#0f766e")
      .text(`${pack.track} Starter Pack`, { align: "left" })
      .fontSize(12)
      .fillColor("#555555")
      .text(`${pack.level.charAt(0).toUpperCase() + pack.level.slice(1)} level - self-guided, 4 weeks`)
      .moveDown(0.5)
      .fontSize(10)
      .fillColor("#333333")
      .text(
        "This is a self-guided plan built around official Google learning resources - " +
        "fitting since you're part of GDGoC (Google Developer Groups on Campus). All " +
        "mentor seats for this track are full right now, so use this to keep moving, " +
        "and check back any time since seats open up as mentees complete the program."
      )
      .moveDown(1);

    pack.weeks.forEach((week, index) => {
      if (index > 0) doc.moveDown(1);

      doc
        .fontSize(14)
        .fillColor("#0f766e")
        .text(week.title)
        .moveDown(0.3)
        .fontSize(11)
        .fillColor("#333333")
        .font("Helvetica-Bold")
        .text("Focus: ", { continued: true })
        .font("Helvetica")
        .text(week.focus)
        .moveDown(0.3)
        .font("Helvetica-Bold")
        .text("Resources:")
        .font("Helvetica");

      week.resources.forEach((resource) => {
        const urlMatch = resource.match(/(https?:\/\/\S+)$/);
        doc.text("• ", { continued: true, indent: 10 });

        if (urlMatch) {
          const url = urlMatch[1];
          const label = resource.slice(0, urlMatch.index).trim();
          doc
            .fillColor("#333333")
            .text(label ? `${label} ` : "", { continued: true })
            .fillColor("#1d4ed8")
            .text(url, { link: url, underline: true, continued: false })
            .fillColor("#333333");
        } else {
          doc.fillColor("#333333").text(resource);
        }
      });

      doc
        .moveDown(0.3)
        .font("Helvetica-Bold")
        .text("This week's task: ", { continued: true })
        .font("Helvetica")
        .text(week.task);
    });

    doc.end();
  });
}

module.exports = {
  generateStarterPackMarkdown,
  generateStarterPackFilename,
  generateStarterPackPdf
};