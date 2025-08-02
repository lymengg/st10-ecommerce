<template>
  <UApp color-mode="light">
    <div class="min-h-screen flex flex-col w-full bg-white">
      <!-- Navigation Header -->
      <header class="w-full bg-white shadow-lg border-b border-neutral-200">
        <UContainer>
          <div class="flex justify-between items-center py-4">
            <NuxtLink
              to="/"
              class="flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Icon name="i-heroicons-clock" class="h-8 w-8 text-primary" />
              <h1 class="text-2xl font-bold text-neutral-900">WatchStore</h1>
            </NuxtLink>

            <nav class="flex items-center gap-4">
              <UButton
                to="/"
                variant="ghost"
                color="primary"
                class="text-neutral-900 hover:bg-neutral-100"
              >
                <Icon name="i-heroicons-home" class="mr-2" />
                Catalog
              </UButton>
              <UButton
                to="/cart"
                variant="ghost"
                color="primary"
                class="text-neutral-900 hover:bg-neutral-100"
              >
                <Icon name="i-heroicons-shopping-cart" class="mr-2" />
                Cart
              </UButton>
            </nav>
          </div>
        </UContainer>
      </header>

      <!-- Main Content -->
      <main class="flex-1 w-full">
        <NuxtRouteAnnouncer />
        <NuxtPage />
      </main>

      <!-- Footer -->
      <footer
        class="w-full bg-white text-neutral-500 mt-16 border-t border-neutral-200"
      >
        <UContainer>
          <div class="py-8 text-center">
            <p class="text-neutral-500">
              &copy; 2025 WatchStore. Built with Nuxt UI.
            </p>
          </div>
        </UContainer>
      </footer>

      <!-- Toast Notifications -->
      <UNotifications />
    </div>
  </UApp>
</template>

<script setup lang="ts">
// Set page title
useHead({
  title: "WatchStore - Premium Watches Collection",
  meta: [
    {
      name: "description",
      content: "Discover our premium collection of watches from top brands.",
    },
  ],
});
</script>
