<template>
  <div class="min-h-screen p-6">
    <div class="max-w-3xl mx-auto bg-white border border-neutral-200 rounded-xl p-8">
      <h1 class="text-2xl font-bold mb-4">Invoice</h1>
      <div v-if="loading">Loading invoice...</div>
      <div v-else-if="error" class="text-red-600">{{ error }}</div>
      <div v-else-if="invoice">
        <div class="mb-4 text-neutral-700">Order #{{ invoice.order_id }} • {{ invoice.status }}</div>
        <div class="mb-4">
          <h2 class="font-semibold mb-2">Billing</h2>
          <div>{{ invoice.billing?.name }} • {{ invoice.billing?.phone }}</div>
          <div class="text-sm text-neutral-600">
            {{ invoice.billing?.address?.line1 }}
            <template v-if="invoice.billing?.address?.line2">, {{ invoice.billing?.address?.line2 }}</template>
            , {{ invoice.billing?.address?.city }}
            <template v-if="invoice.billing?.address?.state">, {{ invoice.billing?.address?.state }}</template>
            , {{ invoice.billing?.address?.postal_code }}, {{ invoice.billing?.address?.country }}
          </div>
        </div>
        <div>
          <h2 class="font-semibold mb-2">Items</h2>
          <ul class="divide-y divide-neutral-200">
            <li v-for="(it, idx) in invoice.items" :key="idx" class="py-2 flex justify-between">
              <div>
                <div class="font-medium">{{ it.name }}</div>
                <div class="text-sm text-neutral-600">x{{ it.quantity }}</div>
              </div>
              <div class="font-medium">${{ (it.unit_price * it.quantity).toFixed(2) }}</div>
            </li>
          </ul>
          <div class="mt-4 flex justify-between font-semibold">
            <span>Total items: {{ invoice.total_items }}</span>
            <span>Subtotal: ${{ Number(invoice.subtotal).toFixed(2) }}</span>
          </div>
        </div>
      </div>
      <div class="mt-6">
        <NuxtLink to="/" class="border px-4 py-2 rounded-lg">Continue shopping</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useCheckoutApi } from '~/composables/useCheckout';

const route = useRoute();
const { getInvoice } = useCheckoutApi();

const orderId = Number(route.query.order_id || 0);
const invoice = ref<any | null>(null);
const loading = ref(false);
const error = ref('');

onMounted(async () => {
  if (!orderId) {
    error.value = 'Missing order_id';
    return;
  }
  try {
    loading.value = true;
    invoice.value = await getInvoice(orderId);
  } catch (e: any) {
    error.value = e?.data || e?.message || 'Failed to load invoice';
  } finally {
    loading.value = false;
  }
});
</script>
