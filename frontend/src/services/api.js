function buildUrl(baseUrl, path, query) {
  const url = new URL(path, baseUrl);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

function normalizePayload(value) {
  if (Array.isArray(value)) {
    return value.map(normalizePayload);
  }

  if (value && typeof value === "object" && !(value instanceof File) && !(value instanceof FormData)) {
    return Object.entries(value).reduce((accumulator, [key, innerValue]) => {
      if (innerValue === undefined || innerValue === null || innerValue === "") {
        return accumulator;
      }

      accumulator[key] = normalizePayload(innerValue);
      return accumulator;
    }, {});
  }

  return value;
}

async function parseResponse(response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

async function parseError(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const payload = await response.json();
    return payload.message || payload.error || "The request could not be completed.";
  }

  const text = await response.text();
  return text || "The request could not be completed.";
}

export function createApiClient({ baseUrl, getToken, onUnauthorized }) {
  async function request(path, options = {}) {
    const { method = "GET", query, body, headers } = options;
    const nextHeaders = new Headers(headers || {});

    nextHeaders.set("Accept", "application/json");
    if (!(body instanceof FormData) && !nextHeaders.has("Content-Type")) {
      nextHeaders.set("Content-Type", "application/json");
    }

    const token = getToken?.();
    if (token) {
      nextHeaders.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(buildUrl(baseUrl, path, query), {
      method,
      headers: nextHeaders,
      body:
        body instanceof FormData || body === undefined
          ? body
          : JSON.stringify(normalizePayload(body)),
    });

    if (response.status === 401) {
      onUnauthorized?.();
    }

    if (!response.ok) {
      throw new Error(await parseError(response));
    }

    return parseResponse(response);
  }

  return {
    get(path, options = {}) {
      return request(path, { ...options, method: "GET" });
    },
    post(path, options = {}) {
      return request(path, { ...options, method: "POST" });
    },
  };
}

export function createRepoLensApi(client) {
  return {
    login(form) {
      return client.post("/api/auth/login", { body: form });
    },
    register(form) {
      return client.post("/api/auth/register", { body: form });
    },
    loadBranches(repoUrl) {
      return client.get("/api/github/branches", { query: { repoUrl } });
    },
    analyzeRepository(payload) {
      return client.post("/api/github/analyze", { body: payload });
    },
    reviewCode(payload) {
      return client.post("/api/reviews/code", { body: payload });
    },
    analyzeUpload(formData) {
      return client.post("/api/uploads", { body: formData });
    },
  };
}
