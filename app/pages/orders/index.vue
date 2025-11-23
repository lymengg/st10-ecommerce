<template>
  <UContainer class="py-8">
    <div class="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-3xl font-bold text-neutral-900">Order History</h1>
          <p class="text-neutral-600 mt-1">
            Track your recent purchases and orders
          </p>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <span class="text-sm text-neutral-600 font-medium">Filter:</span>
            <USelect
              v-model="status"
              :items="statusOptions"
              value-key="value"
              placeholder="All Orders"
              size="sm"
              class="min-w-40"
            />
          </div>
        </div>
      </div>

      <div v-if="loading" class="flex justify-center py-12">
        <div class="text-neutral-600">Loading your orders...</div>
      </div>
      <div v-else-if="error" class="text-red-600 py-4">{{ error }}</div>
      <div v-else>
        <UCard>
          <UTable
            :data="orders"
            :columns="columns"
            :loading="loading"
            empty="No orders found. Start shopping to see your orders here!"
          >
            <template #id-cell="{ row }">
              <div class="flex items-center gap-2">
                <Icon
                  name="i-heroicons-shopping-bag"
                  class="w-4 h-4 text-neutral-400"
                />
                <span class="font-semibold text-neutral-900"
                  >#{{ row.original.id }}</span
                >
              </div>
            </template>
            <template #created_at-cell="{ row }">
              <div class="text-sm">
                <div class="text-neutral-900">
                  {{ formatDate(row.original.created_at) }}
                </div>
                <div class="text-neutral-500">
                  {{ formatTime(row.original.created_at) }}
                </div>
              </div>
            </template>
            <template #items-cell="{ row }">
              <div class="text-sm">
                <div class="font-medium text-neutral-900">
                  {{ row.original.total_items }} item{{
                    row.original.total_items > 1 ? "s" : ""
                  }}
                </div>
                <div class="text-neutral-500">
                  {{ getItemsSummary(row.original.items) }}
                </div>
              </div>
            </template>
            <template #subtotal-cell="{ row }">
              <div class="text-right">
                <div class="font-semibold text-neutral-900">
                  ${{ Number(row.original.subtotal).toFixed(2) }}
                </div>
              </div>
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
              <div class="flex items-center gap-2 justify-end">
                <UButton
                  size="xs"
                  variant="soft"
                  color="neutral"
                  :to="`/orders/${row.original.id}`"
                >
                  <template #leading>
                    <Icon name="i-heroicons-eye" />
                  </template>
                  View Details
                </UButton>
                <UButton
                  v-if="canViewInvoice(row.original.status)"
                  size="xs"
                  color="primary"
                  :to="`/invoice?order_id=${row.original.id}`"
                >
                  <template #leading>
                    <Icon name="i-heroicons-document-text" />
                  </template>
                  Invoice
                </UButton>
              </div>
            </template>
          </UTable>
        </UCard>

        <div class="mt-6 flex justify-center">
          <UPagination
            v-model:page="page"
            :items-per-page="limit"
            :total="total"
            @update:page="load"
          />
        </div>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useOrdersApi, type OrderStatus } from "~/composables/useOrders";

definePageMeta({ middleware: "auth" });

const { listMyOrders } = useOrdersApi();

// Use exact same statuses as admin orders for consistent filtering
const statuses: OrderStatus[] = [
  "Pending Payment",
  "Paid",
  "Shipped",
  "Completed",
  "Cancelled",
  "Failed",
];

const statusOptions = [
  { label: "All Orders", value: "all" },
  ...statuses.map((s) => ({ label: s, value: s })),
];


const columns = [
  { accessorKey: "id", header: "Order" },
  { accessorKey: "created_at", header: "Date" },
  { accessorKey: "items", header: "Items" },
  { accessorKey: "subtotal", header: "Total" },
  { accessorKey: "status", header: "Status" },
  { id: "actions", header: "Actions" },
];

const status = ref<string>("all");
const page = ref(1);
const limit = ref(10);
const total = ref(0);
const loading = ref(false);
const error = ref("");
const orders = ref<any[]>([]);

function canViewInvoice(st: string) {
  return st === "Paid" || st === "Shipped" || st === "Completed";
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getItemsSummary(items: any[]) {
  if (!items || items.length === 0) return "";
  if (items.length === 1) {
    return items[0].product?.name || "Product";
  }
  return `${items[0].product?.name || "Product"} +${items.length - 1} more`;
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
    
    
    const params: any = {
      skip,
      limit: limit.value,
    };
    
    // Only add status if it's not 'all'
    if (status.value && status.value !== 'all') {
      params.status = status.value as OrderStatus;
    }
    
    const res: any = await listMyOrders(params);
    

    // Handle paginated response structure: { items: OrderOut[], total: number, skip: number, limit: number }
    if (res && res.items && Array.isArray(res.items)) {
      orders.value = res.items;
      total.value = res.total || 0;
    } else if (Array.isArray(res)) {
      orders.value = res;
      total.value = res.length;
    } else {
      orders.value = [];
      total.value = 0;
    }
  } catch (e: any) {
    error.value = e?.data || e?.message || "Failed to load orders";
  } finally {
    loading.value = false;
  }
}

// Reset page when status changes for better UX
watch(status, () => {
  page.value = 1;
  load();
});

// Watch page and limit changes
watch([page, limit], load);

onMounted(load);
</script>
