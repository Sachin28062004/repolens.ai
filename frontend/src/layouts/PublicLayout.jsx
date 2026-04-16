export function PublicLayout({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.10),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.05),_transparent_30%)]" />
      <div className="absolute left-[-6rem] top-10 -z-10 h-72 w-72 rounded-full bg-blue-500/5 blur-3xl" />
      <div className="absolute right-[-5rem] bottom-[-4rem] -z-10 h-80 w-80 rounded-full bg-slate-900/5 blur-3xl" />
      {children}
    </div>
  );
}
