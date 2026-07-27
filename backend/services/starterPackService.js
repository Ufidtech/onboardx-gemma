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
  },
  "Cloud Computing": {
    beginner: [
      {
        title: "Week 1 — Cloud Fundamentals",
        focus: "Compute, storage, networking, and the Google Cloud console.",
        resources: [
          "Google Cloud Skills Boost — https://www.cloudskillsboost.google/",
          "Google Cloud free tier — https://cloud.google.com/free"
        ],
        task: "Create a Google Cloud account and complete your first Skills Boost lab."
      },
      {
        title: "Week 2 — Deploy Something",
        focus: "Getting a small app or static site live on Google Cloud.",
        resources: [
          "Cloud Run quickstart — https://cloud.google.com/run/docs/quickstarts"
        ],
        task: "Deploy a simple static site or small app using Cloud Run's free tier."
      },
      {
        title: "Week 3 — IAM & Security Basics",
        focus: "Users, roles, and permissions in a cloud environment.",
        resources: [
          "Google Cloud Skills Boost — https://www.cloudskillsboost.google/"
        ],
        task: "Complete a Skills Boost lab focused on IAM basics."
      },
      {
        title: "Week 4 — Earn a Badge",
        focus: "Completing a full learning path end-to-end.",
        resources: [
          "Google Cloud learning paths — https://cloud.google.com/learn/training/machinelearning-ai"
        ],
        task: "Complete one full Skills Boost learning path and earn your first skill badge."
      }
    ],
    intermediate: [
      {
        title: "Week 1 — Containers",
        focus: "Working with containers on Google Cloud.",
        resources: [
          "Cloud Run quickstart — https://cloud.google.com/run/docs/quickstarts"
        ],
        task: "Containerize an existing app and deploy it to Cloud Run."
      },
      {
        title: "Week 2 — Infrastructure as Code",
        focus: "Managing cloud resources with code instead of clicking.",
        resources: [
          "Google Cloud Skills Boost — https://www.cloudskillsboost.google/"
        ],
        task: "Complete a Skills Boost lab on infrastructure automation."
      },
      {
        title: "Week 3 — Monitoring & Cost",
        focus: "Keeping a deployed service healthy and affordable.",
        resources: [
          "Google Cloud free tier — https://cloud.google.com/free"
        ],
        task: "Set up basic monitoring and a budget alert for your deployed project."
      },
      {
        title: "Week 4 — Go Deeper",
        focus: "Applying cloud skills to a real learning path.",
        resources: [
          "Google Cloud learning paths — https://cloud.google.com/learn/training/machinelearning-ai"
        ],
        task: "Complete an intermediate Skills Boost learning path relevant to your interests."
      }
    ]
  },
  "Data Analytics": {
    beginner: [
      {
        title: "Week 1 — Spreadsheets & SQL Basics",
        focus: "Foundational tools every data analyst uses.",
        resources: [
          "Google Data Analytics Certificate — https://www.coursera.org/professional-certificates/google-data-analytics"
        ],
        task: "Complete the first course of the Google Data Analytics Certificate on Coursera."
      },
      {
        title: "Week 2 — Cleaning & Organizing Data",
        focus: "Getting messy real-world data ready for analysis.",
        resources: [
          "Google Data Analytics Certificate — https://www.coursera.org/professional-certificates/google-data-analytics"
        ],
        task: "Clean a real, messy public dataset and document your process."
      },
      {
        title: "Week 3 — Visualization",
        focus: "Turning cleaned data into a clear visual story.",
        resources: [
          "Looker Studio — https://lookerstudio.google.com/"
        ],
        task: "Build your first dashboard in Looker Studio from a real dataset."
      },
      {
        title: "Week 4 — Present Findings",
        focus: "Communicating insights clearly to a non-technical audience.",
        resources: [
          "Google Data Analytics Certificate — https://www.coursera.org/professional-certificates/google-data-analytics"
        ],
        task: "Present your dashboard and findings to the community for feedback."
      }
    ],
    intermediate: [
      {
        title: "Week 1 — Advanced SQL",
        focus: "Window functions, subqueries, and more complex queries.",
        resources: [
          "Google Cloud Data Analytics Certificate — https://www.coursera.org/professional-certificates/google-cloud-data-analytics-certificate"
        ],
        task: "Rewrite a basic query from earlier using window functions or subqueries."
      },
      {
        title: "Week 2 — Statistics Fundamentals",
        focus: "The statistical thinking behind good analysis.",
        resources: [
          "Google Advanced Data Analytics Certificate — https://www.coursera.org/professional-certificates/google-advanced-data-analytics"
        ],
        task: "Run a basic statistical test on a real dataset and interpret the result."
      },
      {
        title: "Week 3 — Python or R for Analysis",
        focus: "Scaling beyond spreadsheets.",
        resources: [
          "Google Advanced Data Analytics Certificate — https://www.coursera.org/professional-certificates/google-advanced-data-analytics"
        ],
        task: "Reproduce one of your earlier spreadsheet analyses in Python or R."
      },
      {
        title: "Week 4 — Full Analysis & Recommendation",
        focus: "Going from data to a clear business recommendation.",
        resources: [
          "Google Cloud Data Analytics Certificate — https://www.coursera.org/professional-certificates/google-cloud-data-analytics-certificate"
        ],
        task: "Produce a short written analysis with a clear, data-backed recommendation."
      }
    ]
  },
  "AI / Machine Learning": {
    beginner: [
      {
        title: "Week 1 — ML Fundamentals",
        focus: "Core concepts: features, labels, loss, training.",
        resources: [
          "Google Machine Learning Crash Course — https://developers.google.com/machine-learning/crash-course"
        ],
        task: "Complete the first modules of Google's Machine Learning Crash Course."
      },
      {
        title: "Week 2 — Your First Model",
        focus: "Linear regression and classification basics.",
        resources: [
          "Google Machine Learning Crash Course — https://developers.google.com/machine-learning/crash-course"
        ],
        task: "Train a simple regression or classification model on a small dataset."
      },
      {
        title: "Week 3 — Working with Real Data",
        focus: "Getting hands-on with a real dataset and community.",
        resources: [
          "Kaggle — https://www.kaggle.com/"
        ],
        task: "Create a Kaggle account and explore a beginner-friendly dataset."
      },
      {
        title: "Week 4 — Enter a Competition",
        focus: "Applying what you've learned in a real, low-stakes setting.",
        resources: [
          "Kaggle — https://www.kaggle.com/",
          "Google Machine Learning Crash Course — https://developers.google.com/machine-learning/crash-course"
        ],
        task: "Submit an entry to a beginner-friendly Kaggle competition, even if it's not your best score."
      }
    ],
    intermediate: [
      {
        title: "Week 1 — Neural Networks",
        focus: "Moving from linear models to neural networks.",
        resources: [
          "Google Machine Learning Crash Course — https://developers.google.com/machine-learning/crash-course"
        ],
        task: "Complete the neural network modules of the Machine Learning Crash Course."
      },
      {
        title: "Week 2 — A Real ML Framework",
        focus: "Building and training with TensorFlow.",
        resources: [
          "Google Cloud ML & AI training — https://cloud.google.com/learn/training/machinelearning-ai"
        ],
        task: "Follow a TensorFlow tutorial and train a model beyond the basics."
      },
      {
        title: "Week 3 — Evaluation & Overfitting",
        focus: "Making sure your model actually generalizes.",
        resources: [
          "Google Machine Learning Crash Course — https://developers.google.com/machine-learning/crash-course"
        ],
        task: "Evaluate your model properly and address any overfitting you find."
      },
      {
        title: "Week 4 — Go Further",
        focus: "Applying ML skills toward a real certification path.",
        resources: [
          "Google Cloud Professional ML Engineer path — https://www.skills.google/paths/17"
        ],
        task: "Start the Google Cloud Professional Machine Learning Engineer learning path."
      }
    ]
  },
  "Android / Mobile Development": {
    beginner: [
      {
        title: "Week 1 — Kotlin & Compose Basics",
        focus: "The language and toolkit behind modern Android apps.",
        resources: [
          "Android Developers — Get Started — https://developer.android.com/courses",
          "Jetpack Compose course — https://developer.android.com/courses/jetpack-compose/course"
        ],
        task: "Complete the first unit of the Jetpack Compose course."
      },
      {
        title: "Week 2 — Layouts & State",
        focus: "Building real screens with composables.",
        resources: [
          "Jetpack Compose course — https://developer.android.com/courses/jetpack-compose/course"
        ],
        task: "Build a simple multi-screen app with basic navigation."
      },
      {
        title: "Week 3 — Material Design",
        focus: "Making your app look and feel like a real Android app.",
        resources: [
          "Jetpack Compose course — https://developer.android.com/courses/jetpack-compose/course"
        ],
        task: "Apply Material Design components throughout your app."
      },
      {
        title: "Week 4 — Ship Your First App",
        focus: "Getting a working build others can actually run.",
        resources: [
          "Android Basics with Compose and Firebase — https://developer.android.com/courses/android-basics-compose-firebase/course"
        ],
        task: "Build and share a working APK or test build with the community."
      }
    ],
    intermediate: [
      {
        title: "Week 1 — App Architecture",
        focus: "Structuring a real, maintainable Android app.",
        resources: [
          "Android Developers — Get Started — https://developer.android.com/courses"
        ],
        task: "Refactor an existing app to follow a recommended architecture pattern."
      },
      {
        title: "Week 2 — Firebase Integration",
        focus: "Adding real backend services to your app.",
        resources: [
          "Android Basics with Compose and Firebase — https://developer.android.com/courses/android-basics-compose-firebase/course"
        ],
        task: "Connect your app to Firebase for auth or data storage."
      },
      {
        title: "Week 3 — Accessibility & Testing",
        focus: "Making your app usable by everyone, and provably correct.",
        resources: [
          "Android Developers — Get Started — https://developer.android.com/courses"
        ],
        task: "Add accessibility support and basic automated tests to your app."
      },
      {
        title: "Week 4 — Publish a Test Build",
        focus: "Getting real feedback on a real build.",
        resources: [
          "Android Developers — Get Started — https://developer.android.com/courses"
        ],
        task: "Share a test build of your app with the community for feedback."
      }
    ]
  },
  "UI/UX Design": {
    beginner: [
      {
        title: "Week 1 — UX Fundamentals",
        focus: "User research basics and the design process.",
        resources: [
          "Google UX Design Certificate — https://www.coursera.org/professional-certificates/google-ux-design"
        ],
        task: "Complete the first course of the Google UX Design Certificate."
      },
      {
        title: "Week 2 — Wireframing",
        focus: "Low-fidelity prototyping basics.",
        resources: [
          "Google UX Design Certificate — https://www.coursera.org/professional-certificates/google-ux-design"
        ],
        task: "Wireframe a simple app or website idea on paper or in Figma."
      },
      {
        title: "Week 3 — Prototyping in Figma",
        focus: "Turning wireframes into a clickable prototype.",
        resources: [
          "Google UX Design Certificate — https://www.coursera.org/professional-certificates/google-ux-design"
        ],
        task: "Build a clickable prototype of your wireframe in Figma."
      },
      {
        title: "Week 4 — Usability Testing",
        focus: "Getting real feedback on your design.",
        resources: [
          "Google UX Design Certificate — https://www.coursera.org/professional-certificates/google-ux-design"
        ],
        task: "Run a basic usability test with 2-3 people and document what you learn."
      }
    ],
    intermediate: [
      {
        title: "Week 1 — Design Systems",
        focus: "High-fidelity, consistent design at scale.",
        resources: [
          "Google UX Design Certificate — https://www.coursera.org/professional-certificates/google-ux-design"
        ],
        task: "Build a small design system (colors, type, components) for a project."
      },
      {
        title: "Week 2 — Accessibility in Design",
        focus: "Designing for everyone, not just the average user.",
        resources: [
          "Google UX Design Certificate — https://www.coursera.org/professional-certificates/google-ux-design"
        ],
        task: "Audit an existing design for accessibility issues and fix at least 3."
      },
      {
        title: "Week 3 — User Interviews",
        focus: "Getting and synthesizing real qualitative research.",
        resources: [
          "Google UX Design Certificate — https://www.coursera.org/professional-certificates/google-ux-design"
        ],
        task: "Conduct 2-3 short user interviews and synthesize the findings."
      },
      {
        title: "Week 4 — Case Study",
        focus: "Presenting your work like a real portfolio piece.",
        resources: [
          "Google UX Design Certificate — https://www.coursera.org/professional-certificates/google-ux-design"
        ],
        task: "Write up a full case study of your project and share it for feedback."
      }
    ]
  },
  Cybersecurity: {
    beginner: [
      {
        title: "Week 1 — Security Fundamentals",
        focus: "Core concepts: CIA triad, common threats and vulnerabilities.",
        resources: [
          "Google Cybersecurity Certificate — https://www.coursera.org/professional-certificates/google-cybersecurity/"
        ],
        task: "Complete the first course of the Google Cybersecurity Certificate."
      },
      {
        title: "Week 2 — Networking & Linux Basics",
        focus: "The technical foundation every security role needs.",
        resources: [
          "Google Cybersecurity Certificate — https://www.coursera.org/professional-certificates/google-cybersecurity/"
        ],
        task: "Complete the networking and Linux command line modules."
      },
      {
        title: "Week 3 — SQL for Security",
        focus: "Querying logs and data like a security analyst.",
        resources: [
          "Google Cybersecurity Certificate — https://www.coursera.org/professional-certificates/google-cybersecurity/"
        ],
        task: "Complete the SQL module and practice basic log queries."
      },
      {
        title: "Week 4 — First Security Lab",
        focus: "Applying what you've learned hands-on.",
        resources: [
          "Google Cybersecurity Certificate — https://www.coursera.org/professional-certificates/google-cybersecurity/"
        ],
        task: "Complete a beginner hands-on lab or simulation from the certificate program."
      }
    ],
    intermediate: [
      {
        title: "Week 1 — Threat Detection",
        focus: "SIEM tools and identifying real threats.",
        resources: [
          "Google Cybersecurity Certificate — https://www.coursera.org/professional-certificates/google-cybersecurity/"
        ],
        task: "Complete the SIEM tools module and practice with sample alerts."
      },
      {
        title: "Week 2 — Security Automation",
        focus: "Using Python to automate repetitive security tasks.",
        resources: [
          "Google Cybersecurity Certificate — https://www.coursera.org/professional-certificates/google-cybersecurity/"
        ],
        task: "Write a small Python script that automates a basic security check."
      },
      {
        title: "Week 3 — Incident Response",
        focus: "What to do when something actually goes wrong.",
        resources: [
          "Google Cybersecurity Certificate — https://www.coursera.org/professional-certificates/google-cybersecurity/"
        ],
        task: "Walk through a sample incident response scenario end-to-end."
      },
      {
        title: "Week 4 — Case Study",
        focus: "Applying everything to a full, realistic scenario.",
        resources: [
          "Google Cybersecurity Certificate — https://www.coursera.org/professional-certificates/google-cybersecurity/"
        ],
        task: "Complete a full hands-on case study lab from the certificate program."
      }
    ]
  },
  "DevOps / SRE": {
    beginner: [
      {
        title: "Week 1 — Linux & Shell Basics",
        focus: "The command-line foundation for DevOps work.",
        resources: [
          "Google SRE resource hub — https://sre.google/resources/"
        ],
        task: "Practice shell scripting by automating one repetitive local task."
      },
      {
        title: "Week 2 — Containers",
        focus: "Packaging apps consistently with Docker.",
        resources: [
          "Cloud Run quickstart — https://cloud.google.com/run/docs/quickstarts"
        ],
        task: "Containerize a simple app and run it locally with Docker."
      },
      {
        title: "Week 3 — CI Basics",
        focus: "Automating builds and tests on every change.",
        resources: [
          "Google Cloud Build quickstart — https://cloud.google.com/build/docs/quickstarts"
        ],
        task: "Set up a basic CI pipeline that runs tests on every push."
      },
      {
        title: "Week 4 — Monitoring Basics",
        focus: "Knowing when something is actually wrong.",
        resources: [
          "Google SRE book — https://sre.google/sre-book/introduction/"
        ],
        task: "Add basic logging or monitoring to a deployed project."
      }
    ],
    intermediate: [
      {
        title: "Week 1 — CI/CD Pipeline Design",
        focus: "Going from CI to full continuous deployment.",
        resources: [
          "Google Cloud Build quickstart — https://cloud.google.com/build/docs/quickstarts"
        ],
        task: "Extend an existing CI pipeline to deploy automatically on merge."
      },
      {
        title: "Week 2 — SRE Fundamentals",
        focus: "SLIs, SLOs, and error budgets - the language of reliability.",
        resources: [
          "Google SRE book — https://sre.google/sre-book/introduction/"
        ],
        task: "Define an SLI and SLO for a project you maintain."
      },
      {
        title: "Week 3 — Infrastructure as Code",
        focus: "Managing infrastructure the reproducible way.",
        resources: [
          "Google Cloud Skills Boost — https://www.cloudskillsboost.google/"
        ],
        task: "Define one piece of your infrastructure as code instead of manual setup."
      },
      {
        title: "Week 4 — Postmortems",
        focus: "Learning from incidents without blame.",
        resources: [
          "Google SRE Workbook — https://sre.google/resources/"
        ],
        task: "Write a blameless postmortem for a real or simulated incident."
      }
    ]
  },
  "IT Support": {
    beginner: [
      {
        title: "Week 1 — Computer & OS Fundamentals",
        focus: "The basics every IT support role starts with.",
        resources: [
          "Google IT Support Certificate — https://www.coursera.org/professional-certificates/google-it-support"
        ],
        task: "Complete the first course of the Google IT Support Certificate."
      },
      {
        title: "Week 2 — Networking Basics",
        focus: "IP addressing, DNS, and troubleshooting connections.",
        resources: [
          "Google IT Support Certificate — https://www.coursera.org/professional-certificates/google-it-support"
        ],
        task: "Complete the networking module and practice basic troubleshooting steps."
      },
      {
        title: "Week 3 — System Administration",
        focus: "Managing users, permissions, and systems.",
        resources: [
          "Google IT Support Certificate — https://www.coursera.org/professional-certificates/google-it-support"
        ],
        task: "Complete the system administration module."
      },
      {
        title: "Week 4 — Realistic Tickets",
        focus: "Applying everything to real support scenarios.",
        resources: [
          "Google IT Support Certificate — https://www.coursera.org/professional-certificates/google-it-support"
        ],
        task: "Work through a set of realistic support tickets from the certificate program."
      }
    ],
    intermediate: [
      {
        title: "Week 1 — Security for IT Support",
        focus: "Keeping systems and users safe.",
        resources: [
          "Google IT Support Certificate — https://www.coursera.org/professional-certificates/google-it-support"
        ],
        task: "Complete the IT security module."
      },
      {
        title: "Week 2 — Automation Basics",
        focus: "Scripting your way out of repetitive tasks.",
        resources: [
          "Google IT Support Certificate — https://www.coursera.org/professional-certificates/google-it-support"
        ],
        task: "Write a basic script that automates a repetitive support task."
      },
      {
        title: "Week 3 — Directory Services",
        focus: "Managing users and access at scale.",
        resources: [
          "Google IT Support Certificate — https://www.coursera.org/professional-certificates/google-it-support"
        ],
        task: "Complete the directory services module."
      },
      {
        title: "Week 4 — Full Scenario",
        focus: "Handling a complete, realistic support case.",
        resources: [
          "Google IT Support Certificate — https://www.coursera.org/professional-certificates/google-it-support"
        ],
        task: "Handle a full, multi-step realistic support scenario end-to-end."
      }
    ]
  },
  "Digital Marketing": {
    beginner: [
      {
        title: "Week 1 — Digital Marketing Fundamentals",
        focus: "The landscape of digital marketing and e-commerce.",
        resources: [
          "Google Digital Marketing & E-commerce Certificate — https://www.coursera.org/professional-certificates/google-digital-marketing-ecommerce"
        ],
        task: "Complete the first course of the Google Digital Marketing & E-commerce Certificate."
      },
      {
        title: "Week 2 — Social Media & Content",
        focus: "Building an audience and creating content that works.",
        resources: [
          "Google Digital Marketing & E-commerce Certificate — https://www.coursera.org/professional-certificates/google-digital-marketing-ecommerce"
        ],
        task: "Draft a simple content calendar for a hypothetical brand."
      },
      {
        title: "Week 3 — SEO Basics",
        focus: "Getting found in search.",
        resources: [
          "Google Digital Marketing & E-commerce Certificate — https://www.coursera.org/professional-certificates/google-digital-marketing-ecommerce"
        ],
        task: "Do a basic SEO audit of a real or hypothetical website."
      },
      {
        title: "Week 4 — First Marketing Plan",
        focus: "Bringing it all together into a real plan.",
        resources: [
          "Google Digital Marketing & E-commerce Certificate — https://www.coursera.org/professional-certificates/google-digital-marketing-ecommerce"
        ],
        task: "Write a simple marketing plan for a real or hypothetical small business."
      }
    ],
    intermediate: [
      {
        title: "Week 1 — Analytics",
        focus: "Measuring what's actually working.",
        resources: [
          "Google Digital Marketing & E-commerce Certificate — https://www.coursera.org/professional-certificates/google-digital-marketing-ecommerce"
        ],
        task: "Set up basic analytics tracking for a real or hypothetical campaign."
      },
      {
        title: "Week 2 — Paid Search & Social",
        focus: "Running paid campaigns effectively.",
        resources: [
          "Google Digital Marketing & E-commerce Certificate — https://www.coursera.org/professional-certificates/google-digital-marketing-ecommerce"
        ],
        task: "Draft a small paid campaign brief with targeting and budget."
      },
      {
        title: "Week 3 — E-commerce Fundamentals",
        focus: "Turning traffic into sales.",
        resources: [
          "Google Digital Marketing & E-commerce Certificate — https://www.coursera.org/professional-certificates/google-digital-marketing-ecommerce"
        ],
        task: "Map out a basic e-commerce funnel for a product idea."
      },
      {
        title: "Week 4 — Present a Campaign",
        focus: "Bringing everything together with real metrics.",
        resources: [
          "Google Digital Marketing & E-commerce Certificate — https://www.coursera.org/professional-certificates/google-digital-marketing-ecommerce"
        ],
        task: "Present a full campaign plan with goals, channels, and success metrics."
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
  const slug = pack.track
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // collapse anything unsafe (slashes, spaces, punctuation) into a hyphen
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
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