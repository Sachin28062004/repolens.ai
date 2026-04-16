const toneMap = {
  low: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  medium: "bg-amber-50 text-amber-700 ring-amber-200",
  high: "bg-rose-50 text-rose-700 ring-rose-200",
  critical: "bg-rose-50 text-rose-700 ring-rose-200",
};

export function SeverityBadge({ value = "low" }) {
  const normalized = String(value).toLowerCase();
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase ring-1 ${
        toneMap[normalized] || toneMap.low
      }`}
    >
      {normalized}
    </span>
  );
}
