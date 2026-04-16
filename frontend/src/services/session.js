const SESSION_KEY = "repolens-session";
const METRICS_KEY = "repolens-metrics";

const defaultMetrics = {
  totalReviews: 0,
  bugsDetected: 0,
  filesAnalyzed: 0,
};

export function loadSession() {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(session) {
  if (!session) {
    clearSession();
    return;
  }

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

export function loadMetrics() {
  try {
    const raw = window.localStorage.getItem(METRICS_KEY);
    if (!raw) {
      return defaultMetrics;
    }

    return {
      ...defaultMetrics,
      ...JSON.parse(raw),
    };
  } catch {
    return defaultMetrics;
  }
}

export function saveMetrics(metrics) {
  window.localStorage.setItem(METRICS_KEY, JSON.stringify(metrics));
}
