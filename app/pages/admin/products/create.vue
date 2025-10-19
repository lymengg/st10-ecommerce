<template>
  <div class="flex flex-col items-center justify-center min-h-screen py-10">
    <UCard class="w-full max-w-lg">
      <h2 class="text-xl font-bold mb-6 text-neutral-900">Create Product</h2>
      <UForm :state="state" @submit.prevent="onSubmit">
        <UFormField label="Name" name="name">
          <UInput
            v-model="state.name"
            placeholder="Product name"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Brand" name="brand" class="mt-4">
          <UInput v-model="state.brand" placeholder="Brand" class="w-full" />
        </UFormField>
        <UFormField label="Description" name="description" class="mt-4">
          <UTextarea
            v-model="state.description"
            placeholder="Description"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Price" name="price" class="mt-4">
          <UInput
            v-model="state.price"
            type="number"
            placeholder="Price"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Stock" name="stock" class="mt-4">
          <UInput
            v-model="state.stock"
            type="number"
            placeholder="Stock"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Image" name="image" class="mt-4">
          <input
            type="file"
            accept="image/*"
            @change="onFileChange"
            class="w-full border border-neutral-300 rounded px-3 py-2 bg-white"
          />
          <div v-if="state.image" class="mt-2">
            <img
              :src="state.image"
              alt="Preview"
              class="max-h-32 rounded shadow"
            />
          </div>
        </UFormField>
        <div class="mt-6 flex justify-end">
          <UButton type="submit" color="primary">Create Product</UButton>
        </div>
        <div v-if="created" class="mt-4 flex justify-end">
          <UButton to="/admin/products" variant="soft" color="neutral">
            Go to Product List
          </UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useToast } from "#imports";
import { useApi } from "../../../composables/useApi";

definePageMeta({ middleware: "admin" });

const state = ref({
  name: "",
  brand: "",
  description: "",
  price: 0,
  stock: 0,
  image: "",
});
const created = ref(false);

const { request } = useApi();
const toast = useToast();

function onFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    state.value.image = e.target?.result as string;
  };
  reader.readAsDataURL(file);
}

async function onSubmit() {
  try {
    await request("/api/products/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: {
        ...state.value,
      },
    });
    toast.add({ title: "Product created successfully", color: "success" });
    created.value = true;
  } catch (e: any) {
    toast.add({
      title: "Failed to create product",
      description:
        e?.data?.data || e?.data || e?.message || JSON.stringify(e) || "Error",
      color: "error",
    });
  }
}
</script>
