export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.client) {
    const { useAuth } = await import("../composables/useAuth");
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated.value) {
      return navigateTo("/login");
    }
  }
});
