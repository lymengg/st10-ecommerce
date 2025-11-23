<template>
  <!-- Loading State -->
  <UContainer v-if="loading" class="py-8 bg-white min-h-screen">
    <div class="flex flex-col lg:flex-row gap-8">
      <div class="lg:w-1/2">
        <UCard class="bg-white border border-neutral-200">
          <div class="w-full h-96 flex items-center justify-center bg-neutral-100 rounded-lg">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </UCard>
      </div>

      <div class="lg:w-1/2 flex flex-col">
        <div class="flex-1">
          <!-- Loading placeholders -->
          <div class="h-12 bg-neutral-200 rounded-lg mb-4 animate-pulse"></div>
          <div class="h-6 bg-neutral-200 rounded-lg w-32 mb-6 animate-pulse"></div>
          <div class="h-8 bg-neutral-200 rounded-lg w-48 mb-8 animate-pulse"></div>
          <div class="h-4 bg-neutral-200 rounded-lg mb-2 animate-pulse"></div>
          <div class="h-4 bg-neutral-200 rounded-lg mb-2 animate-pulse"></div>
          <div class="h-4 bg-neutral-200 rounded-lg w-3/4 mb-8 animate-pulse"></div>
          <div class="flex gap-4">
            <div class="h-14 bg-neutral-200 rounded-lg flex-1 animate-pulse"></div>
            <div class="h-14 bg-neutral-200 rounded-lg flex-1 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  </UContainer>

  <!-- Product Details -->
  <UContainer v-else-if="product && !error" class="py-8 bg-white">
    <div class="flex flex-col lg:flex-row gap-8">
      <div class="lg:w-1/2">
        <UCard class="bg-white border border-neutral-200">
          <img
            :src="normalizeImage(product.image)"
            :alt="product.name"
            class="w-full h-96 object-cover rounded-lg shadow-md bg-white"
            @error="onImageError"
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

          <!-- Stock Information -->
          <div v-if="product.stock !== undefined" class="mb-6">
            <div class="flex items-center gap-2">
              <Icon
                :name="product.stock > 0 ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
                :class="product.stock > 0 ? 'text-green-600' : 'text-red-600'"
                class="w-5 h-5"
              />
              <span
                :class="product.stock > 0 ? 'text-green-700' : 'text-red-700'"
                class="font-medium"
              >
                {{ product.stock > 0 ? `${product.stock} in stock` : 'Out of stock' }}
              </span>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-4">
            <UButton
              @click="addToCart"
              size="xl"
              color="primary"
              variant="solid"
              class="flex-1 text-white"
              :loading="isAddingToCart"
              :disabled="product.stock === 0"
            >
              <template #leading>
                <Icon name="i-heroicons-shopping-cart" />
              </template>
              {{ product.stock === 0 ? 'Out of Stock' : 'Add to Cart' }}
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

  <!-- Error State -->
  <UContainer v-else-if="error" class="py-8 bg-white">
    <div class="text-center">
      <UCard class="bg-white">
        <div class="py-12">
          <Icon
            name="i-heroicons-exclamation-triangle"
            class="mx-auto h-12 w-12 text-red-600 mb-4"
          />
          <h2 class="text-2xl font-semibold text-neutral-900 mb-4">
            Failed to load product
          </h2>
          <p class="text-neutral-600 mb-6">
            {{ error }}
          </p>
          <div class="flex gap-4 justify-center">
            <UButton
              @click="fetchProduct"
              size="lg"
              color="primary"
            >
              <template #leading>
                <Icon name="i-heroicons-arrow-path" />
              </template>
              Try Again
            </UButton>
            <UButton to="/" size="lg" variant="outline">
              <template #leading>
                <Icon name="i-heroicons-arrow-left" />
              </template>
              Back to Catalog
            </UButton>
          </div>
        </div>
      </UCard>
    </div>
  </UContainer>

  <!-- Product Not Found -->
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
import { ref, onMounted, watch } from "vue";
import { useApi } from "../../composables/useApi";
import { useAuth } from "../../composables/useAuth";

const route = useRoute();
const router = useRouter();
const productId = Number(route.params.id);
const { request } = useApi();
const { isAuthenticated } = useAuth();

// State management
const loading = ref(true);
const error = ref<string | null>(null);
const product = ref<any | null>(null);
const isAddingToCart = ref(false);

const toast = useToast();

// Image helpers (same as index.vue)
const placeholderImg =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

function normalizeImage(img?: string | null) {
  if (!img) return placeholderImg;
  const s = String(img).trim();
  if (s.startsWith("data:image/")) return s;
  if (/^[A-Za-z0-9+/=]+$/.test(s) && s.length > 100)
    return `data:image/jpeg;base64,${s}`;
  return s;
}

function onImageError(e: Event) {
  const el = e.target as HTMLImageElement;
  if (!el) return;
  el.onerror = null;
  el.src = placeholderImg;
}

// Fetch product from API
async function fetchProduct() {
  loading.value = true;
  error.value = null;

  try {
    const res: any = await request(`/api/products/${productId}`, {
      method: "GET",
    });

    // Handle the v1 API response format
    if (res && typeof res === "object") {
      // If response has standardized format with data field
      if (res.data) {
        product.value = res.data;
      } else {
        // Direct product object
        product.value = res;
      }
    } else {
      throw new Error("Invalid response format from API");
    }
  } catch (err: any) {
    console.error("Failed to fetch product:", err);
    error.value = err.data || err.message || "Failed to load product details";
    product.value = null;
  } finally {
    loading.value = false;
  }
}

// Add to cart functionality
async function addToCart() {
  if (!product.value) return;

  // Check if user is authenticated
  if (!isAuthenticated.value) {
    // Store the current product page for redirect after login
    const returnUrl = encodeURIComponent(route.fullPath);
    router.push(`/login?return=${returnUrl}`);
    return;
  }

  isAddingToCart.value = true;

  try {
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
    // Handle authentication errors during the request
    if (e?.status === 401) {
      // Token might have expired, redirect to login
      const returnUrl = encodeURIComponent(route.fullPath);
      router.push(`/login?return=${returnUrl}`);
      return;
    }

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

// Load product on component mount
onMounted(() => {
  fetchProduct();
});

// Watch for route changes (in case navigating between product pages)
watch(() => route.params.id, (newId) => {
  productId.value = Number(newId);
  fetchProduct();
});
</script>
