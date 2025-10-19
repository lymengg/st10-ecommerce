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
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-neutral-200">
          <thead class="bg-neutral-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Image</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Name</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Brand</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Price</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Stock</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-200 bg-white">
            <tr v-for="p in products" :key="p.id">
              <td class="px-4 py-3">
                <img :src="p.image" :alt="p.name" class="h-12 w-12 object-cover rounded" />
              </td>
              <td class="px-4 py-3 font-medium text-neutral-900">{{ p.name }}</td>
              <td class="px-4 py-3 text-neutral-700">{{ p.brand }}</td>
              <td class="px-4 py-3 text-neutral-900 font-semibold">${{ p.price }}</td>
              <td class="px-4 py-3 text-neutral-700">{{ p.stock ?? '-' }}</td>
              <td class="px-4 py-3">
                <div class="flex gap-2 justify-end">
                  <UButton size="xs" variant="soft" color="neutral" :to="`/admin/products/${p.id}/edit`">
                    <template #leading>
                      <Icon name="i-heroicons-pencil-square" />
                    </template>
                    Edit
                  </UButton>
                  <UButton size="xs" color="red" variant="soft" :loading="deletingId === p.id" @click="confirmDelete(p)">
                    <template #leading>
                      <Icon name="i-heroicons-trash" />
                    </template>
                    Delete
                  </UButton>
                </div>
              </td>
            </tr>
            <tr v-if="!loading && products.length === 0">
              <td colspan="6" class="px-4 py-10 text-center text-neutral-600">
                No products found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="loading" class="py-10 text-center text-neutral-600">Loading...</div>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from '#imports'
import { useApi } from '../../../composables/useApi'

definePageMeta({ middleware: 'admin' })

const products = ref<any[]>([])
const loading = ref(false)
const deletingId = ref<number | null>(null)
const toast = useToast()
const { request } = useApi()

async function fetchProducts() {
  loading.value = true
  try {
    const res: any = await request('/api/products/', { method: 'GET' })
    if (res?.status === 'success' && Array.isArray(res.data)) {
      products.value = res.data
    } else if (Array.isArray(res)) {
      products.value = res as any
    } else if (Array.isArray((res as any)?.results)) {
      products.value = (res as any).results
    }
  } catch (e: any) {
    toast.add({ title: 'Failed to load products', description: e?.data || e?.message || 'Error', color: 'error' })
  } finally {
    loading.value = false
  }
}

function confirmDelete(p: any) {
  if (confirm(`Delete ${p.name}? This cannot be undone.`)) {
    deleteProduct(p.id)
  }
}

async function deleteProduct(id: number) {
  try {
    deletingId.value = id
    await request(`/api/products/${id}`, { method: 'DELETE' })
    products.value = products.value.filter((x) => x.id !== id)
    toast.add({ title: 'Product deleted', color: 'success' })
  } catch (e: any) {
    toast.add({ title: 'Failed to delete', description: e?.data || e?.message || 'Error', color: 'error' })
  } finally {
    deletingId.value = null
  }
}

onMounted(fetchProducts)
</script>
