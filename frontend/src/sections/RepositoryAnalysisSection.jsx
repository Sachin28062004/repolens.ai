import { useState } from "react";
import { runProtectedAction } from "../middleware/authGuard";
import { FindingsList } from "../components/FindingsList";

export function RepositoryAnalysisSection({
  apiClient,
  session,
  onNeedAuth,
}) {
  const [form, setForm] = useState({
    repoUrl: "",
    branch: "",
    pullRequestUrl: "",
    maxFiles: 6,
  });
  const [branches, setBranches] = useState([]);
  const [repoSummary, setRepoSummary] = useState(null);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function fetchBranches() {
    setError("");
    setStatus("");

    await runProtectedAction({
      session,
      onUnauthorized: onNeedAuth,
      action: async () => {
        setLoadingBranches(true);
        try {
          const payload = await apiClient.get("/api/github/branches", {
            query: { repoUrl: form.repoUrl },
          });
          setBranches(payload.branches || []);
          setRepoSummary(payload);
          setForm((current) => ({
            ...current,
            branch: current.branch || payload.defaultBranch || "",
          }));
          setStatus(
            `Loaded ${payload.branches?.length || 0} branches from ${payload.owner}/${payload.repository}.`,
          );
        } catch (requestError) {
          setError(requestError.message);
        } finally {
          setLoadingBranches(false);
        }
      },
    });
  }

  async function analyzeRepository(event) {
    event.preventDefault();
    setError("");
    setStatus("");

    await runProtectedAction({
      session,
      onUnauthorized: onNeedAuth,
      action: async () => {
        setLoadingAnalysis(true);
        try {
          const payload = await apiClient.post("/api/github/analyze", {
            body: {
              repoUrl: form.repoUrl,
              branch: form.branch,
              pullRequestUrl: form.pullRequestUrl,
              maxFiles: Number(form.maxFiles),
            },
          });
          setResult(payload);
          setStatus(
            `Analysis completed for ${payload.owner}/${payload.repository} using ${payload.sourceType}.`,
          );
        } catch (requestError) {
          setError(requestError.message);
        } finally {
          setLoadingAnalysis(false);
        }
      },
    });
  }

  return (
    <section className="panel panel-wide">
      <div className="section-heading">
        <span className="eyebrow">GitHub Analysis</span>
        <h2>Inspect a repository branch or pull request</h2>
        <p>
          Load branches first, then analyze a branch or point directly to a pull request URL.
        </p>
      </div>

      <form className="stack-lg" onSubmit={analyzeRepository}>
        <div className="field-grid two-columns">
          <label className="field field-span-2">
            <span>Repository URL</span>
            <input
              type="url"
              placeholder="https://github.com/owner/repository"
              value={form.repoUrl}
              onChange={(event) => updateField("repoUrl", event.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Branch</span>
            <select
              value={form.branch}
              onChange={(event) => updateField("branch", event.target.value)}
            >
              <option value="">Use default branch</option>
              {branches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Max files</span>
            <input
              type="number"
              min="1"
              max="10"
              value={form.maxFiles}
              onChange={(event) => updateField("maxFiles", event.target.value)}
            />
          </label>

          <label className="field field-span-2">
            <span>Pull request URL</span>
            <input
              type="url"
              placeholder="Optional: https://github.com/owner/repository/pull/12"
              value={form.pullRequestUrl}
              onChange={(event) => updateField("pullRequestUrl", event.target.value)}
            />
          </label>
        </div>

        <div className="button-row">
          <button
            type="button"
            className="ghost-button"
            onClick={fetchBranches}
            disabled={loadingBranches || !form.repoUrl}
          >
            {loadingBranches ? "Loading branches..." : "Load branches"}
          </button>

          <button
            type="submit"
            className="primary-button"
            disabled={loadingAnalysis || !form.repoUrl}
          >
            {loadingAnalysis ? "Analyzing repository..." : "Analyze repository"}
          </button>
        </div>
      </form>

      {repoSummary ? (
        <div className="inline-summary">
          <span>{repoSummary.owner}/{repoSummary.repository}</span>
          <span>Default branch: {repoSummary.defaultBranch}</span>
        </div>
      ) : null}

      {status ? <div className="status-message success">{status}</div> : null}
      {error ? <div className="status-message error">{error}</div> : null}

      {result ? (
        <>
          <div className="inline-summary">
            <span>Source: {result.sourceType}</span>
            <span>Branch: {result.branch}</span>
            <span>Findings: {result.findings?.length || 0}</span>
          </div>
          <FindingsList findings={result.findings} title="Repository findings" />
        </>
      ) : null}
    </section>
  );
}
