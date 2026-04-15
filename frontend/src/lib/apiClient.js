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
  const requestMiddlewares = [
    async (config) => {
      const nextHeaders = new Headers(config.headers || {});
      nextHeaders.set("Accept", "application/json");

      if (!(config.body instanceof FormData) && !nextHeaders.has("Content-Type")) {
        nextHeaders.set("Content-Type", "application/json");
      }

      const token = getToken?.();
      if (token) {
        nextHeaders.set("Authorization", `Bearer ${token}`);
      }

      return {
        ...config,
        headers: nextHeaders,
      };
    },
  ];

  const responseMiddlewares = [
    async (response) => {
      if (response.status === 401) {
        onUnauthorized?.();
      }
      return response;
    },
  ];

  async function request(path, options = {}) {
    const { method = "GET", query, body, headers } = options;
    let config = {
      method,
      headers,
      body:
        body instanceof FormData || body === undefined
          ? body
          : JSON.stringify(normalizePayload(body)),
    };

    for (const middleware of requestMiddlewares) {
      config = await middleware(config);
    }

    let response = await fetch(buildUrl(baseUrl, path, query), config);
    for (const middleware of responseMiddlewares) {
      response = await middleware(response);
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
