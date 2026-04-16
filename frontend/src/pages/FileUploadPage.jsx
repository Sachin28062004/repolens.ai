import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { Alert } from "../components/ui/Alert";
import { Spinner } from "../components/ui/Spinner";
import { FindingList } from "../components/results/FindingList";
import { Dropzone } from "../components/upload/Dropzone";

const ignoredPatterns = ["node_modules", ".env", ".git", "dist", "build", ".next"];

function fileNameFor(file) {
  return file.webkitRelativePath || file.name;
}

export function FileUploadPage() {
  const { api, recordActivity } = useApp();
  const [archive, setArchive] = useState(null);
  const [files, setFiles] = useState([]);
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const uploadedNames = useMemo(() => files.map(fileNameFor), [files]);

  const ignoredFiles = useMemo(() => {
    return uploadedNames.filter((name) => ignoredPatterns.some((pattern) => name.includes(pattern)));
  }, [uploadedNames]);

  async function analyzeUpload(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();

      if (archive) {
        formData.append("archive", archive);
      }

      files.forEach((file) => {
        formData.append("files", file);
      });

      if (context.trim()) {
        formData.append("context", context.trim());
      }

      const payload = await api.analyzeUpload(formData);
      setResult(payload);
      recordActivity({
        reviews: 1,
        bugs: payload.findings?.length || 0,
        files: payload.analyzedFiles || files.length,
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-fade grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/70 sm:p-8">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-blue-600 uppercase">File Upload</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Analyze files</h2>
        </div>

        <form className="mt-6 space-y-5" onSubmit={analyzeUpload}>
          <Dropzone
            files={files}
            setFiles={setFiles}
            archive={archive}
            setArchive={setArchive}
            ignoredFiles={ignoredFiles}
          />

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">Context</span>
            <textarea
              rows={5}
              value={context}
              onChange={(event) => setContext(event.target.value)}
              placeholder="Security focus, refactor, or production readiness."
              className="w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </label>

          {error ? <Alert tone="error">{error}</Alert> : null}

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={loading || (!archive && files.length === 0)}
          >
            {loading ? <Spinner /> : null}
            {loading ? "Analyzing" : "Analyze Files"}
          </button>
        </form>
      </section>

      <div className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
          <p className="text-sm font-semibold text-slate-950">Upload summary</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Selected</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{files.length + (archive ? 1 : 0)}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Ignored</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{ignoredFiles.length}</p>
            </div>
          </div>
        </div>

        <FindingList findings={result?.findings} title="Results" emptyLabel="No analysis yet." />
      </div>
    </div>
  );
}
