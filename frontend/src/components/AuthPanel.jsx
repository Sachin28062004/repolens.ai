import { useState } from "react";

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

export function AuthPanel({
  busy,
  onLogin,
  onRegister,
  onGitHubLogin,
}) {
  const [mode, setMode] = useState("login");
  const [forms, setForms] = useState(initialForms);
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

    if (mode === "login") {
      await onLogin(forms.login);
      return;
    }

    await onRegister(forms.register);
  }

  return (
    <section className="panel auth-panel">
      <div className="section-heading">
        <span className="eyebrow">Access</span>
        <h2>Sign in to continue</h2>
        <p>Use your account or continue with GitHub.</p>
      </div>

      <div className="segmented-control">
        <button
          type="button"
          className={mode === "login" ? "active" : ""}
          onClick={() => setMode("login")}
        >
          Sign in
        </button>
        <button
          type="button"
          className={mode === "register" ? "active" : ""}
          onClick={() => setMode("register")}
        >
          Create account
        </button>
      </div>

      <form className="stack-md" onSubmit={handleSubmit}>
        {mode === "register" ? (
          <label className="field">
            <span>Name</span>
            <input
              type="text"
              placeholder="Full name"
              value={currentForm.name}
              onChange={(event) => updateField("name", event.target.value)}
              required
            />
          </label>
        ) : null}

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            placeholder="name@company.com"
            value={currentForm.email}
            onChange={(event) => updateField("email", event.target.value)}
            required
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            placeholder={mode === "register" ? "At least 8 characters" : "Password"}
            value={currentForm.password}
            onChange={(event) => updateField("password", event.target.value)}
            minLength={mode === "register" ? 8 : 1}
            required
          />
        </label>

        <button type="submit" className="primary-button" disabled={busy}>
          {busy ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
        </button>
      </form>

      <div className="divider">
        <span>or</span>
      </div>

      <button
        type="button"
        className="ghost-button"
        onClick={onGitHubLogin}
        disabled={busy}
      >
        Continue with GitHub
      </button>
    </section>
  );
}
