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
          // If refresh succeeded, continue
          return;
        }
      } catch {
        // Refresh failed, proceed to logout
      }

      // Token refresh failed or no tokens, redirect to login
      return navigateTo("/login");
    }
  }
});
