import { useEffect, useState } from "react";
import { API_BASE_URL, PRODUCT_FEATURES } from "./config";
import { createApiClient } from "./lib/apiClient";
import { clearSession, loadSession, saveSession } from "./lib/storage";
import { isSessionActive, parseOAuthCallback } from "./middleware/authGuard";
import { AuthPanel } from "./components/AuthPanel";
import { ShellHeader } from "./components/ShellHeader";
import { RepositoryAnalysisSection } from "./sections/RepositoryAnalysisSection";
import { CodeReviewSection } from "./sections/CodeReviewSection";
import { UploadAnalysisSection } from "./sections/UploadAnalysisSection";

function Banner({ message, tone }) {
  if (!message) {
    return null;
  }

  return (
    <div className={`banner banner-${tone}`}>
      {message}
    </div>
  );
}

function OverviewCard({ title, value, caption }) {
  return (
    <article className="overview-card">
      <span>{title}</span>
      <strong>{value}</strong>
      <p>{caption}</p>
    </article>
  );
}

export default function App() {
  const [session, setSession] = useState(() => loadSession());
  const [banner, setBanner] = useState({
    message: "",
    tone: "neutral",
  });
  const [authBusy, setAuthBusy] = useState(false);

  function showBanner(message, tone = "neutral") {
    setBanner({ message, tone });
  }

  function logout(message = "You have been signed out.", tone = "neutral") {
    clearSession();
    setSession(null);
    showBanner(message, tone);
  }

  const apiClient = createApiClient({
    baseUrl: API_BASE_URL,
    getToken: () => session?.token,
    onUnauthorized: () =>
      logout("Your session expired. Please sign in again.", "warning"),
  });

  useEffect(() => {
    const oauth = parseOAuthCallback(window.location.pathname, window.location.search);
    if (!oauth) {
      return;
    }

    if (oauth.error) {
      showBanner(oauth.error, "error");
      window.history.replaceState({}, "", "/");
      return;
    }

    saveSession(oauth.session);
    setSession(oauth.session);
    showBanner("GitHub login completed successfully.", "success");
    window.history.replaceState({}, "", "/");
  }, []);

  async function handleLogin(form) {
    setAuthBusy(true);
    try {
      const payload = await apiClient.post("/api/auth/login", {
        body: form,
      });
      saveSession(payload);
      setSession(payload);
      showBanner(`Welcome back, ${payload.user?.name || "developer"}.`, "success");
    } catch (error) {
      showBanner(error.message, "error");
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleRegister(form) {
    setAuthBusy(true);
    try {
      const payload = await apiClient.post("/api/auth/register", {
        body: form,
      });
      saveSession(payload);
      setSession(payload);
      showBanner("Account created and signed in successfully.", "success");
    } catch (error) {
      showBanner(error.message, "error");
    } finally {
      setAuthBusy(false);
    }
  }

  function handleGitHubLogin() {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/github`;
  }

  function handleNeedAuth() {
    logout("Please sign in before calling protected backend endpoints.", "warning");
  }

  const signedIn = isSessionActive(session);

  return (
    <div className="app-shell">
      <div className="background-orb orb-one" />
      <div className="background-orb orb-two" />
      <div className="background-grid" />

      <div className="page-wrap">
        <Banner message={banner.message} tone={banner.tone} />

        {!signedIn ? (
          <main className="landing-layout">
            <section className="hero-panel">
              <div className="hero-copy">
                <span className="eyebrow">RepoLens AI</span>
                <h1>Simple React frontend for your Spring code-review backend</h1>
                <p className="hero-text">
                  This interface is wired for the backend you already built:
                  password auth, GitHub OAuth, repository analysis, snippet review,
                  and upload-based inspection in one clean workspace.
                </p>
              </div>

              <div className="feature-strip">
                {PRODUCT_FEATURES.map((feature) => (
                  <span key={feature} className="feature-pill">
                    {feature}
                  </span>
                ))}
              </div>

              <div className="hero-metrics">
                <OverviewCard
                  title="Backend target"
                  value="Spring Boot"
                  caption="Secure JWT and OAuth-backed endpoints"
                />
                <OverviewCard
                  title="Frontend stack"
                  value="React + Vite"
                  caption="Fast local dev on port 3000"
                />
                <OverviewCard
                  title="Middleware"
                  value="2 layers"
                  caption="Auth guard plus request and response middleware"
                />
              </div>
            </section>

            <AuthPanel
              busy={authBusy}
              onLogin={handleLogin}
              onRegister={handleRegister}
              onGitHubLogin={handleGitHubLogin}
            />
          </main>
        ) : (
          <>
            <ShellHeader session={session} onLogout={() => logout()} />

            <main className="dashboard-layout">
              <section className="panel panel-wide">
                <div className="section-heading">
                  <span className="eyebrow">Workspace Overview</span>
                  <h2>Everything you need to drive the backend from the browser</h2>
                  <p>
                    Start with a GitHub repository, review a single file, or upload source files.
                    All protected actions are guarded before they hit the backend.
                  </p>
                </div>

                <div className="overview-grid">
                  <OverviewCard
                    title="Signed in as"
                    value={session.user?.provider || "LOCAL"}
                    caption={session.user?.email || "Authenticated session"}
                  />
                  <OverviewCard
                    title="Backend base URL"
                    value={API_BASE_URL.replace(/^https?:\/\//, "")}
                    caption="Configured with VITE_API_BASE_URL"
                  />
                  <OverviewCard
                    title="Available flows"
                    value="4"
                    caption="Auth, GitHub, snippet review, upload analysis"
                  />
                </div>
              </section>

              <RepositoryAnalysisSection
                apiClient={apiClient}
                session={session}
                onNeedAuth={handleNeedAuth}
              />

              <div className="split-layout">
                <CodeReviewSection
                  apiClient={apiClient}
                  session={session}
                  onNeedAuth={handleNeedAuth}
                />
                <UploadAnalysisSection
                  apiClient={apiClient}
                  session={session}
                  onNeedAuth={handleNeedAuth}
                />
              </div>
            </main>
          </>
        )}
      </div>
    </div>
  );
}
