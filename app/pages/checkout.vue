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
            :class="
              orderPlaced ? 'opacity-50 pointer-events-none select-none' : ''
            "
          >
            <h2 class="text-xl font-semibold mb-4 text-neutral-800">
              Shipping Information
            </h2>
            <div>
              <label class="block mb-1 font-medium text-neutral-700"
                >Full Name</label
              >
              <input
                v-model="shipping.name"
                type="text"
                required
                class="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white text-neutral-900"
              />
            </div>
            <div>
              <label class="block mb-1 font-medium text-neutral-700"
                >Address</label
              >
              <input
                v-model="shipping.address"
                type="text"
                required
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
                  >Postal Code</label
                >
                <input
                  v-model="shipping.postal"
                  type="text"
                  required
                  class="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white text-neutral-900"
                />
              </div>
            </div>
            <div>
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
            <button
              type="submit"
              class="w-full bg-primary text-white py-3 rounded-lg font-semibold mt-6 hover:bg-primary/90 transition"
            >
              Place Order
            </button>
          </form>
          <!-- Modal Popup -->
          <div
            v-if="orderPlaced"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          >
            <div
              class="bg-white border-2 border-green-400 rounded-2xl shadow-2xl px-10 py-12 text-center max-w-lg w-full mx-4 animate-fade-in relative"
            >
              <div class="flex flex-col items-center mb-6">
                <div
                  class="bg-green-100 rounded-full p-5 mb-5 flex items-center justify-center"
                >
                  <svg
                    class="w-12 h-12 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="2.5"
                      fill="white"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M8 12.5l2.5 2.5 5-5"
                    />
                  </svg>
                </div>
                <h2 class="text-3xl font-extrabold text-green-700 mb-2">
                  Order Placed!
                </h2>
                <p class="text-green-800 text-lg mb-3">
                  Thank you for your purchase.
                </p>
              </div>
              <p class="text-neutral-700 mb-8 leading-relaxed text-base">
                Our team will contact you soon to confirm your order.<br />You
                will also receive an invoice by email.
              </p>
              <button
                @click="previewInvoice"
                class="bg-primary text-white px-8 py-3 rounded-lg font-semibold text-base shadow hover:bg-primary/90 transition"
              >
                <span class="inline-flex items-center gap-2">
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-7 4h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Preview Invoice
                </span>
              </button>
            </div>
          </div>
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
              v-for="item in cart"
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
            <span class="text-primary">${{ totalPrice.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";

type CartItem = {
  id: number;
  name: string;
  price: number;
  qty: number;
  image?: string;
};
const cart = ref<CartItem[]>([]);

function loadCart() {
  cart.value = JSON.parse(localStorage.getItem("cart") || "[]");
}

onMounted(loadCart);

const totalPrice = computed(() =>
  cart.value.reduce((sum, item) => sum + item.price * item.qty, 0)
);

const shipping = ref({
  name: "",
  address: "",
  city: "",
  postal: "",
  country: "",
});

const router = useRouter();
const orderPlaced = ref(false);

function submitOrder() {
  // Here you would handle order submission, validation, and API calls
  orderPlaced.value = true;
}

function previewInvoice() {
  router.push("/invoice");
}
</script>

<style scoped>
/* Add any custom styles here if needed */
</style>
