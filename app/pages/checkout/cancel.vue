<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <div class="max-w-xl w-full bg-white border border-neutral-200 rounded-xl p-8 text-center">
      <h1 class="text-2xl font-bold mb-2">Payment Canceled</h1>
      <p class="text-neutral-600 mb-6">Your payment was canceled. You can try again.</p>
      <NuxtLink to="/checkout" class="bg-primary text-white px-4 py-2 rounded-lg">Return to Checkout</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
// No special logic needed
</script>