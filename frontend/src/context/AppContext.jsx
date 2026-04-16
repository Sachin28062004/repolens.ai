import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../config";
import { createApiClient, createRepoLensApi } from "../services/api";
import { clearSession, loadMetrics, loadSession, saveMetrics, saveSession } from "../services/session";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [session, setSession] = useState(() => loadSession());
  const [metrics, setMetrics] = useState(() => loadMetrics());

  useEffect(() => {
    saveSession(session);
  }, [session]);

  useEffect(() => {
    saveMetrics(metrics);
  }, [metrics]);

  const signIn = useCallback((nextSession) => {
    setSession(nextSession);
  }, []);

  const signOut = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  const recordActivity = useCallback(({ reviews = 0, bugs = 0, files = 0 }) => {
    setMetrics((current) => ({
      totalReviews: current.totalReviews + reviews,
      bugsDetected: current.bugsDetected + bugs,
      filesAnalyzed: current.filesAnalyzed + files,
    }));
  }, []);

  const apiClient = useMemo(
    () =>
      createApiClient({
        baseUrl: API_BASE_URL,
        getToken: () => session?.token,
        onUnauthorized: signOut,
      }),
    [session?.token, signOut],
  );

  const api = useMemo(() => createRepoLensApi(apiClient), [apiClient]);

  const value = useMemo(
    () => ({
      session,
      metrics,
      api,
      signIn,
      signOut,
      recordActivity,
      isAuthenticated: Boolean(session?.token),
    }),
    [api, metrics, recordActivity, session, signIn, signOut],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) {
    throw new Error("useApp must be used within AppProvider");
  }
  return value;
}
