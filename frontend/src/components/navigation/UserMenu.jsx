import { useEffect, useMemo, useRef, useState } from "react";

function initials(name) {
  if (!name) {
    return "RL";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export function UserMenu({ session, onLogout }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const label = useMemo(() => session?.user?.name || "Account", [session?.user?.name]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition hover:bg-slate-50"
        onClick={() => setOpen((current) => !current)}
      >
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
          {initials(session?.user?.name)}
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-slate-950">{label}</p>
          <p className="text-xs text-slate-500">{session?.user?.email || "Signed in"}</p>
        </div>
      </button>

      {open ? (
        <div className="absolute right-0 top-[4.25rem] w-72 rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/10">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-950">{label}</p>
            <p className="mt-1 text-sm text-slate-500">{session?.user?.email || "Active session"}</p>
          </div>
          <button
            type="button"
            className="mt-3 flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
            onClick={onLogout}
          >
            Logout
            <span className="text-slate-400">↗</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
