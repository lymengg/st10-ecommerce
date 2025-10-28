<template>
  <UContainer class="py-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-neutral-900">Products</h1>
      <UButton to="/admin/products/create" color="primary">
        <template #leading>
          <Icon name="i-heroicons-plus" />
        </template>
        Create Product
      </UButton>
    </div>

    <UCard>
      <UTable
        :data="products"
        :columns="columns"
        :loading="loading"
        empty="No products found."
      >
        <template #image-cell="{ row }">
          <img
            :src="row.original.image"
            :alt="row.original.name"
            class="h-12 w-12 object-cover rounded"
          />
        </template>
        <template #name-cell="{ row }">
          <span class="font-medium text-neutral-900">{{
            row.original.name
          }}</span>
        </template>
        <template #brand-cell="{ row }">
          <span class="text-neutral-700">{{ row.original.brand }}</span>
        </template>
        <template #price-cell="{ row }">
          <span class="text-neutral-900 font-semibold"
            >${{ row.original.price }}</span
          >
        </template>
        <template #stock-cell="{ row }">
          <span class="text-neutral-700">{{ row.original.stock ?? "-" }}</span>
        </template>
        <template #actions-cell="{ row }">
          <div class="flex gap-2 justify-end">
            <UButton
              size="xs"
              variant="soft"
              color="neutral"
              :to="`/admin/products/${row.original.id}/edit`"
            >
              <template #leading>
                <Icon name="i-heroicons-pencil-square" />
              </template>
              Edit
            </UButton>
            <UButton
              size="xs"
              color="error"
              variant="soft"
              :loading="deletingId === row.original.id"
              @click="confirmDelete(row.original)"
            >
              <template #leading>
                <Icon name="i-heroicons-trash" />
              </template>
              Delete
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
        @update:page="fetchProducts"
      />
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useToast } from "#imports";
import { useApi } from "../../../composables/useApi";

definePageMeta({ layout: "admin", middleware: "admin" });

const products = ref<any[]>([]);
const loading = ref(false);
const deletingId = ref<number | null>(null);
const toast = useToast();
const { request } = useApi();

// Server-side pagination
const page = ref(1);
const limit = ref(10);
const total = ref(0);

const columns = [
  { accessorKey: "image", header: "Image" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "brand", header: "Brand" },
  { accessorKey: "price", header: "Price" },
  { accessorKey: "stock", header: "Stock" },
  {
    id: "actions",
    header: "Actions",
    meta: { class: { th: "text-right", td: "text-right" } },
  },
];

async function fetchProducts() {
  loading.value = true;
  try {
    const skip = (page.value - 1) * limit.value;
    const url = `/api/products/?skip=${skip}&limit=${limit.value}`;
    const res: any = await request(url, { method: "GET" });

    // Handle PaginatedProducts response structure
    if (res?.items && Array.isArray(res.items)) {
      products.value = res.items;
      total.value = res.total || 0;
    } else if (
      res?.status === "success" &&
      res.data?.items &&
      Array.isArray(res.data.items)
    ) {
      products.value = res.data.items;
      total.value = res.data.total || 0;
    } else if (Array.isArray(res)) {
      products.value = res;
      total.value = res.length;
    } else {
      products.value = [];
      total.value = 0;
    }
  } catch (e: any) {
    toast.add({
      title: "Failed to load products",
      description: e?.data || e?.message || "Error",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}

function confirmDelete(p: any) {
  if (confirm(`Delete ${p.name}? This cannot be undone.`)) {
    deleteProduct(p.id);
  }
}

async function deleteProduct(id: number) {
  try {
    deletingId.value = id;
    await request(`/api/products/${id}`, { method: "DELETE" });
    products.value = products.value.filter((x) => x.id !== id);
    toast.add({ title: "Product deleted", color: "success" });
  } catch (e: any) {
    toast.add({
      title: "Failed to delete",
      description: e?.data || e?.message || "Error",
      color: "error",
    });
  } finally {
    deletingId.value = null;
  }
}

onMounted(fetchProducts);
</script>
