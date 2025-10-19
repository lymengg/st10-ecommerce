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

        if (res?.status === "success") {
          // Persist new tokens
          if (typeof window !== "undefined") {
            localStorage.setItem(ACCESS_KEY, res.data.access_token);
            if (res.data.refresh_token)
              localStorage.setItem(REFRESH_KEY, res.data.refresh_token);
          }
          return res.data.access_token;
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
      return res;
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
            return retryRes;
          }
        } catch (refreshErr: any) {
          // pass through original 401 if refresh failed
          const r: any = refreshErr || {};
          throw { status: 401, data: r.data || r.message || "Unauthorized" };
        }
      }

      // Normalize error envelope expected by frontend
      if (data && data.status === "error") {
        throw { status: status || 400, data: data.data || data };
      }

      throw {
        status: status || 500,
        data: data || e?.message || "Request failed",
      };
    }
  }

  return { request, baseURL };
}
