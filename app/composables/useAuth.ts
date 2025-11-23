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

  // Check if token exists and is not expired
  if (access) {
    try {
      // Decode JWT to check expiration (simple parsing without crypto verification)
      const payload = JSON.parse(atob(access.split(".")[1]));
      const currentTime = Date.now() / 1000;

      if (payload.exp && payload.exp < currentTime) {
        // Token expired, clean up
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
        localStorage.removeItem("user");
        isAuthenticated.value = false;
        user.value = null;
      } else {
        isAuthenticated.value = true;
      }
    } catch {
      // Invalid token format
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
      localStorage.removeItem("user");
      isAuthenticated.value = false;
    }
  } else {
    isAuthenticated.value = false;
  }

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
    // login uses FormData (multipart/form-data)
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    try {
      // The request function now returns the data field from the standardized response
      const tokenData: any = await request("/api/auth/login", {
        method: "POST",
        body: formData,
      });

      // Successful login - API now returns standardized format
      if (tokenData && tokenData.access_token) {
        await login(tokenData.access_token, tokenData.refresh_token, {
          username: tokenData.username || username, // fallback if username not in response
          role: tokenData.role || "user",
          email: tokenData.email || "",
          phone_number: tokenData.phone_number || "",
        });
        return tokenData;
      } else {
        // Failed login - throw an error
        console.error("Login failed - invalid response format:", tokenData);
        throw { status: 400, data: "Invalid login response format" };
      }
    } catch (error) {
      // Network or other error
      console.error("Login network error:", error);
      throw error;
    }
  }

  async function register(payload: {
    username: string;
    password: string;
    email: string;
    phone_number: string;
  }) {
    const tokenData: any = await request("/api/auth/register", {
      method: "POST",
      body: payload,
      headers: { "Content-Type": "application/json" },
    });

    // Auto-login after successful registration
    if (tokenData && tokenData.access_token) {
      await login(tokenData.access_token, tokenData.refresh_token, {
        username: tokenData.username || payload.username,
        role: tokenData.role || "user",
        email: tokenData.email || payload.email,
        phone_number: tokenData.phone_number || payload.phone_number,
      });
      return tokenData;
    }
    return tokenData;
  }

  async function refresh() {
    const refreshToken =
      typeof window !== "undefined" ? localStorage.getItem(REFRESH_KEY) : null;
    if (!refreshToken) throw new Error("No refresh token");

    const tokenData: any = await request("/api/auth/refresh", {
      method: "POST",
      body: { refresh_token: refreshToken },
      headers: { "Content-Type": "application/json" },
    });

    if (typeof window !== "undefined") {
      localStorage.setItem(ACCESS_KEY, tokenData.access_token);
      if (tokenData.refresh_token)
        localStorage.setItem(REFRESH_KEY, tokenData.refresh_token);
    }
    return tokenData;
  }

  async function profile() {
    const userData: any = await request("/api/auth/me", { method: "GET" });
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(userData));
      user.value = userData;
      isAuthenticated.value = true;
    }
    return userData;
  }

  async function updateProfile(payload: {
    username?: string;
    email?: string;
    phone_number?: string;
  }) {
    const userData: any = await request("/api/users/me", {
      method: "PUT",
      body: payload,
      headers: { "Content-Type": "application/json" },
    });

    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(userData));
      user.value = userData;
    }
    return userData;
  }

  async function changePassword(
    current_password: string,
    new_password: string
  ) {
    return await request("/api/auth/change-password", {
      method: "POST",
      body: { current_password, new_password },
      headers: { "Content-Type": "application/json" },
    });
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
    updateProfile,
    changePassword,
    logout,
  };
}
