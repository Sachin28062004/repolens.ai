import { useState } from "react";

const featureCards = [
  {
    title: "Multi-Input Analysis",
    description:
      "Review source code through pasted snippets, GitHub repositories with branch or PR selection, and drag-and-drop project uploads.",
  },
  {
    title: "Beginner-Friendly Explanations",
    description:
      "Translate complex bugs into simple language so students, junior developers, and reviewers can understand the exact issue fast.",
  },
  {
    title: "Secure Preprocessing",
    description:
      "Filter files, mask sensitive values, skip heavy folders, and limit file size before sending code for AI review.",
  },
];

const workflow = [
  "User submits code, repository, or local files.",
  "Preprocessing filters folders, masks secrets, and keeps only relevant source files.",
  "The AI service reviews bugs, logic issues, and possible improvements.",
  "Results are formatted into severity-tagged explanations with suggested fixes.",
];

const architecture = [
  {
    layer: "React Frontend",
    detail: "Elegant dashboard, animated review studio, and structured output cards.",
  },
  {
    layer: "Spring Boot API",
    detail: "Receives inputs, orchestrates requests, and manages file preprocessing.",
  },
  {
    layer: "Groq AI Service",
    detail: "Analyzes code for bugs, logic errors, explanations, and corrections.",
  },
  {
    layer: "GitHub + File Layer",
    detail: "Connects repository metadata, branch/PR data, and uploaded project files.",
  },
];

const modes = {
  snippet: {
    label: "Paste Code",
    subLabel: "Fast snippet review",
    description:
      "Perfect for lab tasks, small algorithms, and debugging one function before submission.",
    pills: ["JavaScript", "Python", "Java"],
    previewType: "code",
    previewTitle: "Code Editor",
    previewContent: `function calculateTotal(items) {\n  let total = 0;\n\n  for (let i = 0; i <= items.length; i++) {\n    total += items[i].price;\n  }\n\n  return total.toFixed(2);\n}`,
    sideTitle: "AI Review Controls",
    sideItems: [
      "Choose language and review depth",
      "Detect syntax, logic, and quality issues",
      "Return bug description, explanation, and corrected code",
    ],
    cta: "Review Code",
    metrics: [
      { label: "Detected Issues", value: "02" },
      { label: "Estimated Severity", value: "High" },
      { label: "Fix Confidence", value: "94%" },
    ],
    resultSummary:
      "The loop reads one item past the end of the array, which can crash the function when `items[i]` becomes undefined.",
    issues: [
      {
        severity: "High",
        title: "Array boundary bug",
        body: "The loop uses `<= items.length` instead of `< items.length`.",
      },
      {
        severity: "Medium",
        title: "Missing defensive guard",
        body: "The function assumes every item has a `price` property.",
      },
    ],
  },
  repo: {
    label: "GitHub Repo",
    subLabel: "Branch and PR analysis",
    description:
      "Designed for real-world review workflow with repository URL input, branch choice, and pull request selection.",
    pills: ["REST API", "Branches", "Pull Requests"],
    previewType: "repo",
    previewTitle: "Repository Console",
    previewContent: [
      { label: "Repository URL", value: "https://github.com/org/ai-review-demo" },
      { label: "Selected branch", value: "feature/review-ui" },
      { label: "Open PR", value: "#48 Improve result formatting" },
    ],
    sideTitle: "Repository Workflow",
    sideItems: [
      "Fetch repository metadata and available branches",
      "Allow PR-based review for realistic code review simulation",
      "Summarize file-wise findings with severity classification",
    ],
    cta: "Analyze Repository",
    metrics: [
      { label: "Files Checked", value: "24" },
      { label: "PR Findings", value: "07" },
      { label: "Critical Alerts", value: "01" },
    ],
    resultSummary:
      "The selected PR introduces one critical null-handling problem and multiple readability issues across utility files.",
    issues: [
      {
        severity: "High",
        title: "Null response path not handled",
        body: "The API layer assumes response data always exists before destructuring it.",
      },
      {
        severity: "Low",
        title: "Repeated helper logic",
        body: "Duplicate formatter code appears in two modules and should be centralized.",
      },
    ],
  },
  files: {
    label: "File Upload",
    subLabel: "Smart drag-and-drop filtering",
    description:
      "Upload individual files, folders, or ZIP archives while the system skips irrelevant or risky paths automatically.",
    pills: ["ZIP Upload", "Folder Drop", "Sensitive Masking"],
    previewType: "files",
    previewTitle: "Drop Zone",
    previewContent: [
      "src/components/",
      "src/services/",
      "pom.xml",
      "analysis-request.zip",
    ],
    sideTitle: "Preprocessing Rules",
    sideItems: [
      "Exclude node_modules, .git, .env, dist, and target folders",
      "Mask passwords, API keys, and secret patterns before analysis",
      "Limit file size and count to keep the review fast and safe",
    ],
    cta: "Start Filtered Review",
    metrics: [
      { label: "Files Uploaded", value: "58" },
      { label: "Ignored Safely", value: "14" },
      { label: "Relevant Files", value: "44" },
    ],
    resultSummary:
      "The upload flow keeps only source files for analysis, preventing wasted tokens on build output and sensitive files.",
    issues: [
      {
        severity: "Medium",
        title: "Oversized utility bundle",
        body: "One helper file mixes validation, parsing, and formatting into a single long module.",
      },
      {
        severity: "Low",
        title: "Environment file excluded",
        body: "The `.env` file is correctly ignored to reduce security risk.",
      },
    ],
  },
};

const outputFormat = [
  "File name",
  "Bug description",
  "Explanation in simple language",
  "Suggested fix",
  "Severity level",
];

function App() {
  const [activeMode, setActiveMode] = useState("snippet");
  const currentMode = modes[activeMode];

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="site-header">
        <div className="brand-lockup">
          <div className="brand-mark">AC</div>
          <div>
            <p className="brand-title">AI Code Reviewer</p>
            <p className="brand-subtitle">Final year showcase frontend</p>
          </div>
        </div>
        <nav className="top-nav">
          <a href="#studio">Studio</a>
          <a href="#workflow">Workflow</a>
          <a href="#results">Results</a>
        </nav>
      </header>

      <main>
        <section className="hero section">
          <div className="hero-copy">
            <p className="eyebrow">React frontend for your documented project</p>
            <h1>AI Code Reviewer & Bug Explainer</h1>
            <p className="hero-text">
              A presentation-first interface for your final year project that feels modern,
              technical, and demo-ready. It highlights the three input modes, GitHub review
              flow, AI analysis pipeline, and structured bug explanations from your
              documentation.
            </p>

            <div className="hero-actions">
              <a className="primary-button" href="#studio">
                Explore Review Studio
              </a>
              <a className="secondary-button" href="#results">
                See Output Format
              </a>
            </div>

            <div className="hero-stat-grid">
              <article>
                <span>03</span>
                <p>input methods</p>
              </article>
              <article>
                <span>PR</span>
                <p>branch & pull request flow</p>
              </article>
              <article>
                <span>AI</span>
                <p>bug explanations + fixes</p>
              </article>
            </div>
          </div>

          <div className="hero-display">
            <div className="hero-panel glass-card">
              <div className="hero-panel-top">
                <span className="status-pill live">Live Review Demo</span>
                <span className="status-pill calm">Frontend + UX Focus</span>
              </div>

              <div className="hero-panel-content">
                <div className="hero-preview">
                  <div className="mini-terminal">
                    <div className="terminal-bar">
                      <span />
                      <span />
                      <span />
                    </div>
                    <div className="terminal-body">
                      <p>$ analyze repo --branch feature/review-ui</p>
                      <p className="terminal-muted">Scanning relevant source files...</p>
                      <p className="terminal-success">2 high-priority findings detected</p>
                    </div>
                  </div>
                </div>

                <div className="issue-stack">
                  <article className="issue-chip high">
                    <span>High</span>
                    <p>Array boundary bug in pricing module</p>
                  </article>
                  <article className="issue-chip medium">
                    <span>Medium</span>
                    <p>Environment masking triggered before upload</p>
                  </article>
                  <article className="issue-chip low">
                    <span>Low</span>
                    <p>Refactor repeated helper logic in formatter</p>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section signals">
          <div className="section-heading">
            <p className="eyebrow">Why this interface stands out</p>
            <h2>Built to look like a serious product demo</h2>
          </div>

          <div className="signal-grid">
            {featureCards.map((card) => (
              <article className="signal-card glass-card" key={card.title}>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section studio-section" id="studio">
          <div className="section-heading">
            <p className="eyebrow">Core project features</p>
            <h2>Interactive review studio</h2>
            <p>
              Switch between the three input modes from your documentation and see how the
              frontend adapts for each workflow.
            </p>
          </div>

          <div className="mode-switcher">
            {Object.entries(modes).map(([key, mode]) => (
              <button
                className={`mode-button ${activeMode === key ? "active" : ""}`}
                key={key}
                onClick={() => setActiveMode(key)}
                type="button"
              >
                <span>{mode.label}</span>
                <small>{mode.subLabel}</small>
              </button>
            ))}
          </div>

          <div className="studio-grid">
            <article className="glass-card studio-card mode-panel">
              <div className="panel-heading">
                <div>
                  <p className="panel-kicker">{currentMode.subLabel}</p>
                  <h3>{currentMode.previewTitle}</h3>
                </div>
                <div className="pill-row">
                  {currentMode.pills.map((pill) => (
                    <span className="soft-pill" key={pill}>
                      {pill}
                    </span>
                  ))}
                </div>
              </div>

              <p className="panel-description">{currentMode.description}</p>

              {currentMode.previewType === "code" ? (
                <div className="code-window">
                  <div className="window-header">
                    <span />
                    <span />
                    <span />
                  </div>
                  <pre>{currentMode.previewContent}</pre>
                </div>
              ) : null}

              {currentMode.previewType === "repo" ? (
                <div className="stacked-cards">
                  {currentMode.previewContent.map((item) => (
                    <div className="stack-item" key={item.label}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              ) : null}

              {currentMode.previewType === "files" ? (
                <div className="upload-zone">
                  <div className="upload-orbit" />
                  <p>Drop files, folders, or ZIP archives here</p>
                  <div className="upload-list">
                    {currentMode.previewContent.map((entry) => (
                      <span key={entry}>{entry}</span>
                    ))}
                  </div>
                </div>
              ) : null}
            </article>

            <article className="glass-card studio-card mode-panel accent-card">
              <div className="panel-heading">
                <div>
                  <p className="panel-kicker">Expected system behavior</p>
                  <h3>{currentMode.sideTitle}</h3>
                </div>
                <button className="primary-button compact" type="button">
                  {currentMode.cta}
                </button>
              </div>

              <div className="side-list">
                {currentMode.sideItems.map((item) => (
                  <article key={item}>
                    <span className="list-bullet" />
                    <p>{item}</p>
                  </article>
                ))}
              </div>

              <div className="metrics-grid">
                {currentMode.metrics.map((metric) => (
                  <article key={metric.label}>
                    <span>{metric.value}</span>
                    <p>{metric.label}</p>
                  </article>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="section architecture-section" id="workflow">
          <div className="section-heading">
            <p className="eyebrow">System story</p>
            <h2>Workflow and architecture</h2>
            <p>
              The layout below mirrors your document: user input, preprocessing, AI request,
              response handling, and polished output display.
            </p>
          </div>

          <div className="workflow-track glass-card">
            {workflow.map((step, index) => (
              <article key={step} className="workflow-step">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{step}</p>
              </article>
            ))}
          </div>

          <div className="architecture-grid">
            {architecture.map((item) => (
              <article className="glass-card architecture-card" key={item.layer}>
                <h3>{item.layer}</h3>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section results-section" id="results">
          <div className="section-heading">
            <p className="eyebrow">Structured output</p>
            <h2>Presentation-ready analysis results</h2>
            <p>
              This matches the output format in your documentation and helps examiners
              understand the product quickly during demo or viva.
            </p>
          </div>

          <div className="results-layout">
            <article className="glass-card summary-card">
              <p className="panel-kicker">Current mode summary</p>
              <h3>{currentMode.label}</h3>
              <p className="summary-text">{currentMode.resultSummary}</p>
              <div className="format-list">
                {outputFormat.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </article>

            <div className="result-card-stack">
              {currentMode.issues.map((issue) => (
                <article className="glass-card result-card" key={issue.title}>
                  <div className="result-top">
                    <span className={`severity severity-${issue.severity.toLowerCase()}`}>
                      {issue.severity}
                    </span>
                    <strong>{issue.title}</strong>
                  </div>
                  <p>{issue.body}</p>
                  <div className="result-footer">
                    <span>Explanation</span>
                    <span>Suggested Fix</span>
                    <span>File-wise View</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section security-section">
          <div className="section-heading">
            <p className="eyebrow">Security features from the document</p>
            <h2>Safe preprocessing before AI analysis</h2>
          </div>

          <div className="security-grid">
            <article className="glass-card security-card">
              <h3>Sensitive files excluded</h3>
              <p>
                Skip <code>.env</code>, build folders, and unnecessary directories to avoid
                accidental data leaks and wasted processing.
              </p>
            </article>
            <article className="glass-card security-card">
              <h3>Secret masking</h3>
              <p>
                API keys, passwords, and suspicious patterns are masked before analysis
                requests are created.
              </p>
            </article>
            <article className="glass-card security-card">
              <h3>Relevant source filtering</h3>
              <p>
                Review only the files that matter so the system stays faster, cheaper, and
                easier to explain during demos.
              </p>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
