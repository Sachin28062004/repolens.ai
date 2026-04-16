import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { UserMenu } from "./UserMenu";

const titles = {
  "/app/dashboard": "Dashboard",
  "/app/review": "Code Review",
  "/app/github": "GitHub Analysis",
  "/app/upload": "File Upload",
};

export function Topbar({ onMenuClick }) {
  const location = useLocation();
  const { session, signOut } = useApp();

  const title = useMemo(() => titles[location.pathname] || "RepoLens AI", [location.pathname]);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/85 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 lg:hidden"
            onClick={onMenuClick}
          >
            <span className="sr-only">Open navigation</span>
            <span className="flex flex-col gap-1.5">
              <span className="block h-0.5 w-4 rounded-full bg-current" />
              <span className="block h-0.5 w-4 rounded-full bg-current" />
              <span className="block h-0.5 w-4 rounded-full bg-current" />
            </span>
          </button>
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-blue-600 uppercase">Workspace</p>
            <h1 className="text-lg font-semibold tracking-tight text-slate-950">{title}</h1>
          </div>
        </div>

        <UserMenu session={session} onLogout={signOut} />
      </div>
    </header>
  );
}
