import { ref, computed } from "vue";
import { useApi } from "./useApi";

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

const isAuthenticated = ref(false);
const user = ref<{
  username?: string;
  role?: string;
  email?: string;
  phone_number?: string;
} | null>(null);

function loadFromStorage() {
  if (typeof window === "undefined") return;
  const access = localStorage.getItem(ACCESS_KEY);
  const userStr = localStorage.getItem("user");
  isAuthenticated.value = !!access;
  try {
    user.value = userStr ? JSON.parse(userStr) : null;
  } catch {
    user.value = null;
  }
}

async function login(
  accessToken: string,
  refreshToken?: string,
  userInfo?: any
) {
  if (typeof window !== "undefined") {
    localStorage.setItem(ACCESS_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
    if (userInfo) localStorage.setItem("user", JSON.stringify(userInfo));
  }
  isAuthenticated.value = true;
  if (userInfo) user.value = userInfo;
}

function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem("user");
  }
  isAuthenticated.value = false;
  user.value = null;
}

// API-backed actions
export function useAuth() {
  const { request } = useApi();

  async function apiLogin(username: string, password: string) {
    // login expects x-www-form-urlencoded
    const res: any = await request("/api/auth/login", {
      method: "POST",
      body: new URLSearchParams({ username, password }) as any,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    if (res.status === "success") {
      await login(res.data.access_token, res.data.refresh_token, {
        username: res.data.username,
        role: res.data.role,
        email: res.data.email,
        phone_number: res.data.phone_number,
      });
      return res;
    }
    throw res;
  }

  async function register(payload: {
    username: string;
    password: string;
    email: string;
    phone_number: string;
  }) {
    const res: any = await request("/api/auth/register", {
      method: "POST",
      body: payload,
      headers: { "Content-Type": "application/json" },
    });
    if (res.status === "success") {
      await login(res.data.access_token, res.data.refresh_token, {
        username: res.data.username,
        role: res.data.role,
        email: res.data.email,
        phone_number: res.data.phone_number,
      });
      return res;
    }
    throw res;
  }

  async function refresh() {
    const refreshToken =
      typeof window !== "undefined" ? localStorage.getItem(REFRESH_KEY) : null;
    if (!refreshToken) throw new Error("No refresh token");
    const res: any = await request("/api/auth/refresh", {
      method: "POST",
      body: { refresh_token: refreshToken },
      headers: { "Content-Type": "application/json" },
    });
    if (res.status === "success") {
      if (typeof window !== "undefined") {
        localStorage.setItem(ACCESS_KEY, res.data.access_token);
        if (res.data.refresh_token)
          localStorage.setItem(REFRESH_KEY, res.data.refresh_token);
      }
      return res;
    }
    throw res;
  }

  async function profile() {
    const res: any = await request("/api/auth/profile", { method: "GET" });
    if (res.status === "success") {
      if (typeof window !== "undefined")
        localStorage.setItem("user", JSON.stringify(res.data));
      user.value = res.data;
      isAuthenticated.value = true;
    }
    return res;
  }

  async function changePassword(
    current_password: string,
    new_password: string
  ) {
    const res: any = await request("/api/auth/change-password", {
      method: "POST",
      body: { current_password, new_password },
      headers: { "Content-Type": "application/json" },
    });
    return res;
  }

  // Initialize from storage
  if (typeof window !== "undefined") {
    loadFromStorage();
    window.addEventListener("storage", loadFromStorage);
  }

  return {
    isAuthenticated: computed(() => isAuthenticated.value),
    user: computed(() => user.value),
    login: apiLogin,
    register,
    refresh,
    profile,
    changePassword,
    logout,
  };
}
