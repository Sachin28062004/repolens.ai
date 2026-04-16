import { useState } from "react";
import { Alert } from "../ui/Alert";
import { Spinner } from "../ui/Spinner";

const initialForms = {
  login: {
    email: "",
    password: "",
  },
  register: {
    name: "",
    email: "",
    password: "",
  },
};

export function AuthCard({ onLogin, onRegister, onGitHubLogin }) {
  const [mode, setMode] = useState("login");
  const [forms, setForms] = useState(initialForms);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const currentForm = forms[mode];

  function updateField(field, value) {
    setForms((current) => ({
      ...current,
      [mode]: {
        ...current[mode],
        [field]: value,
      },
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      if (mode === "login") {
        await onLogin(forms.login);
        return;
      }

      await onRegister(forms.register);
    } catch (requestError) {
      setError(requestError.message || "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="auth" className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/70 sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-blue-600 uppercase">Access</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Sign in</h2>
        </div>
        <div className="inline-flex rounded-2xl bg-slate-100 p-1 text-sm font-medium">
          <button
            type="button"
            className={`rounded-xl px-3 py-2 transition ${
              mode === "login" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"
            }`}
            onClick={() => setMode("login")}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`rounded-xl px-3 py-2 transition ${
              mode === "register" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"
            }`}
            onClick={() => setMode("register")}
          >
            Create account
          </button>
        </div>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        {mode === "register" ? (
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">Name</span>
            <input
              type="text"
              value={currentForm.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Full name"
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 placeholder:text-slate-400 transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </label>
        ) : null}

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-600">Email</span>
          <input
            type="email"
            value={currentForm.email}
            onChange={(event) => updateField("email", event.target.value)}
            placeholder="name@company.com"
            required
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 placeholder:text-slate-400 transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-600">Password</span>
          <input
            type="password"
            value={currentForm.password}
            onChange={(event) => updateField("password", event.target.value)}
            placeholder={mode === "register" ? "At least 8 characters" : "Password"}
            minLength={mode === "register" ? 8 : 1}
            required
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 placeholder:text-slate-400 transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
          />
        </label>

        {error ? <Alert tone="error">{error}</Alert> : null}

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={busy}
        >
          {busy ? <Spinner /> : null}
          {busy ? "Working" : mode === "login" ? "Login" : "Create account"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400">or</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <button
        type="button"
        className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        onClick={onGitHubLogin}
        disabled={busy}
      >
        Continue with GitHub
      </button>
    </section>
  );
}
