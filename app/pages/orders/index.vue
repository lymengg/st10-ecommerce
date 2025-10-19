<template>
  <div class="min-h-screen bg-neutral-50 py-10">
    <div class="max-w-5xl mx-auto bg-white rounded-xl shadow-lg border border-neutral-200 p-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-neutral-900">My Orders</h1>
        <div class="flex items-center gap-3">
          <label class="text-sm text-neutral-600">Status</label>
          <select v-model="status" class="border border-neutral-300 rounded-lg px-3 py-2 bg-white text-neutral-900">
            <option value="">All</option>
            <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
      </div>

      <div v-if="loading">Loading orders...</div>
      <div v-else-if="error" class="text-red-600">{{ error }}</div>
      <div v-else>
        <div v-if="orders.length === 0" class="text-neutral-600">No orders found.</div>
        <ul v-else class="divide-y divide-neutral-200">
          <li v-for="o in orders" :key="o.id" class="py-4 flex items-center justify-between">
            <div class="flex flex-col">
              <div class="font-semibold text-neutral-900">Order #{{ o.id }}</div>
              <div class="text-sm text-neutral-600">{{ new Date(o.created_at).toLocaleString() }}</div>
              <div class="text-sm mt-1">
                <span class="inline-block px-2 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-neutral-800">{{ o.status }}</span>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-right">
                <div class="font-semibold">Items: {{ o.total_items }}</div>
                <div class="text-neutral-700">Subtotal: ${{ Number(o.subtotal).toFixed(2) }}</div>
              </div>
              <NuxtLink :to="`/orders/${o.id}`" class="border px-3 py-2 rounded-lg hover:bg-neutral-50">Details</NuxtLink>
              <NuxtLink v-if="canViewInvoice(o.status)" :to="`/invoice?order_id=${o.id}`" class="bg-primary text-white px-3 py-2 rounded-lg hover:bg-primary/90">Invoice</NuxtLink>
            </div>
          </li>
        </ul>

        <div class="mt-6 flex items-center justify-between">
          <button class="border px-3 py-2 rounded-lg disabled:opacity-50" :disabled="page === 1" @click="prevPage">Previous</button>
          <div class="text-sm text-neutral-600">Page {{ page }}</div>
          <button class="border px-3 py-2 rounded-lg disabled:opacity-50" :disabled="orders.length < limit" @click="nextPage">Next</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useOrdersApi, type OrderStatus } from '~/composables/useOrders';

definePageMeta({ middleware: 'auth' });

const { listMyOrders } = useOrdersApi();

const statuses: OrderStatus[] = [
  'Pending Payment', 'Paid', 'Shipped', 'Completed', 'Cancelled', 'Failed'
];

const status = ref<string>('');
const page = ref(1);
const limit = ref(10);
const loading = ref(false);
const error = ref('');
const orders = ref<any[]>([]);

function canViewInvoice(st: string) {
  return st === 'Paid' || st === 'Shipped' || st === 'Completed';
}

async function load() {
  try {
    loading.value = true;
    error.value = '';
    const skip = (page.value - 1) * limit.value;
    const res = await listMyOrders({ status: status.value as OrderStatus, skip, limit: limit.value });
    orders.value = res || [];
  } catch (e: any) {
    error.value = e?.data || e?.message || 'Failed to load orders';
  } finally {
    loading.value = false;
  }
}

function nextPage() {
  page.value += 1;
}
function prevPage() {
  if (page.value > 1) page.value -= 1;
}

watch([status, page, limit], load);

onMounted(load);
</script>
