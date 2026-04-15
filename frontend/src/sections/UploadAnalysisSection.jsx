import { useState } from "react";
import { runProtectedAction } from "../middleware/authGuard";
import { FindingsList } from "../components/FindingsList";

export function UploadAnalysisSection({
  apiClient,
  session,
  onNeedAuth,
}) {
  const [archive, setArchive] = useState(null);
  const [files, setFiles] = useState([]);
  const [context, setContext] = useState("");
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function analyzeUpload(event) {
    event.preventDefault();
    setError("");
    setStatus("");

    await runProtectedAction({
      session,
      onUnauthorized: onNeedAuth,
      action: async () => {
        setLoading(true);
        try {
          const formData = new FormData();
          if (archive) {
            formData.append("archive", archive);
          }
          files.forEach((file) => formData.append("files", file));
          if (context.trim()) {
            formData.append("context", context.trim());
          }

          const payload = await apiClient.post("/api/uploads", {
            body: formData,
          });
          setResult(payload);
          setStatus(`Upload analysis completed for ${payload.analyzedFiles} file(s).`);
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
        <span className="eyebrow">Upload Review</span>
        <h2>Analyze source files or a ZIP archive</h2>
        <p>
          Great for quick demos, offline samples, or code you do not want to pull from GitHub.
        </p>
      </div>

      <form className="stack-lg" onSubmit={analyzeUpload}>
        <div className="field-grid">
          <label className="field">
            <span>ZIP archive</span>
            <input
              type="file"
              accept=".zip"
              onChange={(event) => setArchive(event.target.files?.[0] || null)}
            />
          </label>

          <label className="field">
            <span>Individual files</span>
            <input
              type="file"
              multiple
              onChange={(event) => setFiles(Array.from(event.target.files || []))}
            />
          </label>

          <label className="field field-span-2">
            <span>Analysis context</span>
            <textarea
              rows="5"
              placeholder="Optional: focus on security, null safety, or production readiness."
              value={context}
              onChange={(event) => setContext(event.target.value)}
            />
          </label>
        </div>

        <div className="upload-list">
          {archive ? <span>Archive: {archive.name}</span> : null}
          {files.length
            ? files.map((file) => <span key={`${file.name}-${file.size}`}>{file.name}</span>)
            : null}
        </div>

        <button
          type="submit"
          className="primary-button"
          disabled={loading || (!archive && files.length === 0)}
        >
          {loading ? "Analyzing upload..." : "Analyze upload"}
        </button>
      </form>

      {status ? <div className="status-message success">{status}</div> : null}
      {error ? <div className="status-message error">{error}</div> : null}

      {result ? (
        <>
          <div className="inline-summary">
            <span>Analyzed files: {result.analyzedFiles}</span>
          </div>
          <FindingsList findings={result.findings} title="Upload findings" />
        </>
      ) : null}
    </section>
  );
}
