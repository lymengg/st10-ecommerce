// Centralized API composable for Nuxt 3
import { useRuntimeConfig } from "#imports";

export function useApi() {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBase || "http://localhost:8000";

  async function request<T = any>(endpoint: string, options: any = {}) {
    try {
      const res = await $fetch<T>(baseURL + endpoint, {
        ...options,
        headers: {
          ...(options.headers || {}),
        },
      });
      return res;
    } catch (e: any) {
      // Optionally handle global errors here
      throw e;
    }
  }

  return { request };
}
