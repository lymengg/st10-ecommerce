<template>
  <UContainer class="py-8">
    <div v-if="order" class="max-w-4xl mx-auto">
      <!-- Invoice Header -->
      <UCard class="mb-8">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h1 class="text-4xl font-bold text-gray-900 mb-2">Invoice</h1>
            <p class="text-gray-600">Thank you for your purchase!</p>
          </div>
          <div class="text-right">
            <UBadge color="green" variant="soft" size="lg" class="mb-2">
              Order Confirmed
            </UBadge>
            <p class="text-sm text-gray-600">
              Order #{{ order.orderNumber || "N/A" }}
            </p>
          </div>
        </div>

        <UDivider class="my-6" />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Order Details -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Order Details
            </h3>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600">Order Date:</span>
                <span class="font-medium">{{ formatDate(order.date) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Order Number:</span>
                <span class="font-medium">{{
                  order.orderNumber || "N/A"
                }}</span>
              </div>
            </div>
          </div>

          <!-- Customer Information -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Customer Information
            </h3>
            <div class="space-y-2">
              <div>
                <span class="text-gray-600">Name:</span>
                <p class="font-medium">{{ order.name }}</p>
              </div>
              <div>
                <span class="text-gray-600">Email:</span>
                <p class="font-medium">{{ order.email }}</p>
              </div>
              <div>
                <span class="text-gray-600">Shipping Address:</span>
                <p class="font-medium">{{ order.address }}</p>
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Order Items -->
      <UCard class="mb-8">
        <template #header>
          <h3 class="text-xl font-semibold">Order Items</h3>
        </template>

        <UTable
          :columns="[
            { key: 'name', label: 'Product' },
            { key: 'qty', label: 'Quantity' },
            { key: 'price', label: 'Unit Price' },
            { key: 'total', label: 'Total' },
          ]"
          :rows="orderItems"
        >
          <template #name-data="{ row }">
            <div class="flex items-center gap-3">
              <img
                :src="row.image"
                :alt="row.name"
                class="w-12 h-12 object-cover rounded-lg"
              />
              <div>
                <p class="font-medium text-gray-900">{{ row.name }}</p>
                <p class="text-sm text-gray-500">{{ row.brand }}</p>
              </div>
            </div>
          </template>

          <template #qty-data="{ row }">
            <span class="font-medium">{{ row.qty }}</span>
          </template>

          <template #price-data="{ row }">
            <span class="font-medium">${{ row.price.toFixed(2) }}</span>
          </template>

          <template #total-data="{ row }">
            <span class="font-semibold"
              >${{ (row.price * row.qty).toFixed(2) }}</span
            >
          </template>
        </UTable>

        <UDivider class="my-6" />

        <div class="flex justify-end">
          <div class="text-right">
            <div class="text-2xl font-bold text-primary">
              Total: ${{ order.total.toFixed(2) }}
            </div>
          </div>
        </div>
      </UCard>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-4 justify-between print:hidden">
        <UButton to="/" size="lg" color="gray" variant="outline">
          <template #leading>
            <Icon name="i-heroicons-arrow-left" />
          </template>
          Back to Catalog
        </UButton>

        <div class="flex gap-4">
          <UButton
            @click="printInvoice"
            size="lg"
            color="primary"
            variant="outline"
          >
            <template #leading>
              <Icon name="i-heroicons-printer" />
            </template>
            Print Invoice
          </UButton>

          <UButton to="/cart" size="lg" color="primary">
            <template #leading>
              <Icon name="i-heroicons-shopping-cart" />
            </template>
            Shop Again
          </UButton>
        </div>
      </div>
    </div>

    <div v-else>
      <UCard>
        <div class="text-center py-12">
          <Icon
            name="i-heroicons-document-text"
            class="mx-auto h-16 w-16 text-gray-400 mb-4"
          />
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">
            No order found
          </h2>
          <p class="text-gray-600 mb-6">We couldn't find any recent orders.</p>
          <UButton to="/" size="lg" color="primary">
            <Icon name="i-heroicons-shopping-bag" />
            Start Shopping
          </UButton>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";

const order = ref<any>(null);

function loadOrder() {
  order.value = JSON.parse(localStorage.getItem("lastOrder") || "null");
}

const orderItems = computed(() => {
  if (!order.value?.cart) return [];
  return order.value.cart.map((item: any) => ({
    ...item,
    total: item.price * item.qty,
  }));
});

function printInvoice() {
  window.print();
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

onMounted(loadOrder);
</script>
