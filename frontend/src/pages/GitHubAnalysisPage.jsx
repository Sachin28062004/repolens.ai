import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { Alert } from "../components/ui/Alert";
import { Spinner } from "../components/ui/Spinner";
import { FindingList } from "../components/results/FindingList";

export function GitHubAnalysisPage() {
  const { api, recordActivity } = useApp();
  const [repoUrl, setRepoUrl] = useState("");
  const [branches, setBranches] = useState([]);
  const [branch, setBranch] = useState("");
  const [defaultBranch, setDefaultBranch] = useState("");
  const [prMode, setPrMode] = useState("none");
  const [prUrl, setPrUrl] = useState("");
  const [maxFiles, setMaxFiles] = useState(6);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (prMode !== "custom") {
      setPrUrl("");
    }
  }, [prMode]);

  async function loadBranches() {
    if (!repoUrl.trim()) {
      return;
    }

    setError("");
    setLoadingBranches(true);

    try {
      const payload = await api.loadBranches(repoUrl.trim());
      const nextBranches = payload.branches || [];
      setBranches(nextBranches);
      setDefaultBranch(payload.defaultBranch || "");
      setBranch((current) => current || payload.defaultBranch || "");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoadingBranches(false);
    }
  }

  async function analyzeRepository(event) {
    event.preventDefault();
    setError("");
    setLoadingAnalysis(true);

    try {
      const payload = await api.analyzeRepository({
        repoUrl: repoUrl.trim(),
        branch: branch || defaultBranch,
        pullRequestUrl: prMode === "custom" ? prUrl.trim() : "",
        maxFiles: Number(maxFiles),
      });

      setResult(payload);
      recordActivity({ reviews: 1, bugs: payload.findings?.length || 0 });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoadingAnalysis(false);
    }
  }

  return (
    <div className="page-fade grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/70 sm:p-8">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-blue-600 uppercase">GitHub Analysis</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Analyze a repository</h2>
        </div>

        <form className="mt-6 space-y-5" onSubmit={analyzeRepository}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">GitHub Repo URL</span>
            <input
              type="url"
              value={repoUrl}
              onChange={(event) => setRepoUrl(event.target.value)}
              placeholder="https://github.com/owner/repository"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-600">Branch</span>
              <select
                value={branch}
                onChange={(event) => setBranch(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              >
                <option value="">{defaultBranch ? `Default (${defaultBranch})` : "Default branch"}</option>
                {branches.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-600">PR selection</span>
              <select
                value={prMode}
                onChange={(event) => setPrMode(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              >
                <option value="none">None</option>
                <option value="custom">Custom URL</option>
              </select>
            </label>
          </div>

          {prMode === "custom" ? (
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-600">PR URL</span>
              <input
                type="url"
                value={prUrl}
                onChange={(event) => setPrUrl(event.target.value)}
                placeholder="https://github.com/owner/repository/pull/12"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </label>
          ) : null}

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">Max files</span>
            <input
              type="number"
              min="1"
              max="10"
              value={maxFiles}
              onChange={(event) => setMaxFiles(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              onClick={loadBranches}
              disabled={loadingBranches || !repoUrl.trim()}
            >
              {loadingBranches ? "Loading" : "Load branches"}
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={loadingAnalysis || !repoUrl.trim()}
            >
              {loadingAnalysis ? <Spinner /> : null}
              {loadingAnalysis ? "Analyzing" : "Analyze Repository"}
            </button>
          </div>

          {error ? <Alert tone="error">{error}</Alert> : null}
        </form>
      </section>

      <div className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              Branch: {result?.branch || branch || defaultBranch || "Default"}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              Source: {result?.sourceType || "Repository"}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              Findings: {result?.findings?.length || 0}
            </span>
          </div>
        </div>

        <FindingList findings={result?.findings} title="File-wise results" emptyLabel="No analysis yet." />
      </div>
    </div>
  );
}
