import { useState } from "react";
import { LANGUAGE_OPTIONS } from "../config";
import { useApp } from "../context/AppContext";
import { Alert } from "../components/ui/Alert";
import { Spinner } from "../components/ui/Spinner";
import { CodeReviewResults } from "../components/results/CodeReviewResults";

const starterCode = `class Sample {
  divide(value) {
    return 100 / value;
  }
}`;

export function CodeReviewPage() {
  const { api, recordActivity } = useApp();
  const [form, setForm] = useState({
    language: "java",
    fileName: "Sample.java",
    code: starterCode,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function reviewCode(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = await api.reviewCode(form);
      setResult(payload);
      recordActivity({ reviews: 1, bugs: payload.bugs?.length || 0 });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-fade grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
      <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/70 sm:p-7">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-blue-600 uppercase">Code Review</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Review a file</h2>
        </div>

        <form className="mt-5 space-y-4" onSubmit={reviewCode}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-600">Language</span>
              <select
                value={form.language}
                onChange={(event) => updateField("language", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              >
                {LANGUAGE_OPTIONS.map((language) => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-600">File name</span>
              <input
                type="text"
                value={form.fileName}
                onChange={(event) => updateField("fileName", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">Code</span>
            <textarea
              rows={12}
              value={form.code}
              onChange={(event) => updateField("code", event.target.value)}
              className="min-h-[260px] w-full rounded-[1.5rem] border border-slate-200 bg-slate-950 px-4 py-4 font-mono text-sm leading-6 text-slate-100 shadow-inner shadow-slate-900/20 transition placeholder:text-slate-500 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
            />
          </label>

          {error ? <Alert tone="error">{error}</Alert> : null}

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={loading}
          >
            {loading ? <Spinner /> : null}
            {loading ? "Reviewing" : "Review Code"}
          </button>
        </form>
      </section>

      <CodeReviewResults result={result} loading={loading} />
    </div>
  );
}
