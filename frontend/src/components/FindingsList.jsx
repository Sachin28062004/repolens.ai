function SeverityPill({ value }) {
  const normalized = (value || "low").toLowerCase();

  return (
    <span className={`severity severity-${normalized}`}>
      {normalized}
    </span>
  );
}

export function FindingsList({ findings, title }) {
  if (!findings?.length) {
    return null;
  }

  return (
    <div className="result-panel">
      {title ? <h3>{title}</h3> : null}
      <div className="stack-md">
        {findings.map((finding, index) => (
          <article className="finding-card" key={`${finding.fileName}-${index}`}>
            <div className="finding-header">
              <div>
                <p className="finding-file">{finding.fileName}</p>
                <h4>{finding.bug}</h4>
              </div>
              <SeverityPill value={finding.severity} />
            </div>

            <div className="finding-copy">
              <p>
                <strong>Rationale:</strong> {finding.explanation}
              </p>
              <p>
                <strong>Fix:</strong> {finding.fix}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
