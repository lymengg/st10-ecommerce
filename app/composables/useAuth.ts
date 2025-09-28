import { ref, computed } from "vue";

const AUTH_TOKEN_KEY = "token";

const isAuthenticated = ref(false);
const user = ref<{ username?: string; role?: string } | null>(null);

function checkAuth() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  isAuthenticated.value = Boolean(token);
  // Optionally decode JWT to get user role (for demo, just check localStorage for user info)
  try {
    if (token) {
      // If you store user info in localStorage, load it here. Otherwise, fetch from API on login.
      const userInfo = localStorage.getItem("user");
      user.value = userInfo ? JSON.parse(userInfo) : null;
    } else {
      user.value = null;
    }
  } catch {
    user.value = null;
  }
}

function login(token: string, userInfo?: { username: string; role: string }) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  isAuthenticated.value = true;
  if (userInfo) {
    localStorage.setItem("user", JSON.stringify(userInfo));
    user.value = userInfo;
  }
}

function logout() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  isAuthenticated.value = false;
  user.value = null;
}

// Call on load
if (typeof window !== "undefined") {
  checkAuth();
  window.addEventListener("storage", checkAuth);
}

export function useAuth() {
  return {
    isAuthenticated: computed(() => isAuthenticated.value),
    user: computed(() => user.value),
    login,
    logout,
    checkAuth,
  };
}
