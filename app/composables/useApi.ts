// Centralized API composable for Nuxt 3
import { useRuntimeConfig } from "#imports";

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

function parseError(e: any) {
  // Normalize $fetch / FetchError shapes
  const status = e?.statusCode || e?.status || e?.response?.status || null;
  const data =
    e?.data || e?.response?._data || e?.response?._data || e?._data || null;
  return {
    status,
    data,
    message: e?.message || (data && data?.data) || "Request failed",
  };
}

function parseResponse(response: any) {
  // Handle standardized {status, code, data} format
  if (response && typeof response === 'object') {
    // New standardized format
    if ('status' in response && 'code' in response && 'data' in response) {
      return {
        success: response.status === 'success',
        code: response.code,
        data: response.data,
        message: response.message,
        raw: response
      };
    }

    // Legacy format where response itself is the data
    return {
      success: true,
      code: 200,
      data: response,
      message: undefined,
      raw: response
    };
  }

  // Non-object responses
  return {
    success: true,
    code: 200,
    data: response,
    message: undefined,
    raw: response
  };
}

export function useApi() {
  const config = useRuntimeConfig();
  const baseURL = config.public?.apiBase || "http://localhost:8000";

  let refreshing: Promise<string | null> | null = null;

  async function refreshTokens(): Promise<string | null> {
    // Avoid concurrent refreshes
    if (refreshing) return refreshing;

    refreshing = (async () => {
      try {
        const refreshToken =
          typeof window !== "undefined"
            ? localStorage.getItem(REFRESH_KEY)
            : null;
        if (!refreshToken) throw new Error("No refresh token available");

        const res: any = await $fetch(baseURL + "/api/auth/refresh", {
          method: "POST",
          body: { refresh_token: refreshToken },
          headers: { "Content-Type": "application/json" },
        });

        // Handle both standardized and direct response formats
        if (res?.status === "success" || res?.data?.access_token) {
          const tokenData = res.data || res;

          // Persist new tokens
          if (typeof window !== "undefined") {
            localStorage.setItem(ACCESS_KEY, tokenData.access_token);
            if (tokenData.refresh_token)
              localStorage.setItem(REFRESH_KEY, tokenData.refresh_token);
          }
          return tokenData.access_token;
        }

        throw new Error("Refresh failed");
      } catch (err) {
        // Clear tokens on failure
        if (typeof window !== "undefined") {
          localStorage.removeItem(ACCESS_KEY);
          localStorage.removeItem(REFRESH_KEY);
          localStorage.removeItem("user");
        }
        throw err;
      } finally {
        refreshing = null;
      }
    })();

    return refreshing;
  }

  async function request<T = any>(endpoint: string, options: any = {}) {
    const opts = { ...options };
    opts.headers = { ...(opts.headers || {}) };

    // Attach access token if present on client
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(ACCESS_KEY);
      if (token && !opts.headers.Authorization) {
        opts.headers.Authorization = `Bearer ${token}`;
      }
    }

    try {
      const res = await $fetch<T>(baseURL + endpoint, opts);
      const parsedRes = parseResponse(res);
      console.log('API Response:', parsedRes);

      // Return the data from standardized response
      return parsedRes.data;
    } catch (e: any) {
      const { status, data } = parseError(e);

      // On 401 try refresh once, then retry original request
      if (status === 401 && endpoint !== "/api/auth/refresh") {
        try {
          const newAccess = await refreshTokens();
          if (newAccess) {
            opts.headers = {
              ...(opts.headers || {}),
              Authorization: `Bearer ${newAccess}`,
            };
            // mark as retry to avoid infinite loops
            opts._retry = true;
            const retryRes = await $fetch<T>(baseURL + endpoint, opts);
            const parsedRetryRes = parseResponse(retryRes);
            return parsedRetryRes.data;
          }
        } catch (refreshErr: any) {
          // pass through original 401 if refresh failed
          const r: any = refreshErr || {};
          throw { status: 401, data: r.data || r.message || "Unauthorized" };
        }
      }

      // Handle standardized error responses
      if (data && typeof data === 'object') {
        // New standardized error format
        if (data.status === "error") {
          const errorMsg = data.data || data.message || "Request failed";
          throw { status: data.code || status || 400, data: errorMsg };
        }

        // Validation errors with field details
        if (data.details && Array.isArray(data.details)) {
          const fieldErrors = data.details.map((err: any) =>
            `${err.field}: ${err.message}`
          ).join(', ');
          throw { status: data.code || 422, data: fieldErrors || "Validation failed" };
        }
      }

      // Handle different status codes with appropriate messages
      if (status >= 500) {
        throw {
          status: status || 500,
          data: "Internal server error. Please try again later.",
        };
      }

      if (status === 422) {
        // Validation errors - extract field details if available
        const validationDetails = data?.detail;
        if (Array.isArray(validationDetails)) {
          const fieldErrors = validationDetails.map((err: any) =>
            err?.msg || `${err?.loc?.join('.')} error`
          ).join(', ');
          throw { status: 422, data: fieldErrors || "Validation failed" };
        }
        throw { status: 422, data: validationDetails || "Validation failed" };
      }

      throw {
        status: status || 500,
        data: data || e?.message || "Request failed",
      };
    }
  }

  return { request, baseURL };
}
