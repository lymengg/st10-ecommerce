export default defineNuxtRouteMiddleware(async () => {
  if (process.client) {
    const { useAuth } = await import("../composables/useAuth");
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated.value) {
      return navigateTo("/login");
    }
  }
});
