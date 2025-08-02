<template>
  <UContainer class="py-8">
    <h1 class="text-3xl font-bold mb-8 text-gray-900">Checkout</h1>

    <div v-if="cart.length > 0" class="max-w-4xl mx-auto">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Checkout Form -->
        <UCard>
          <template #header>
            <h2 class="text-xl font-semibold">Shipping Information</h2>
          </template>

          <UForm :state="formState" @submit="submitOrder" class="space-y-6">
            <UFormGroup label="Full Name" required>
              <UInput
                v-model="formState.name"
                placeholder="Enter your full name"
                size="lg"
                required
              />
            </UFormGroup>

            <UFormGroup label="Email Address" required>
              <UInput
                v-model="formState.email"
                type="email"
                placeholder="Enter your email"
                size="lg"
                required
              />
            </UFormGroup>

            <UFormGroup label="Shipping Address" required>
              <UTextarea
                v-model="formState.address"
                placeholder="Enter your complete address"
                :rows="4"
                required
              />
            </UFormGroup>

            <UButton
              type="submit"
              size="xl"
              color="primary"
              block
              :loading="isSubmitting"
            >
              <template #leading>
                <Icon name="i-heroicons-credit-card" />
              </template>
              Place Order - ${{ total.toFixed(2) }}
            </UButton>
          </UForm>
        </UCard>

        <!-- Order Summary -->
        <UCard>
          <template #header>
            <h2 class="text-xl font-semibold">Order Summary</h2>
          </template>

          <div class="space-y-4">
            <div
              v-for="item in cart"
              :key="item.id"
              class="flex items-center gap-3 py-3 border-b border-gray-200 last:border-b-0"
            >
              <img
                :src="item.image"
                :alt="item.name"
                class="w-16 h-16 object-cover rounded-lg flex-shrink-0"
              />
              <div class="flex-1 min-w-0">
                <h3 class="font-medium text-gray-900 truncate">
                  {{ item.name }}
                </h3>
                <p class="text-sm text-gray-500">Qty: {{ item.qty }}</p>
              </div>
              <div class="text-right">
                <p class="font-semibold text-gray-900">
                  ${{ (item.price * item.qty).toFixed(2) }}
                </p>
              </div>
            </div>

            <UDivider />

            <div class="flex justify-between items-center text-lg font-bold">
              <span>Total:</span>
              <span class="text-primary">${{ total.toFixed(2) }}</span>
            </div>
          </div>
        </UCard>
      </div>
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
            Add some items to your cart before checking out.
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
import { ref, computed, onMounted, reactive } from "vue";
import { useRouter } from "vue-router";

const cart = ref<any[]>([]);
const router = useRouter();
const toast = useToast();
const isSubmitting = ref(false);

const formState = reactive({
  name: "",
  email: "",
  address: "",
});

function loadCart() {
  cart.value = JSON.parse(localStorage.getItem("cart") || "[]");
}

const total = computed(() =>
  cart.value.reduce((sum, item) => sum + item.price * item.qty, 0)
);

async function submitOrder() {
  isSubmitting.value = true;

  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const order = {
    name: formState.name,
    email: formState.email,
    address: formState.address,
    cart: cart.value,
    total: total.value,
    date: new Date().toISOString(),
    orderNumber: `ORD-${Date.now()}`,
  };

  localStorage.setItem("lastOrder", JSON.stringify(order));
  localStorage.removeItem("cart");

  toast.add({
    title: "Order placed successfully!",
    description: `Order #${order.orderNumber} has been confirmed.`,
    color: "green",
    icon: "i-heroicons-check-circle",
  });

  isSubmitting.value = false;
  router.push("/invoice");
}

onMounted(loadCart);
</script>
