import { useRef, useState } from "react";

export function Dropzone({ files, setFiles, archive, setArchive, ignoredFiles }) {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  function handleFileSelect(event) {
    setFiles(Array.from(event.target.files || []));
  }

  function handleArchiveSelect(event) {
    setArchive(event.target.files?.[0] || null);
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragActive(false);
    setFiles(Array.from(event.dataTransfer.files || []));
  }

  return (
    <div className="space-y-4">
      <div
        className={[
          "rounded-[2rem] border-2 border-dashed p-8 text-center transition",
          dragActive ? "border-blue-400 bg-blue-50/70" : "border-slate-200 bg-white",
        ].join(" ")}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        <p className="text-base font-semibold text-slate-950">Drop files here</p>
        <p className="mt-2 text-sm text-slate-500">or click to browse</p>

        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            className="rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Select files
          </button>
          <label className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            ZIP archive
            <input className="hidden" type="file" accept=".zip" onChange={handleArchiveSelect} />
          </label>
        </div>

        <input ref={inputRef} className="hidden" type="file" multiple onChange={handleFileSelect} />
      </div>

      {archive || files.length ? (
        <div className="space-y-3 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
          {archive ? <p className="text-sm text-slate-700">Archive: {archive.name}</p> : null}
          {files.length ? (
            <div className="flex flex-wrap gap-2">
              {files.map((file) => (
                <span
                  key={`${file.name}-${file.size}`}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {file.name}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {ignoredFiles.length ? (
        <div className="rounded-3xl bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-950">Ignored</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {ignoredFiles.map((file) => (
              <span
                key={file}
                className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200"
              >
                {file}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
