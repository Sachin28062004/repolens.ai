import { SeverityBadge } from "../ui/SeverityBadge";

export function FindingList({ findings, title, emptyLabel = "No results" }) {
  if (!findings?.length) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
        <p className="text-sm text-slate-500">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
      {title ? <h3 className="text-lg font-semibold tracking-tight text-slate-950">{title}</h3> : null}
      <div className="mt-5 space-y-4">
        {findings.map((finding, index) => (
          <article key={`${finding.fileName}-${index}`} className="rounded-3xl bg-slate-50 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                {finding.fileName ? (
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">{finding.fileName}</p>
                ) : null}
                <h4 className="mt-2 text-base font-semibold text-slate-950">{finding.bug}</h4>
              </div>
              <SeverityBadge value={finding.severity} />
            </div>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <p>
                <span className="font-medium text-slate-900">Explanation:</span> {finding.explanation}
              </p>
              <p>
                <span className="font-medium text-slate-900">Suggested fix:</span> {finding.fix}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
