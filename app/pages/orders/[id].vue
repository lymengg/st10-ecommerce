<template>
  <div class="min-h-screen bg-neutral-50 py-10">
    <div class="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-neutral-200 p-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-neutral-900">Order #{{ orderId }}</h1>
        <span class="inline-block px-2 py-1 rounded bg-neutral-100 border border-neutral-200 text-neutral-800">{{ order?.status }}</span>
      </div>

      <div v-if="loading">Loading order...</div>
      <div v-else-if="error" class="text-red-600">{{ error }}</div>
      <div v-else-if="order">
        <div class="text-sm text-neutral-600 mb-4">Placed {{ new Date(order.created_at).toLocaleString() }}</div>
        <h2 class="text-lg font-semibold mb-2">Items</h2>
        <ul class="divide-y divide-neutral-200">
          <li v-for="(it, idx) in order.items" :key="idx" class="py-3 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <img v-if="it.product?.image" :src="it.product.image" :alt="it.product.name" class="w-12 h-12 object-cover rounded border border-neutral-200 bg-white" />
              <div>
                <div class="font-medium">{{ it.product?.name }}</div>
                <div class="text-sm text-neutral-600">x{{ it.quantity }}</div>
              </div>
            </div>
            <div class="font-semibold">${{ Number(it.line_total).toFixed(2) }}</div>
          </li>
        </ul>
        <div class="mt-4 flex justify-between font-semibold">
          <span>Total items: {{ order.total_items }}</span>
          <span>Subtotal: ${{ Number(order.subtotal).toFixed(2) }}</span>
        </div>

        <div class="mt-6 flex gap-3">
          <NuxtLink to="/orders" class="border px-4 py-2 rounded-lg">Back to Orders</NuxtLink>
          <NuxtLink v-if="canViewInvoice(order.status)" :to="`/invoice?order_id=${order.id}`" class="bg-primary text-white px-4 py-2 rounded-lg">View Invoice</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useOrdersApi } from '~/composables/useOrders';

definePageMeta({ middleware: 'auth' });

const { getOrder } = useOrdersApi();
const route = useRoute();
const orderId = Number(route.params.id);

const order = ref<any | null>(null);
const loading = ref(false);
const error = ref('');

function canViewInvoice(st: string) {
  return st === 'Paid' || st === 'Shipped' || st === 'Completed';
}

onMounted(async () => {
  if (!orderId) {
    error.value = 'Missing order id';
    return;
  }
  try {
    loading.value = true;
    order.value = await getOrder(orderId);
  } catch (e: any) {
    error.value = e?.data || e?.message || 'Failed to load order';
  } finally {
    loading.value = false;
  }
});
</script>
