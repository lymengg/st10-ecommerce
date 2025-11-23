<template>
  <div class="min-h-screen flex flex-col w-full bg-white">
    <!-- Navigation Header -->
    <header class="w-full bg-white shadow-lg border-b border-neutral-200">
      <UContainer>
        <div class="flex justify-between items-center py-4">
          <NuxtLink to="/" class="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Icon name="i-heroicons-clock" class="h-8 w-8 text-primary" />
            <h1 class="text-2xl font-bold text-neutral-900">WatchStore</h1>
          </NuxtLink>

          <nav class="flex items-center gap-4">
            <UButton to="/" variant="ghost" color="primary" class="text-neutral-900 hover:bg-neutral-100">
              <Icon name="i-heroicons-home" class="mr-2" />
              Catalog
            </UButton>
            <UButton to="/cart" variant="ghost" color="primary" class="text-neutral-900 hover:bg-neutral-100">
              <Icon name="i-heroicons-shopping-cart" class="mr-2" />
              Cart
            </UButton>
            <template v-if="!isAuthenticated">
              <UButton to="/login" variant="ghost" color="primary" class="text-neutral-900 hover:bg-neutral-100">
                <Icon name="i-heroicons-arrow-right-on-rectangle" class="mr-2" />
                Login
              </UButton>
              <UButton to="/register" variant="ghost" color="primary" class="text-neutral-900 hover:bg-neutral-100">
                <Icon name="i-heroicons-user-plus" class="mr-2" />
                Register
              </UButton>
            <UButton to="/contact" variant="ghost" color="primary" class="text-neutral-900 hover:bg-neutral-100">
                <Icon name="i-heroicons-phone" class="mr-2" />
                Contact
              </UButton>
            </template>
            <template v-else>
              <UButton to="/profile" variant="ghost" color="primary" class="text-neutral-900 hover:bg-neutral-100">
                <Icon name="i-heroicons-user-circle" class="mr-2" />
                Profile
              </UButton>
              <UButton to="/orders" variant="ghost" color="primary" class="text-neutral-900 hover:bg-neutral-100">
                <Icon name="i-heroicons-clipboard-document-list" class="mr-2" />
                Orders
              </UButton>
              <UButton v-if="user?.role === 'admin'" to="/admin" variant="ghost" color="primary" class="text-neutral-900 hover:bg-neutral-100">
                <Icon name="i-heroicons-cog-8-tooth" class="mr-2" />
                Admin
              </UButton>
              <UButton to="/contact" variant="ghost" color="primary" class="text-neutral-900 hover:bg-neutral-100">
                <Icon name="i-heroicons-phone" class="mr-2" />
                Contact
              </UButton>
              <UButton @click="logout" variant="ghost" color="primary" class="text-neutral-900 hover:bg-neutral-100">
                <Icon name="i-heroicons-arrow-left-on-rectangle" class="mr-2" />
                Logout
              </UButton>
            </template>
          </nav>
        </div>
      </UContainer>
    </header>

    <!-- Main Content -->
    <main class="flex-1 w-full">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="w-full bg-white text-neutral-600 mt-16 border-t border-neutral-200">
      <UContainer>
        <div class="flex flex-col md:flex-row items-center justify-between py-8 gap-6">
          <div class="flex items-center gap-2">
            <Icon name="i-heroicons-clock" class="h-7 w-7 text-primary" />
            <span class="text-xl font-bold text-neutral-900">WatchStore</span>
          </div>
          <nav class="flex gap-6 text-sm order-3 md:order-none md:flex-1 md:justify-center md:items-center md:flex md:mx-0 mx-auto">
            <NuxtLink to="/" class="hover:text-primary transition-colors">Catalog</NuxtLink>
            <NuxtLink to="/cart" class="hover:text-primary transition-colors">Cart</NuxtLink>
            <template v-if="!isAuthenticated">
              <NuxtLink to="/login" class="hover:text-primary transition-colors">Login</NuxtLink>
              <NuxtLink to="/register" class="hover:text-primary transition-colors">Register</NuxtLink>
            </template>
            <template v-else>
              <NuxtLink to="/profile" class="hover:text-primary transition-colors">Profile</NuxtLink>
              <NuxtLink to="/orders" class="hover:text-primary transition-colors">Orders</NuxtLink>
              <NuxtLink v-if="user?.role === 'admin'" to="/admin" class="hover:text-primary transition-colors">Admin</NuxtLink>
              <a @click.prevent="logout" class="hover:text-primary transition-colors cursor-pointer">Logout</a>
            </template>
            <NuxtLink to="/contact" class="hover:text-primary transition-colors">Contact</NuxtLink>
          </nav>
          <div class="text-xs text-neutral-400 text-center md:text-right">
            <div>&copy; 2025 WatchStore. All rights reserved.</div>
          </div>
        </div>
      </UContainer>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from "~/composables/useAuth";
useHead({
  title: "WatchStore - Premium Watches Collection",
  meta: [
    { name: "description", content: "Discover our premium collection of watches from top brands." },
  ],
});
const { isAuthenticated, logout, user } = useAuth();
</script>