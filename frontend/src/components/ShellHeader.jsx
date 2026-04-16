function initialsFromName(name) {
  if (!name) {
    return "RL";
  }

  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() || "").join("") || "RL";
}

export function ShellHeader({ session, onLogout }) {
  return (
    <header className="shell-header">
      <div>
        <p className="eyebrow">RepoLens</p>
        <h1>Code review console</h1>
      </div>

      <div className="header-actions">
        <div className="user-chip">
          <div className="user-avatar">{initialsFromName(session.user?.name)}</div>
          <div>
            <strong>{session.user?.name || "Account"}</strong>
            <span>{session.user?.email || "Active session"}</span>
          </div>
        </div>

        <button type="button" className="ghost-button small-button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
