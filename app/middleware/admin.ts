export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware for login page
  if (to.path === '/login') return;

  if (process.client) {
    const { useAuth } = await import("../composables/useAuth");
    const auth = useAuth();

    // Check authentication status
    if (!auth.isAuthenticated.value) {
      // Try to refresh token if we have one
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          await auth.refresh();
        } else {
          return navigateTo("/login");
        }
      } catch {
        return navigateTo("/login");
      }
    }

    // Check admin role
    if (!auth.user.value || auth.user.value.role !== "admin") {
      return navigateTo("/");
    }
  }
});
