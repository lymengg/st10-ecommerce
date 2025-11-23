<template>
  <div class="min-h-screen bg-neutral-50 grid lg:grid-cols-[16rem_1fr]">
    <!-- Mobile overlay -->
    <transition name="fade">
      <div
        v-if="isNavOpen"
        class="fixed inset-0 z-40 bg-black/30 lg:hidden"
        @click="isNavOpen = false"
      ></div>
    </transition>

    <!-- Drawer (mobile) -->
    <aside
      v-show="isNavOpen"
      class="fixed z-50 inset-y-0 left-0 w-64 bg-white border-r border-neutral-200 p-4 lg:hidden"
    >
      <div class="flex items-center justify-between px-2 py-3">
        <NuxtLink
          to="/admin"
          class="flex items-center gap-2"
          @click="isNavOpen = false"
        >
          <Icon name="i-heroicons-cog-6-tooth" class="w-6 h-6 text-primary" />
          <span class="font-semibold text-neutral-900">Admin</span>
        </NuxtLink>
        <button
          class="p-2 rounded hover:bg-neutral-100"
          @click="isNavOpen = false"
        >
          <Icon name="i-heroicons-x-mark" class="w-6 h-6" />
        </button>
      </div>
      <nav class="mt-4 space-y-1" @click="isNavOpen = false">
        <NuxtLink
          :to="'/admin'"
          :class="linkClass('/admin', true)"
          class="nav-link"
        >
          <Icon name="i-heroicons-home" class="w-4 h-4 mr-2" /> Dashboard
        </NuxtLink>
        <NuxtLink
          :to="'/admin/products'"
          :class="linkClass('/admin/products')"
          class="nav-link"
        >
          <Icon name="i-heroicons-cube" class="w-4 h-4 mr-2" /> Products
        </NuxtLink>
        <NuxtLink
          :to="'/admin/orders'"
          :class="linkClass('/admin/orders')"
          class="nav-link"
        >
          <Icon name="i-heroicons-shopping-bag" class="w-4 h-4 mr-2" /> Orders
        </NuxtLink>
        <div class="pt-4 mt-4 border-t border-neutral-200"></div>
        <NuxtLink
          to="/"
          class="nav-link px-3 py-2 rounded-lg text-sm text-neutral-700 hover:bg-neutral-50"
        >
          <Icon name="i-heroicons-globe-alt" class="w-4 h-4 mr-2" /> View site
        </NuxtLink>
      </nav>
    </aside>

    <!-- Sidebar (desktop) -->
    <aside class="hidden lg:block border-r border-neutral-200 bg-white p-4">
      <NuxtLink to="/admin" class="flex items-center gap-2 px-2 py-3">
        <Icon name="i-heroicons-cog-6-tooth" class="w-6 h-6 text-primary" />
        <span class="font-semibold text-neutral-900">Admin</span>
      </NuxtLink>
      <nav class="mt-4 space-y-1">
        <NuxtLink
          :to="'/admin'"
          :class="linkClass('/admin', true)"
          class="nav-link"
        >
          <Icon name="i-heroicons-home" class="w-4 h-4 mr-2" /> Dashboard
        </NuxtLink>
        <NuxtLink
          :to="'/admin/products'"
          :class="linkClass('/admin/products')"
          class="nav-link"
        >
          <Icon name="i-heroicons-cube" class="w-4 h-4 mr-2" /> Products
        </NuxtLink>
        <NuxtLink
          :to="'/admin/orders'"
          :class="linkClass('/admin/orders')"
          class="nav-link"
        >
          <Icon name="i-heroicons-shopping-bag" class="w-4 h-4 mr-2" /> Orders
        </NuxtLink>
        <div class="pt-4 mt-4 border-t border-neutral-200"></div>
        <NuxtLink
          to="/"
          class="nav-link px-3 py-2 rounded-lg text-sm text-neutral-700 hover:bg-neutral-50"
        >
          <Icon name="i-heroicons-globe-alt" class="w-4 h-4 mr-2" /> View site
        </NuxtLink>
      </nav>
    </aside>

    <!-- Main -->
    <main class="p-6">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const isNavOpen = ref(false);

watch(
  () => route.path,
  () => {
    isNavOpen.value = false;
  }
);

function linkClass(path: string, exact: boolean = false) {
  const active = exact ? route.path === path : route.path.startsWith(path);
  return [
    "flex items-center px-3 py-2 rounded-lg text-sm transition-colors",
    active
      ? "bg-primary/10 text-primary"
      : "text-neutral-700 hover:bg-neutral-50",
  ];
}

const pageTitle = computed(() => {
  if (route.path === "/admin") return "Dashboard";
  if (route.path.startsWith("/admin/products")) return "Products";
  if (route.path.startsWith("/admin/orders")) return "Orders";
  return "Admin";
});
</script>

<style scoped>
.nav-link {
  display: flex;
  align-items: center;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
