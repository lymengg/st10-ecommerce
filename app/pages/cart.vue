<template>
  <UContainer class="py-8">
    <h1 class="text-3xl font-bold mb-8 text-gray-900">Your Cart</h1>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="bg-white rounded-lg border border-neutral-200 p-12"
    >
      <div class="flex flex-col items-center justify-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"
        ></div>
        <p class="text-neutral-600">Loading your cart...</p>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 rounded-lg p-6 mb-8"
    >
      <div class="flex items-center gap-3">
        <Icon
          name="i-heroicons-exclamation-triangle"
          class="w-6 h-6 text-red-600"
        />
        <div>
          <h3 class="text-red-900 font-semibold">Failed to load cart</h3>
          <p class="text-red-700">{{ error }}</p>
          <button
            @click="fetchCart"
            class="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>

    <!-- Cart Content -->
    <div v-else-if="cart.length > 0">
      <div class="space-y-4 mb-8">
        <UCard v-for="item in cart" :key="item.id" class="overflow-hidden">
          <div class="flex items-center gap-4 p-4">
            <img
              :src="item.image"
              :alt="item.name"
              class="w-20 h-20 object-cover rounded-lg flex-shrink-0"
            />

            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-semibold text-gray-900 truncate">
                {{ item.name }}
              </h3>
              <p class="text-gray-500">{{ item.brand }}</p>
              <p class="text-lg font-bold text-primary">${{ item.price }}</p>
            </div>

            <div class="flex items-center gap-3">
              <UButton
                @click="updateQty(item, -1)"
                size="sm"
                color="neutral"
                variant="outline"
                square
                :disabled="item.qty <= 1 || updatingItems.has(item.id)"
                :loading="updatingItems.has(item.id)"
              >
                <Icon name="i-heroicons-minus" />
              </UButton>

              <span class="text-lg font-semibold min-w-[2rem] text-center">{{
                item.qty
              }}</span>

              <UButton
                @click="updateQty(item, 1)"
                size="sm"
                color="neutral"
                variant="outline"
                square
                :disabled="updatingItems.has(item.id)"
                :loading="updatingItems.has(item.id)"
              >
                <Icon name="i-heroicons-plus" />
              </UButton>
            </div>

            <div class="text-right">
              <p class="text-lg font-bold text-gray-900">
                ${{ (item.price * item.qty).toFixed(2) }}
              </p>
              <UButton
                @click="removeItem(item)"
                size="sm"
                color="error"
                variant="ghost"
                class="mt-2"
                :loading="removingItems.has(item.id)"
                :disabled="removingItems.has(item.id)"
              >
                <Icon name="i-heroicons-trash" />
                Remove
              </UButton>
            </div>
          </div>
        </UCard>
      </div>

      <UCard class="bg-white">
        <div class="flex justify-between items-center p-6">
          <div>
            <p class="text-sm text-gray-600">Total Amount</p>
            <p class="text-3xl font-bold text-gray-900">
              ${{ total.toFixed(2) }}
            </p>
          </div>
          <div class="flex gap-4">
            <UButton to="/" size="lg" color="neutral" variant="outline">
              <Icon name="i-heroicons-arrow-left" />
              Continue Shopping
            </UButton>
            <UButton to="/checkout" size="lg" color="primary">
              <Icon name="i-heroicons-credit-card" />
              Checkout
            </UButton>
          </div>
        </div>
      </UCard>
    </div>

    <div v-else>
      <UCard>
        <div class="text-center py-12">
          <Icon
            name="i-heroicons-shopping-cart"
            class="mx-auto h-16 w-16 text-gray-400 mb-4"
          />
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">
            Your cart is empty
          </h2>
          <p class="text-gray-600 mb-6">
            Looks like you haven't added any items to your cart yet.
          </p>
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
import { useApi } from "../composables/useApi";

const cart = ref<any[]>([]);
const toast = useToast();
const { request } = useApi();
const serverSubtotal = ref<number | null>(null);
const serverTotalItems = ref<number | null>(null);

// Loading states
const loading = ref(false);
const error = ref<string | null>(null);
const updatingItems = ref(new Set<number>());
const removingItems = ref(new Set<number>());

async function fetchCart() {
  loading.value = true;
  error.value = null;

  try {
    const res: any = await request("/api/cart", { method: "GET" });
    const payload: any = res?.data ?? res;
    const list = Array.isArray(payload?.items) ? payload.items : [];
    serverSubtotal.value =
      typeof payload?.subtotal === "number"
        ? payload.subtotal
        : Number(payload?.subtotal) || 0;
    serverTotalItems.value =
      typeof payload?.total_items === "number"
        ? payload.total_items
        : Number(payload?.total_items) || null;

    cart.value = list.map((it: any) => {
      const p = it.product || {};
      return {
        id: p.id,
        name: p.name,
        brand: p.brand,
        image: p.image,
        price: p.price,
        qty: it.quantity ?? 1,
      };
    });
  } catch (e: any) {
    console.error("Failed to fetch cart:", e);
    error.value = e?.data || e?.message || "Failed to load your cart";
    cart.value = [];
    serverSubtotal.value = 0;
    serverTotalItems.value = 0;
  } finally {
    loading.value = false;
  }
}

async function updateQty(item: any, change: number) {
  const idx = cart.value.findIndex((i) => i.id === item.id);
  if (idx === -1) return;
  const nextQty = Math.max(1, cart.value[idx].qty + change);

  // Add to loading state
  updatingItems.value.add(item.id);

  // Optimistic UI update
  const prevQty = cart.value[idx].qty;
  cart.value[idx].qty = nextQty;

  try {
    await request(`/api/cart/items/${item.id}`, {
      method: "patch",
      headers: { "Content-Type": "application/json" },
      body: { quantity: nextQty },
    });

    toast.add({
      title: "Cart updated",
      description: `${item.name} quantity updated to ${nextQty}`,
      color: "primary",
      icon: "i-heroicons-shopping-cart",
    });

    // Optionally re-fetch to sync server-calculated values
    fetchCart();
  } catch (e: any) {
    // Revert on error
    cart.value[idx].qty = prevQty;
    toast.add({
      title: "Failed to update cart",
      description: e?.data || e?.message || "Error",
      color: "error",
      icon: "i-heroicons-exclamation-triangle",
    });
  } finally {
    // Remove from loading state
    updatingItems.value.delete(item.id);
  }
}

async function removeItem(item: any) {
  // Add to loading state
  removingItems.value.add(item.id);

  const prev = [...cart.value];
  cart.value = cart.value.filter((i) => i.id !== item.id);

  try {
    await request(`/api/cart/items/${item.id}`, { method: "DELETE" });
    toast.add({
      title: "Item removed",
      description: `${item.name} has been removed from your cart`,
      color: "warning",
      icon: "i-heroicons-trash",
    });
    // Ensure sync with server
    fetchCart();
  } catch (e: any) {
    cart.value = prev;
    toast.add({
      title: "Failed to remove item",
      description: e?.data || e?.message || "Error",
      color: "error",
      icon: "i-heroicons-exclamation-triangle",
    });
  } finally {
    // Remove from loading state
    removingItems.value.delete(item.id);
  }
}

const total = computed(() => {
  if (serverSubtotal.value !== null) return Number(serverSubtotal.value) || 0;
  return cart.value.reduce((sum, item) => sum + item.price * item.qty, 0);
});

onMounted(fetchCart);
</script>
