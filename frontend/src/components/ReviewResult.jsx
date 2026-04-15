export function ReviewResult({ result }) {
  if (!result) {
    return null;
  }

  return (
    <div className="result-panel">
      <h3>Review Result</h3>
      <p className="muted-text">{result.explanation}</p>

      <div className="stack-md">
        {result.bugs?.length ? (
          result.bugs.map((bug, index) => (
            <article className="finding-card" key={`${bug.bug}-${index}`}>
              <div className="finding-header">
                <div>
                  <p className="finding-file">Issue {index + 1}</p>
                  <h4>{bug.bug}</h4>
                </div>
                <span className={`severity severity-${bug.severity}`}>
                  {bug.severity}
                </span>
              </div>
              <div className="finding-copy">
                <p>
                  <strong>Why:</strong> {bug.explanation}
                </p>
                <p>
                  <strong>Suggested fix:</strong> {bug.fix}
                </p>
              </div>
            </article>
          ))
        ) : (
          <div className="empty-result">No bugs were reported for this snippet.</div>
        )}
      </div>

      <div className="code-block-wrap">
        <div className="code-block-header">
          <span>Improved code</span>
        </div>
        <pre className="code-block">
          <code>{result.fixedCode}</code>
        </pre>
      </div>
    </div>
  );
}
