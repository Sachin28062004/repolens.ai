import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { MetricCard } from "../components/ui/MetricCard";

export function DashboardPage() {
  const { metrics } = useApp();

  return (
    <div className="page-fade space-y-6">
      <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/70 sm:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold tracking-[0.24em] text-slate-600 uppercase">
              Dashboard
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              AI-Powered Code Review, Simplified
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Detect bugs, understand issues, and improve code quality in seconds.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/app/review" className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                Start Reviewing
              </Link>
              <Link to="/app/github" className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                Analyze Repository
              </Link>
            </div>
          </div>

          <div className="w-full max-w-md rounded-[2rem] bg-slate-950 p-5 text-white shadow-2xl shadow-slate-900/20">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-white/80" />
              <span className="h-3 w-3 rounded-full bg-white/40" />
              <span className="h-3 w-3 rounded-full bg-white/20" />
            </div>
            <div className="mt-6 space-y-3">
              <div className="h-4 w-4/5 rounded-full bg-white/15" />
              <div className="h-4 w-2/3 rounded-full bg-white/10" />
              <div className="h-4 w-3/5 rounded-full bg-white/15" />
              <div className="mt-6 rounded-2xl bg-white/5 p-4">
                <div className="h-3 w-24 rounded-full bg-blue-400/70" />
                <div className="mt-3 h-3 w-3/4 rounded-full bg-white/10" />
                <div className="mt-2 h-3 w-2/3 rounded-full bg-white/10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Total Reviews" value={metrics.totalReviews} caption="Completed review actions" />
        <MetricCard label="Bugs Detected" value={metrics.bugsDetected} caption="Reported issues across outputs" />
        <MetricCard label="Files Analyzed" value={metrics.filesAnalyzed} caption="Source files processed" />
      </section>
    </div>
  );
}
