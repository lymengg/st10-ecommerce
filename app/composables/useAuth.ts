import { ref, computed } from "vue";
import type { ApiResponse } from "~/types/api";
import type { TokenResponse } from "~/types/auth";

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

export function useAuth() {
  const api = useNuxtApp().$api as typeof $fetch;

  const isAuthenticated = ref(false);

  async function login(
    username: string,
    password: string
  ): Promise<ApiResponse<TokenResponse>> {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    const response = await api<ApiResponse<TokenResponse>>("/api/auth/login", {
      method: "POST",
      body: formData,
    });

    if (response.code === 200) {
      isAuthenticated.value = true;
      localStorage.setItem(ACCESS_KEY, response.data!.access_token);
      localStorage.setItem(REFRESH_KEY, response.data!.refresh_token);
    }

    return response;
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
    console.log(res);
    if (res.code === 201) {
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
    if (res.code === 200) {
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
    const res: any = await request("/api/users/me", { method: "GET" });
    if (res.code === 200) {
      if (typeof window !== "undefined")
        localStorage.setItem("user", JSON.stringify(res.data));
      user.value = res.data;
      isAuthenticated.value = true;
    }
    return res;
  }

  async function updateProfile(payload: {
    username?: string;
    email?: string;
    phone_number?: string;
  }) {
    const res: any = await request("/api/users/me", {
      method: "PUT",
      body: payload,
      headers: { "Content-Type": "application/json" },
    });
    if (res.code === 200) {
      if (typeof window !== "undefined")
        localStorage.setItem("user", JSON.stringify(res.data));
      user.value = res.data;
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
    login,
    register,
    refresh,
    profile,
    updateProfile,
    changePassword,
    logout,
  };
}
