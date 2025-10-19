<template>
  <UContainer class="py-8 bg-white" v-if="product">
    <div class="flex flex-col lg:flex-row gap-8">
      <div class="lg:w-1/2">
        <UCard class="bg-white border border-neutral-200">
          <img
            :src="product.image"
            :alt="product.name"
            class="w-full h-96 object-cover rounded-lg shadow-md bg-white"
          />
        </UCard>
      </div>

      <div class="lg:w-1/2 flex flex-col">
        <div class="flex-1">
          <h1 class="text-4xl font-bold mb-4 text-neutral-900">
            {{ product.name }}
          </h1>

          <UBadge
            color="primary"
            variant="soft"
            size="lg"
            class="mb-4 uppercase tracking-wide"
          >
            {{ product.brand }}
          </UBadge>

          <p class="text-3xl font-bold text-primary mb-6">
            ${{ product.price }}
          </p>

          <p class="text-neutral-700 mb-8 text-lg leading-relaxed">
            {{ product.description }}
          </p>

          <div class="flex flex-col sm:flex-row gap-4">
            <UButton
              @click="addToCart"
              size="xl"
              color="primary"
              variant="solid"
              class="flex-1 text-white"
              :loading="isAddingToCart"
            >
              <template #leading>
                <Icon name="i-heroicons-shopping-cart" />
              </template>
              Add to Cart
            </UButton>

            <UButton
              to="/"
              size="xl"
              variant="outline"
              class="flex-1 border-neutral-200 text-neutral-700 hover:bg-neutral-50"
            >
              <template #leading>
                <Icon name="i-heroicons-arrow-left" />
              </template>
              Back to Catalog
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </UContainer>

  <UContainer v-else class="py-8 bg-white">
    <div class="text-center">
      <UCard class="bg-white">
        <div class="py-12">
          <Icon
            name="i-heroicons-exclamation-triangle"
            class="mx-auto h-12 w-12 text-neutral-400 mb-4"
          />
          <h2 class="text-2xl font-semibold text-neutral-900 mb-4">
            Product not found
          </h2>
          <p class="text-neutral-600 mb-6">
            The product you're looking for doesn't exist.
          </p>
          <UButton to="/" size="lg" color="primary">
            <template #leading>
              <Icon name="i-heroicons-arrow-left" />
            </template>
            Back to Catalog
          </UButton>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import fallbackProducts from "@/data/products";
import { ref, onMounted } from "vue";
import { useApi } from "../../composables/useApi";

const route = useRoute();
const router = useRouter();
const productId = Number(route.params.id);
const product = ref<any | null>(null);
const { request } = useApi();

onMounted(async () => {
  // Try API first
  try {
    const res: any = await request(`/api/products/${productId}`, {
      method: "GET",
    });
    if (res?.status === "success" && res.data) {
      product.value = res.data;
      return;
    }
    if (res && !res.status && typeof res === "object") {
      product.value = res as any;
      return;
    }
  } catch (e) {
    // ignore and fallback
  }

  // Fallback to local data
  product.value = fallbackProducts.find((p) => p.id === productId) || null;
});
const isAddingToCart = ref(false);

const toast = useToast();

async function addToCart() {
  if (!product.value) return;
  isAddingToCart.value = true;

  try {
    // Optional small delay for UX consistency
    await new Promise((resolve) => setTimeout(resolve, 300));

    await request("/api/cart/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: { product_id: product.value.id, quantity: 1 },
    });

    toast.add({
      title: "Added to cart!",
      description: `${product.value?.name} has been added to your cart.`,
      color: "neutral",
      icon: "i-heroicons-check-circle",
    });
  } catch (e: any) {
    toast.add({
      title: "Failed to add to cart",
      description: e?.data || e?.message || "Error",
      color: "error",
      icon: "i-heroicons-exclamation-triangle",
    });
  } finally {
    isAddingToCart.value = false;
  }
}
</script>
