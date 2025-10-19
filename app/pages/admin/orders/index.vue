<template>
  <div class="min-h-screen bg-neutral-50 py-10">
    <div class="max-w-6xl mx-auto bg-white rounded-xl shadow-lg border border-neutral-200 p-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-neutral-900">Admin • Orders</h1>
        <div class="flex items-center gap-3">
          <label class="text-sm text-neutral-600">Status</label>
          <select v-model="status" class="border border-neutral-300 rounded-lg px-3 py-2 bg-white text-neutral-900">
            <option value="">All</option>
            <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
          </select>
          <label class="text-sm text-neutral-600 ml-4">User ID</label>
          <input v-model.number="userId" type="number" min="1" placeholder="e.g. 42" class="w-28 border border-neutral-300 rounded-lg px-3 py-2 bg-white text-neutral-900"/>
          <button @click="refresh" class="border px-3 py-2 rounded-lg hover:bg-neutral-50">Apply</button>
        </div>
      </div>

      <div v-if="loading">Loading orders...</div>
      <div v-else-if="error" class="text-red-600">{{ error }}</div>
      <div v-else>
        <div v-if="orders.length === 0" class="text-neutral-600">No orders found.</div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full border border-neutral-200 rounded-lg overflow-hidden">
            <thead class="bg-neutral-50">
              <tr>
                <th class="text-left px-4 py-2 border-b">ID</th>
                <th class="text-left px-4 py-2 border-b">Created</th>
                <th class="text-left px-4 py-2 border-b">Items</th>
                <th class="text-left px-4 py-2 border-b">Subtotal</th>
                <th class="text-left px-4 py-2 border-b">Status</th>
                <th class="text-left px-4 py-2 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="o in orders" :key="o.id" class="hover:bg-neutral-50">
                <td class="px-4 py-2 border-b font-medium">#{{ o.id }}</td>
                <td class="px-4 py-2 border-b text-sm text-neutral-600">{{ new Date(o.created_at).toLocaleString() }}</td>
                <td class="px-4 py-2 border-b">{{ o.total_items }}</td>
                <td class="px-4 py-2 border-b">${{ Number(o.subtotal).toFixed(2) }}</td>
                <td class="px-4 py-2 border-b">
                  <span class="inline-block px-2 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-neutral-800">{{ o.status }}</span>
                </td>
                <td class="px-4 py-2 border-b">
                  <div class="flex items-center gap-2">
                    <select :disabled="allowedTransitions(o.status).length === 0 || updatingId === o.id" v-model="pendingStatus[o.id]" class="border border-neutral-300 rounded px-2 py-1 bg-white text-neutral-900">
                      <option disabled :value="undefined">Update status…</option>
                      <option v-for="s in allowedTransitions(o.status)" :key="s" :value="s">{{ s }}</option>
                    </select>
                    <button class="bg-primary text-white px-3 py-1 rounded disabled:opacity-50" :disabled="!pendingStatus[o.id] || updatingId === o.id" @click="update(o.id)">
                      {{ updatingId === o.id ? 'Updating…' : 'Update' }}
                    </button>
                    <NuxtLink :to="`/invoice?order_id=${o.id}`" v-if="canViewInvoice(o.status)" class="border px-3 py-1 rounded">Invoice</NuxtLink>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

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
import { ref, onMounted } from 'vue';
import { useOrdersApi, type OrderStatus } from '~/composables/useOrders';

definePageMeta({ middleware: 'admin' });

const { adminListOrders, adminUpdateOrderStatus } = useOrdersApi();

const statuses: Exclude<OrderStatus, 'Failed'>[] = [
  'Pending Payment', 'Paid', 'Shipped', 'Completed', 'Cancelled'
];

const status = ref<string>('');
const userId = ref<number | undefined>(undefined);
const page = ref(1);
const limit = ref(10);
const loading = ref(false);
const updatingId = ref<number | null>(null);
const error = ref('');
const orders = ref<any[]>([]);
const pendingStatus = ref<Record<number, any>>({});

function allowedTransitions(current: OrderStatus): Exclude<OrderStatus, 'Failed'>[] {
  switch (current) {
    case 'Pending Payment':
      return ['Paid', 'Cancelled'];
    case 'Paid':
      return ['Shipped', 'Cancelled'];
    case 'Shipped':
      return ['Completed', 'Cancelled'];
    default:
      return [];
  }
}

function canViewInvoice(st: string) {
  return st === 'Paid' || st === 'Shipped' || st === 'Completed';
}

async function load() {
  try {
    loading.value = true;
    error.value = '';
    const skip = (page.value - 1) * limit.value;
    const res = await adminListOrders({ status: status.value as any, user_id: userId.value, skip, limit: limit.value });
    orders.value = res || [];
  } catch (e: any) {
    error.value = e?.data || e?.message || 'Failed to load orders';
  } finally {
    loading.value = false;
  }
}

async function update(orderId: number) {
  const next = pendingStatus.value[orderId];
  if (!next) return;
  try {
    updatingId.value = orderId;
    await adminUpdateOrderStatus(orderId, next);
    await load();
    pendingStatus.value[orderId] = undefined;
  } catch (e: any) {
    error.value = e?.data || e?.message || 'Failed to update status';
  } finally {
    updatingId.value = null;
  }
}

function nextPage() { page.value += 1; load(); }
function prevPage() { if (page.value > 1) { page.value -= 1; load(); } }
function refresh() { page.value = 1; load(); }

onMounted(load);
</script>
