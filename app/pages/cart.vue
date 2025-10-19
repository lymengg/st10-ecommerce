<template>
  <UContainer class="py-8">
    <h1 class="text-3xl font-bold mb-8 text-gray-900">Your Cart</h1>

    <div v-if="cart.length > 0">
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
                :disabled="item.qty <= 1"
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

async function fetchCart() {
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
  } catch (e) {
    cart.value = [];
    serverSubtotal.value = 0;
    serverTotalItems.value = 0;
  }
}

async function updateQty(item: any, change: number) {
  const idx = cart.value.findIndex((i) => i.id === item.id);
  if (idx === -1) return;
  const nextQty = Math.max(1, cart.value[idx].qty + change);

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
  }
}

async function removeItem(item: any) {
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
  }
}

const total = computed(() => {
  if (serverSubtotal.value !== null) return Number(serverSubtotal.value) || 0;
  return cart.value.reduce((sum, item) => sum + item.price * item.qty, 0);
});

onMounted(fetchCart);
</script>
