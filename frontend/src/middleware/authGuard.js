export function isSessionActive(session) {
  return Boolean(session?.token);
}

export function runProtectedAction({ session, onUnauthorized, action }) {
  if (!isSessionActive(session)) {
    onUnauthorized?.();
    return Promise.resolve(null);
  }

  return action();
}
