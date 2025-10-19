export default defineNuxtRouteMiddleware(async () => {
  if (process.client) {
    const { useAuth } = await import("../composables/useAuth");
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated.value) {
      return navigateTo("/login");
    }
    if (!user.value || user.value.role !== "admin") {
      return navigateTo("/");
    }
  }
});
