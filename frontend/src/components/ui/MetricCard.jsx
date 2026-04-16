export function MetricCard({ label, value, caption }) {
  return (
    <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-3 text-sm leading-6 text-slate-500">{caption}</p>
    </article>
  );
}
