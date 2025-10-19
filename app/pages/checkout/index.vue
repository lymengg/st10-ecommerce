<template>
  <div class="min-h-screen bg-neutral-50 py-10">
    <div
      class="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-neutral-200 p-8"
    >
      <h1 class="text-3xl font-bold mb-8 text-center text-neutral-900">
        Checkout
      </h1>
      <div class="grid md:grid-cols-2 gap-8">
        <div>
          <form
            class="space-y-6"
            @submit.prevent="submitOrder"
            :class="loading ? 'opacity-60 pointer-events-none' : ''"
          >
            <h2 class="text-xl font-semibold mb-4 text-neutral-800">
              Shipping Information
            </h2>
            <div>
              <label class="block mb-1 font-medium text-neutral-700"
                >Full Name</label
              >
              <input
                v-model="shipping.full_name"
                type="text"
                required
                class="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white text-neutral-900"
              />
            </div>
            <div>
              <label class="block mb-1 font-medium text-neutral-700"
                >Phone</label
              >
              <input
                v-model="shipping.phone"
                type="tel"
                required
                class="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white text-neutral-900"
              />
            </div>
            <div>
              <label class="block mb-1 font-medium text-neutral-700"
                >Address line 1</label
              >
              <input
                v-model="shipping.address1"
                type="text"
                required
                class="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white text-neutral-900"
              />
            </div>
            <div>
              <label class="block mb-1 font-medium text-neutral-700"
                >Address line 2 (optional)</label
              >
              <input
                v-model="shipping.address2"
                type="text"
                class="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white text-neutral-900"
              />
            </div>
            <div class="flex gap-4">
              <div class="flex-1">
                <label class="block mb-1 font-medium text-neutral-700"
                  >City</label
                >
                <input
                  v-model="shipping.city"
                  type="text"
                  required
                  class="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white text-neutral-900"
                />
              </div>
              <div class="flex-1">
                <label class="block mb-1 font-medium text-neutral-700"
                  >State (optional)</label
                >
                <input
                  v-model="shipping.state"
                  type="text"
                  class="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white text-neutral-900"
                />
              </div>
            </div>
            <div class="flex gap-4">
              <div class="flex-1">
                <label class="block mb-1 font-medium text-neutral-700"
                  >Postal Code</label
                >
                <input
                  v-model="shipping.postal_code"
                  type="text"
                  required
                  class="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white text-neutral-900"
                />
              </div>
              <div class="flex-1">
                <label class="block mb-1 font-medium text-neutral-700"
                  >Country</label
                >
                <input
                  v-model="shipping.country"
                  type="text"
                  required
                  class="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white text-neutral-900"
                />
              </div>
            </div>

            <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>

            <button
              type="submit"
              class="w-full bg-primary text-white py-3 rounded-lg font-semibold mt-2 hover:bg-primary/90 transition disabled:opacity-60"
              :disabled="loading"
            >
              {{ loading ? 'Processing...' : 'Proceed to Payment' }}
            </button>
          </form>
        </div>

        <!-- Order Summary -->
        <div
          class="bg-neutral-50 rounded-xl p-6 border border-neutral-200 h-fit"
        >
          <h2 class="text-xl font-semibold mb-4 text-neutral-800">
            Order Summary
          </h2>
          <ul class="divide-y divide-neutral-200 mb-4">
            <li
              v-for="item in displayItems"
              :key="item.id"
              class="py-3 flex items-center justify-between gap-4"
            >
              <div class="flex items-center gap-3">
                <img
                  v-if="item.image"
                  :src="item.image"
                  :alt="item.name"
                  class="w-12 h-12 object-cover rounded border border-neutral-200 bg-white"
                />
                <div>
                  <span class="font-medium text-neutral-900">{{
                    item.name
                  }}</span>
                  <span class="block text-sm text-neutral-500"
                    >x{{ item.qty }}</span
                  >
                </div>
              </div>
              <span class="font-semibold text-neutral-900"
                >${{ (item.price * item.qty).toFixed(2) }}</span
              >
            </li>
          </ul>
          <div class="flex justify-between font-semibold text-lg">
            <span class="text-neutral-700">Total</span>
            <span class="text-primary">${{ subtotal.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  useCheckoutApi,
  type CartOut,
  type ShippingAddress,
} from "~/composables/useCheckout";

const router = useRouter();
const { getCart, createOrder, createPaymentSession } = useCheckoutApi();

// Cart state from backend
const cart = ref<CartOut | null>(null);
const loading = ref(false);
const error = ref("");

async function loadCart() {
  try {
    error.value = "";
    cart.value = await getCart();
  } catch (e: any) {
    error.value = e?.data || e?.message || "Failed to load cart";
  }
}

onMounted(loadCart);

const displayItems = computed(() => {
  if (!cart.value)
    return [] as {
      id: number;
      name: string;
      price: number;
      qty: number;
      image?: string;
    }[];
  return cart.value.items.map((ci) => ({
    id: ci.product.id,
    name: ci.product.name,
    price: ci.product.price,
    qty: ci.quantity,
    image: ci.product.image,
  }));
});

const subtotal = computed(() => cart.value?.subtotal || 0);

const shipping = ref<ShippingAddress>({
  full_name: "",
  phone: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "",
});

function buildReturnUrl(path: string, orderId: number) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}${path}?order_id=${orderId}`;
}

async function submitOrder() {
  try {
    loading.value = true;
    error.value = "";

    // Create order using current cart and shipping info
    const order = await createOrder({ shipping: shipping.value });

    // Create Stripe session and redirect
    const successUrl = buildReturnUrl("/checkout/success", order.id);
    const cancelUrl = buildReturnUrl("/checkout/cancel", order.id);
    const session = await createPaymentSession(order.id, successUrl, cancelUrl);

    if (session?.url) {
      window.location.href = session.url;
    } else {
      error.value = "Payment session could not be created";
    }
  } catch (e: any) {
    error.value = e?.data || e?.message || "Checkout failed";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
/* Add any custom styles here if needed */
</style>
