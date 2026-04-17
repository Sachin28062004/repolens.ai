import { AuthCard } from "../components/auth/AuthCard";
import { PublicLayout } from "../layouts/PublicLayout";
import { useApp } from "../context/AppContext";

export function LandingPage() {
  const { api, signIn } = useApp();

  async function handleLogin(form) {
    const payload = await api.login(form);
    signIn(payload);
  }

  async function handleRegister(form) {
    const payload = await api.register(form);
    signIn(payload);
  }

  return (
    <PublicLayout>
      <div className="page-fade mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <section className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold tracking-[0.24em] text-slate-700 uppercase shadow-sm ring-1 ring-slate-200/70">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              RepoLens AI
            </div>

            <div className="space-y-5">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                AI-Powered Code Review, Simplified
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Detect bugs, understand issues, and improve code quality in seconds.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="#auth"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Start Reviewing
              </a>
              <a
                href="#auth"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Analyze Repository
              </a>
            </div>
          </section>

          <div className="lg:pl-6">
            <AuthCard onLogin={handleLogin} onRegister={handleRegister} />
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
