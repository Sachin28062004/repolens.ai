import { Alert } from "../ui/Alert";
import { Spinner } from "../ui/Spinner";
import { SeverityBadge } from "../ui/SeverityBadge";

export function CodeReviewResults({ result, loading }) {
  if (loading) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Spinner />
          Reviewing
        </div>
        <div className="mt-6 space-y-3">
          <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-100" />
          <div className="h-4 w-5/6 animate-pulse rounded-full bg-slate-100" />
          <div className="h-4 w-3/4 animate-pulse rounded-full bg-slate-100" />
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
        <p className="text-sm text-slate-500">No review yet.</p>
      </div>
    );
  }

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
      <h3 className="text-lg font-semibold tracking-tight text-slate-950">Review output</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{result.explanation}</p>

      <div className="mt-6 space-y-4">
        {result.bugs?.length ? (
          result.bugs.map((bug, index) => (
            <article key={`${bug.bug}-${index}`} className="rounded-3xl bg-slate-50 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Issue {index + 1}</p>
                  <h4 className="mt-2 text-base font-semibold text-slate-950">{bug.bug}</h4>
                </div>
                <SeverityBadge value={bug.severity} />
              </div>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <p>
                  <span className="font-medium text-slate-900">Explanation:</span> {bug.explanation}
                </p>
                <p>
                  <span className="font-medium text-slate-900">Suggested fix:</span> {bug.fix}
                </p>
              </div>
            </article>
          ))
        ) : (
          <Alert tone="success">No issues found.</Alert>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-slate-950">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
          <span>Updated code</span>
        </div>
        <pre className="overflow-x-auto p-4 text-sm leading-6 text-slate-100">
          <code>{result.fixedCode}</code>
        </pre>
      </div>
    </section>
  );
}
