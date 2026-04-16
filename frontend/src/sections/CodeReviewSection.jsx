import { useState } from "react";
import { LANGUAGE_OPTIONS } from "../config";
import { runProtectedAction } from "../middleware/authGuard";
import { ReviewResult } from "../components/ReviewResult";

const starterSnippet = `public class Sample {
    public int divide(int value) {
        return 100 / value;
    }
}`;

export function CodeReviewSection({
  apiClient,
  session,
  onNeedAuth,
}) {
  const [form, setForm] = useState({
    language: "java",
    fileName: "Sample.java",
    code: starterSnippet,
  });
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function reviewCode(event) {
    event.preventDefault();
    setError("");
    setStatus("");

    await runProtectedAction({
      session,
      onUnauthorized: onNeedAuth,
      action: async () => {
        setLoading(true);
        try {
          const payload = await apiClient.post("/api/reviews/code", {
            body: {
              code: form.code,
              language: form.language,
              fileName: form.fileName,
            },
          });
          setResult(payload);
          setStatus("Code review completed.");
        } catch (requestError) {
          setError(requestError.message);
        } finally {
          setLoading(false);
        }
      },
    });
  }

  return (
    <section className="panel">
      <div className="section-heading">
        <span className="eyebrow">Snippet Review</span>
        <h2>Review a single file</h2>
        <p>Paste code, choose a language, and get structured feedback.</p>
      </div>

      <form className="stack-lg" onSubmit={reviewCode}>
        <div className="field-grid">
          <label className="field">
            <span>Language</span>
            <select
              value={form.language}
              onChange={(event) => updateField("language", event.target.value)}
            >
              {LANGUAGE_OPTIONS.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>File name</span>
            <input
              type="text"
              placeholder="File name"
              value={form.fileName}
              onChange={(event) => updateField("fileName", event.target.value)}
            />
          </label>

          <label className="field field-span-2">
            <span>Code</span>
            <textarea
              rows="14"
              value={form.code}
              onChange={(event) => updateField("code", event.target.value)}
              required
            />
          </label>
        </div>

        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? "Reviewing..." : "Review snippet"}
        </button>
      </form>

      {status ? <div className="status-message success">{status}</div> : null}
      {error ? <div className="status-message error">{error}</div> : null}

      <ReviewResult result={result} />
    </section>
  );
}
