import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert } from "../components/ui/Alert";
import { Spinner } from "../components/ui/Spinner";
import { useApp } from "../context/AppContext";
import { parseOAuthCallback } from "../services/oauth";

export function OAuthCallbackPage() {
  const navigate = useNavigate();
  const { signIn } = useApp();
  const [message, setMessage] = useState("Completing sign-in");
  const [tone, setTone] = useState("neutral");

  useEffect(() => {
    const oauth = parseOAuthCallback(window.location.pathname, window.location.search);

    if (!oauth) {
      navigate("/", { replace: true });
      return;
    }

    if (oauth.error) {
      setTone("error");
      setMessage(oauth.error);
      return;
    }

    signIn(oauth.session);
    navigate("/app/dashboard", { replace: true });
  }, [navigate, signIn]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <Spinner />
          {message}
        </div>
        {tone === "error" ? <Alert tone="error">{message}</Alert> : null}
      </div>
    </div>
  );
}
