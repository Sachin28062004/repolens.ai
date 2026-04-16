export function parseOAuthCallback(pathname, search) {
  if (pathname !== "/oauth2/success") {
    return null;
  }

  const params = new URLSearchParams(search);
  const token = params.get("token");

  if (!token) {
    return {
      error:
        params.get("error_description") ||
        params.get("error") ||
        "Sign-in could not be completed.",
    };
  }

  return {
    session: {
      token,
      tokenType: "Bearer",
      user: {
        id: null,
        name: params.get("name") || "GitHub User",
        email: params.get("email") || "",
        provider: "GITHUB",
      },
    },
  };
}
