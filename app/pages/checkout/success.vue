<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <div class="max-w-xl w-full bg-white border border-neutral-200 rounded-xl p-8 text-center">
      <h1 class="text-2xl font-bold mb-2">Payment Status</h1>
      <p class="text-neutral-600 mb-6">Checking your payment for order #{{ orderId }}...</p>
      <div v-if="status === 'Pending Payment'" class="text-neutral-700">Pending... polling Stripe status</div>
      <div v-else-if="status === 'Paid'" class="text-green-700 font-semibold">Payment successful!</div>
      <div v-else-if="status === 'Failed'" class="text-red-700 font-semibold">Payment failed.</div>
      <div v-else class="text-neutral-700">{{ status }}</div>

      <div class="mt-6 flex gap-3 justify-center">
        <NuxtLink v-if="status === 'Paid'" :to="`/invoice?order_id=${orderId}`" class="bg-primary text-white px-4 py-2 rounded-lg">
          View Invoice
        </NuxtLink>
        <NuxtLink v-else :to="'/checkout'" class="border px-4 py-2 rounded-lg">
          Back to Checkout
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useCheckoutApi } from '~/composables/useCheckout';

const route = useRoute();
const { getOrderStatus } = useCheckoutApi();

const orderId = Number(route.query.order_id || 0);
const status = ref<string>('Pending Payment');
let timer: any = null;

async function poll() {
  if (!orderId) return;
  try {
    const res = await getOrderStatus(orderId);
    status.value = res.status;
    if (res.status === 'Paid' || res.status === 'Failed') {
      clearInterval(timer);
    }
  } catch (e) {
    // keep polling silently
  }
}

onMounted(() => {
  if (orderId) {
    poll();
    timer = setInterval(poll, 2000);
  }
});

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});
</script>