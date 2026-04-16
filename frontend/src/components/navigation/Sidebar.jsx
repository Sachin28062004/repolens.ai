import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Dashboard", to: "/app/dashboard" },
  { label: "Code Review", to: "/app/review" },
  { label: "GitHub Analysis", to: "/app/github" },
  { label: "File Upload", to: "/app/upload" },
];

function linkClass(isActive) {
  return [
    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
    isActive
      ? "bg-slate-950 text-white shadow-lg shadow-slate-900/15"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
  ].join(" ");
}

export function Sidebar({ mobileOpen, onClose }) {
  return (
    <>
      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white/95 px-5 py-6 backdrop-blur",
          "transition-transform duration-200 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        <div className="flex h-full flex-col gap-8">
          <div className="flex items-center gap-3 px-1">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
              RL
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.24em] text-slate-900 uppercase">RepoLens AI</p>
              <p className="text-xs text-slate-500">Review workspace</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => linkClass(isActive)}
                onClick={onClose}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto rounded-3xl bg-slate-950 p-5 text-white shadow-xl shadow-slate-900/15">
            <p className="text-sm font-medium text-slate-200">Focused review flow</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">Fast inspection, fewer clicks, clean output.</p>
          </div>
        </div>
      </aside>

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden"
          onClick={onClose}
        />
      ) : null}
    </>
  );
}
