<template>
  <UContainer>
    <div class="space-y-4">
      <h2 class="text-xl font-semibold text-neutral-900">Welcome to the Admin Dashboard</h2>
      <p class="text-neutral-600">Use the navigation drawer to manage Products and Orders.</p>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
</script>
