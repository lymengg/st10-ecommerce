<template>
  <UContainer class="py-8 min-h-screen">
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold mb-4 text-neutral-900">Watch Catalog</h1>
      <p class="text-gray-700 text-lg">
        Discover our premium collection of luxury timepieces
      </p>
    </div>

    <!-- Error State -->
    <div
      v-if="error"
      class="bg-red-50 border border-red-200 rounded-lg p-6 mb-8"
    >
      <div class="flex items-center gap-3">
        <Icon
          name="i-heroicons-exclamation-triangle"
          class="w-6 h-6 text-red-600"
        />
        <div>
          <h3 class="text-red-900 font-semibold">Failed to load products</h3>
          <p class="text-red-700">{{ error }}</p>
          <button
            @click="fetchProducts"
            class="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-else-if="loading"
      class="bg-white rounded-lg border border-neutral-200 p-12 mb-8"
    >
      <div class="flex flex-col items-center justify-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"
        ></div>
        <p class="text-neutral-600">Loading products...</p>
      </div>
    </div>

    <!-- Products loaded - Show filters -->
    <div v-else>
      <!-- Simple Filter Bar -->
      <div class="bg-white rounded-lg border border-neutral-200 p-6 mb-8">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-2">
            <Icon name="i-heroicons-funnel" class="w-5 h-5 text-primary" />
            <h2 class="text-lg font-semibold text-neutral-900">Filters</h2>
            <span class="text-sm text-neutral-500">
              ({{ filteredProducts.length }} of {{ totalProducts }} products)
            </span>
          </div>
          <button
            v-if="hasActiveFilters"
            @click="clearAllFilters"
            class="text-sm text-primary hover:text-primary/80 font-medium"
          >
            Clear all
          </button>
        </div>

        <!-- Filter Controls -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Search -->
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2"
              >Search</label
            >
            <div class="relative">
              <Icon
                name="i-heroicons-magnifying-glass"
                class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary/30"
              />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search watches..."
                class="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white text-neutral-900 placeholder-neutral-500"
              />
            </div>
          </div>

          <!-- Brand -->
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2"
              >Brand</label
            >
            <select
              v-model="selectedBrand"
              class="w-full px-3 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white text-neutral-900"
            >
              <option value="">All Brands</option>
              <option v-for="brand in brands" :key="brand" :value="brand">
                {{ brand }}
              </option>
            </select>
          </div>

          <!-- Price Range -->
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2"
              >Min Price</label
            >
            <input
              v-model.number="minPrice"
              type="number"
              placeholder="$0"
              min="0"
              class="w-full px-3 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white text-neutral-900 placeholder-neutral-500 white-spin"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2"
              >Max Price</label
            >
            <input
              v-model.number="maxPrice"
              type="number"
              placeholder="No limit"
              :min="minPrice || 0"
              class="w-full px-3 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white text-neutral-900 placeholder-neutral-500 white-spin"
            />
          </div>
        </div>

        <!-- Sort -->
        <div class="mt-4">
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Sort by</label
          >
          <select
            v-model="sortBy"
            class="w-full md:w-64 px-3 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white text-neutral-900"
          >
            <option value="">Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="brand-asc">Brand: A to Z</option>
          </select>
        </div>

        <!-- Active Filters -->
        <div
          v-if="hasActiveFilters"
          class="mt-4 pt-4 border-t border-neutral-200"
        >
          <div class="flex flex-wrap gap-2">
            <span class="text-sm text-neutral-600">Active filters:</span>
            <span
              v-if="selectedBrand"
              class="inline-flex items-center gap-1 px-3 py-1 bg-neutral-100 text-primary text-sm rounded-md"
            >
              {{ selectedBrand }}
              <button @click="selectedBrand = ''" class="hover:text-primary/80">
                <Icon name="i-heroicons-x-mark" class="w-3 h-3" />
              </button>
            </span>
            <span
              v-if="minPrice"
              class="inline-flex items-center gap-1 px-3 py-1 bg-neutral-100 text-primary text-sm rounded-md"
            >
              Min: ${{ minPrice }}
              <button @click="minPrice = null" class="hover:text-primary/80">
                <Icon name="i-heroicons-x-mark" class="w-3 h-3" />
              </button>
            </span>
            <span
              v-if="maxPrice"
              class="inline-flex items-center gap-1 px-3 py-1 bg-neutral-100 text-primary text-sm rounded-md"
            >
              Max: ${{ maxPrice }}
              <button @click="maxPrice = null" class="hover:text-primary/80">
                <Icon name="i-heroicons-x-mark" class="w-3 h-3" />
              </button>
            </span>
            <span
              v-if="searchQuery"
              class="inline-flex items-center gap-1 px-3 py-1 bg-neutral-100 text-primary text-sm rounded-md"
            >
              "{{ searchQuery }}"
              <button @click="searchQuery = ''" class="hover:text-primary/80">
                <Icon name="i-heroicons-x-mark" class="w-3 h-3" />
              </button>
            </span>
          </div>
        </div>

        <!-- No Products State -->
        <div
          v-if="!loading && !error && filteredProducts.length === 0"
          class="bg-white rounded-lg border border-neutral-200 p-12 mb-8"
        >
          <div class="flex flex-col items-center justify-center">
            <Icon
              name="i-heroicons-inbox"
              class="w-16 h-16 text-neutral-400 mb-4"
            />
            <h3 class="text-xl font-semibold text-neutral-900 mb-2">
              No products found
            </h3>
            <p class="text-neutral-600 mb-4">
              Try adjusting your filters or search terms
            </p>
            <button
              v-if="hasActiveFilters"
              @click="clearAllFilters"
              class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <!-- Products Grid -->
        <div
          v-if="!loading && !error && filteredProducts.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <div
            v-for="product in filteredProducts"
            :key="product.id"
            class="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-neutral-200 overflow-hidden"
          >
            <!-- Product Image -->
            <div class="relative aspect-square overflow-hidden bg-white">
              <img
                :src="normalizeImage(product.image)"
                :alt="product.name"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                @error="onImageError"
              />
              <!-- Wishlist Button -->
              <button
                class="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-neutral-100 transition-colors duration-200"
              >
                <Icon
                  name="i-heroicons-heart"
                  class="w-5 h-5 text-blue-600 hover:text-yellow-500 transition-colors"
                />
              </button>
            </div>

            <!-- Product Info -->
            <div class="p-6">
              <!-- Brand -->
              <div class="flex items-center justify-between mb-2">
                <span
                  class="text-sm font-medium text-primary uppercase tracking-wider"
                >
                  {{ product.brand }}
                </span>
                <div class="flex items-center gap-1">
                  <Icon
                    name="i-heroicons-star-solid"
                    class="w-4 h-4 text-primary/60"
                  />
                  <span class="text-sm text-neutral-500">4.8</span>
                </div>
              </div>

              <!-- Product Name -->
              <h3
                class="text-lg font-semibold text-neutral-900 mb-3 line-clamp-2 leading-tight"
              >
                {{ product.name }}
              </h3>

              <!-- Price and Action -->
              <div class="flex items-center justify-between">
                <div class="flex flex-col">
                  <span class="text-2xl font-bold text-primary">
                    ${{ product.price.toLocaleString() }}
                  </span>
                  <span class="text-sm text-neutral-500">Free shipping</span>
                </div>

                <NuxtLink
                  :to="`/product/${product.id}`"
                  class="inline-flex items-center justify-center px-4 py-2.5 bg-primary hover:bg-primary/80 text-white text-sm font-medium rounded-xl transition-colors duration-200 group-hover:bg-primary"
                >
                  View
                  <Icon name="i-heroicons-arrow-right" class="w-4 h-4 ml-1" />
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useApi } from "../composables/useApi";
import { useAuth } from "../composables/useAuth";

const { user, isAuthenticated } = useAuth();
const { request } = useApi();

// Loading and error states
const loading = ref(true);
const error = ref<string | null>(null);

// Filter state
const selectedBrand = ref("");
const minPrice = ref<number | null>(null);
const maxPrice = ref<number | null>(null);
const sortBy = ref("");
const searchQuery = ref("");

// Products state - initialize as empty array
const products = ref<any[]>([]);
const totalProducts = ref(0);
const currentPage = ref(1);
const totalPages = ref(0);

// Brand options
const brands = computed(() =>
  Array.from(new Set(products.value.map((p) => p.brand)))
);

const brandOptions = computed(() => [
  { label: "All Brands", value: "" },
  ...brands.value.map((brand) => ({ label: brand, value: brand })),
]);

// Sort options
const sortOptions = [
  { label: "Default", value: "" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Name: A to Z", value: "name-asc" },
  { label: "Name: Z to A", value: "name-desc" },
  { label: "Brand: A to Z", value: "brand-asc" },
];

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return !!(
    selectedBrand.value ||
    minPrice.value ||
    maxPrice.value ||
    searchQuery.value
  );
});

// Clear all filters function
const clearAllFilters = () => {
  selectedBrand.value = "";
  minPrice.value = null;
  maxPrice.value = null;
  sortBy.value = "";
  searchQuery.value = "";
};

// Filtered and sorted products
const filteredProducts = computed(() => {
  let filtered = products.value.filter((p) => {
    // Search filter (case-insensitive search in name, brand, and description)
    const searchMatch = !searchQuery.value ||
      p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.value.toLowerCase()));

    // Brand filter
    const brandMatch = !selectedBrand.value || p.brand === selectedBrand.value;

    // Price range filter
    const minVal =
      typeof minPrice.value === "number" && !isNaN(minPrice.value)
        ? minPrice.value
        : null;
    const maxVal =
      typeof maxPrice.value === "number" && !isNaN(maxPrice.value)
        ? maxPrice.value
        : null;
    const minPriceMatch = minVal === null || p.price >= minVal;
    const maxPriceMatch = maxVal === null || p.price <= maxVal;

    // All filters must match
    return searchMatch && brandMatch && minPriceMatch && maxPriceMatch;
  });

  // Apply sorting (client-side sorting)
  if (sortBy.value) {
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy.value) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "brand-asc":
          return a.brand.localeCompare(b.brand);
        default:
          return 0;
      }
    });
  }

  return filtered;
});

// Basic image helpers to avoid broken src when backend sends raw base64 or empty values
// Use a data URI placeholder to avoid 404 loops
const placeholderImg =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="; // 1x1 transparent gif

function normalizeImage(img?: string | null) {
  if (!img) return placeholderImg;
  const s = String(img).trim();
  if (s.startsWith("data:image/")) return s; // already a data URL
  // If it looks like raw base64, wrap into a data URL (assume jpeg)
  if (/^[A-Za-z0-9+/=]+$/.test(s) && s.length > 100)
    return `data:image/jpeg;base64,${s}`;
  // Otherwise return as-is (supports absolute http(s) URLs and app-relative /imgs/...)
  return s;
}

function onImageError(e: Event) {
  const el = e.target as HTMLImageElement;
  if (!el) return;
  // Prevent endless loops if the placeholder fails or src keeps erroring
  el.onerror = null;
  el.src = placeholderImg;
}

// Fetch products from API
async function fetchProducts() {
  loading.value = true;
  error.value = null;

  try {
    // Fetch all products without any filtering parameters
    const params: any = {
      skip: 0,
      limit: 100, // Reasonable limit for initial load
    };

    const res: any = await request("/api/products/", {
      method: "GET",
      query: params,
    });

    // Handle the paginated response format from our v1 API
    if (res && res.items && Array.isArray(res.items)) {
      products.value = res.items;
      totalProducts.value = res.total || res.items.length;
      currentPage.value = res.page || 1;
      totalPages.value = res.pages || 1;
    } else if (Array.isArray(res)) {
      // Fallback for non-paginated response
      products.value = res;
      totalProducts.value = res.length;
      currentPage.value = 1;
      totalPages.value = 1;
    } else {
      throw new Error("Invalid response format from API");
    }
  } catch (err: any) {
    console.error("Failed to fetch products:", err);
    error.value = err.data || err.message || "Failed to load products";
    products.value = [];
    totalProducts.value = 0;
  } finally {
    loading.value = false;
  }
}

// Initial load
onMounted(() => {
  fetchProducts();
});

// No need for debounced API calls since all filtering is now client-side
// All filtering will be handled by the computed filteredProducts property
</script>

<style scoped>
.white-spin::-webkit-inner-spin-button,
.white-spin::-webkit-outer-spin-button {
  -webkit-appearance: none;
  background: white;
  color: #2563eb; /* blue-600 */
  border-radius: 4px;
  border: 1px solid #e5e7eb; /* gray-300 */
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.02);
}
.white-spin[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>
