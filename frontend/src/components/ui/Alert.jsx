export function Alert({ tone = "neutral", children }) {
  const toneClasses = {
    neutral: "border-slate-200 bg-white text-slate-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    error: "border-rose-200 bg-rose-50 text-rose-700",
  };

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${toneClasses[tone] || toneClasses.neutral}`}>
      {children}
    </div>
  );
}
