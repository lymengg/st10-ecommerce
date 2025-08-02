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
        class="w-full bg-white text-neutral-600 mt-16 border-t border-neutral-200"
      >
        <UContainer>
          <div
            class="flex flex-col md:flex-row items-center justify-between py-8 gap-6"
          >
            <div class="flex items-center gap-2">
              <Icon name="i-heroicons-clock" class="h-7 w-7 text-primary" />
              <span class="text-xl font-bold text-neutral-900">WatchStore</span>
            </div>
            <nav
              class="flex gap-6 text-sm order-3 md:order-none md:flex-1 md:justify-center md:items-center md:flex md:mx-0 mx-auto"
            >
              <NuxtLink to="/" class="hover:text-primary transition-colors"
                >Catalog</NuxtLink
              >
              <NuxtLink to="/cart" class="hover:text-primary transition-colors"
                >Cart</NuxtLink
              >
              <a class="hover:text-primary transition-colors">Contact</a>
            </nav>
            <div class="text-xs text-neutral-400 text-center md:text-right">
              <div>&copy; 2025 WatchStore. All rights reserved.</div>
            </div>
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
