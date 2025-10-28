<template>
  <div class="min-h-screen bg-neutral-50 py-10">
    <div
      class="max-w-6xl mx-auto bg-white rounded-xl shadow-lg border border-neutral-200 p-8"
    >
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-neutral-900">Admin • Orders</h1>
        <div class="flex items-center gap-3">
          <label class="text-sm text-neutral-600">Status</label>
          <select
            v-model="status"
            class="border border-neutral-300 rounded-lg px-3 py-2 bg-white text-neutral-900"
          >
            <option value="">All</option>
            <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
          </select>
          <label class="text-sm text-neutral-600 ml-4">User ID</label>
          <input
            v-model.number="userId"
            type="number"
            min="1"
            placeholder="e.g. 42"
            class="w-28 border border-neutral-300 rounded-lg px-3 py-2 bg-white text-neutral-900"
          />
          <button
            @click="refresh"
            class="border px-3 py-2 rounded-lg hover:bg-neutral-50"
          >
            Apply
          </button>
        </div>
      </div>

      <div v-if="loading">Loading orders...</div>
      <div v-else-if="error" class="text-red-600">{{ error }}</div>
      <div v-else>
        <div v-if="orders.length === 0" class="text-neutral-600">
          No orders found.
        </div>
        <div v-else>
          <UTable
            :data="orders"
            :columns="columns"
            :loading="loading"
            empty="No orders found."
          >
            <template #id-cell="{ row }">
              <span class="font-medium">#{{ row.original.id }}</span>
            </template>
            <template #created_at-cell="{ row }">
              <span class="text-sm text-neutral-600">{{
                new Date(row.original.created_at).toLocaleString()
              }}</span>
            </template>
            <template #total_items-cell="{ row }">
              {{ row.original.total_items }}
            </template>
            <template #subtotal-cell="{ row }">
              ${{ Number(row.original.subtotal).toFixed(2) }}
            </template>
            <template #status-cell="{ row }">
              <UBadge
                :color="getStatusColor(row.original.status)"
                :variant="getStatusVariant(row.original.status)"
                size="md"
              >
                {{ row.original.status }}
              </UBadge>
            </template>
            <template #actions-cell="{ row }">
              <div class="flex items-center gap-2">
                <select
                  :disabled="
                    allowedTransitions(row.original.status).length === 0 ||
                    updatingId === row.original.id
                  "
                  v-model="pendingStatus[row.original.id]"
                  class="border border-neutral-300 rounded px-2 py-1 bg-white text-neutral-900"
                >
                  <option disabled :value="undefined">Update status…</option>
                  <option
                    v-for="s in allowedTransitions(row.original.status)"
                    :key="s"
                    :value="s"
                  >
                    {{ s }}
                  </option>
                </select>
                <button
                  class="bg-primary text-white px-3 py-1 rounded disabled:opacity-50"
                  :disabled="
                    !pendingStatus[row.original.id] ||
                    updatingId === row.original.id
                  "
                  @click="update(row.original.id)"
                >
                  {{ updatingId === row.original.id ? "Updating…" : "Update" }}
                </button>
                <NuxtLink
                  :to="`/invoice?order_id=${row.original.id}`"
                  v-if="canViewInvoice(row.original.status)"
                  class="border px-3 py-1 rounded"
                  >Invoice</NuxtLink
                >
              </div>
            </template>
          </UTable>
        </div>

        <div class="mt-6 flex items-center justify-center">
          <UPagination
            v-model:page="page"
            :items-per-page="limit"
            :total="total"
            @update:page="load"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useOrdersApi, type OrderStatus } from "~/composables/useOrders";

definePageMeta({ layout: "admin", middleware: "admin" });

const { adminListOrders, adminUpdateOrderStatus } = useOrdersApi();

const columns = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "created_at", header: "Created" },
  { accessorKey: "total_items", header: "Items" },
  { accessorKey: "subtotal", header: "Subtotal" },
  { accessorKey: "status", header: "Status" },
  { id: "actions", header: "Actions" },
];

const statuses: Exclude<OrderStatus, "Failed">[] = [
  "Pending Payment",
  "Paid",
  "Shipped",
  "Completed",
  "Cancelled",
];

const status = ref<string>("");
const userId = ref<number | undefined>(undefined);
const page = ref(1);
const limit = ref(10);
const loading = ref(false);
const total = ref(0);
const updatingId = ref<number | null>(null);
const error = ref("");
const orders = ref<any[]>([]);
const pendingStatus = ref<Record<number, any>>({});

function allowedTransitions(
  current: OrderStatus
): Exclude<OrderStatus, "Failed">[] {
  switch (current) {
    case "Pending Payment":
      return ["Paid", "Cancelled"];
    case "Paid":
      return ["Shipped", "Cancelled"];
    case "Shipped":
      return ["Completed", "Cancelled"];
    default:
      return [];
  }
}

function canViewInvoice(st: string) {
  return st === "Paid" || st === "Shipped" || st === "Completed";
}

function getStatusColor(
  status: string
):
  | "success"
  | "error"
  | "primary"
  | "secondary"
  | "info"
  | "warning"
  | "neutral" {
  switch (status) {
    case "Pending Payment":
      return "warning"; // amber/yellow equivalent
    case "Paid":
      return "success"; // green equivalent
    case "Shipped":
      return "info"; // blue equivalent
    case "Completed":
      return "success"; // emerald/green equivalent
    case "Cancelled":
    case "Failed":
      return "error"; // red equivalent
    default:
      return "neutral";
  }
}

function getStatusVariant(
  status: string
): "solid" | "outline" | "soft" | "subtle" {
  switch (status) {
    case "Completed":
      return "solid"; // Make completed stand out more
    default:
      return "soft"; // Use soft variant for others
  }
}

async function load() {
  try {
    loading.value = true;
    error.value = "";
    const skip = (page.value - 1) * limit.value;
    const res: any = await adminListOrders({
      status: status.value as any,
      user_id: userId.value,
      skip,
      limit: limit.value,
    });

    // Handle paginated orders response: { items: OrderOut[], total: number, skip: number, limit: number }
    if (res && res.items && Array.isArray(res.items)) {
      orders.value = res.items;
      total.value = res.total || 0;
    } else {
      orders.value = [];
      total.value = 0;
      console.error("Unexpected API response structure:", res);
    }
  } catch (e: any) {
    error.value = e?.data || e?.message || "Failed to load orders";
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
    error.value = e?.data || e?.message || "Failed to update status";
  } finally {
    updatingId.value = null;
  }
}

function refresh() {
  page.value = 1;
  load();
}

onMounted(load);
</script>
