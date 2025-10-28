<template>
  <div class="flex flex-col items-center justify-center min-h-screen py-10">
    <UCard class="w-full max-w-lg">
      <h2 class="text-xl font-bold mb-6 text-neutral-900">Edit Product</h2>
      <UForm :state="state" :schema="schema" @submit="onSubmit">
        <UFormField label="Name" name="name">
          <UInput
            v-model="state.name"
            placeholder="Product name"
            class="w-full"
            required
          />
        </UFormField>
        <UFormField label="Brand" name="brand" class="mt-4">
          <UInput
            v-model="state.brand"
            placeholder="Brand"
            class="w-full"
            required
          />
        </UFormField>
        <UFormField label="Description" name="description" class="mt-4">
          <UTextarea
            v-model="state.description"
            placeholder="Description (min 10 characters)"
            class="w-full"
            required
          />
        </UFormField>
        <UFormField label="Price" name="price" class="mt-4">
          <UInput
            v-model.number="state.price"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Price"
            class="w-full"
            required
          />
        </UFormField>
        <UFormField label="Stock" name="stock" class="mt-4">
          <UInput
            v-model.number="state.stock"
            type="number"
            min="0"
            step="1"
            placeholder="Stock"
            class="w-full"
            required
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
        <div class="mt-6 flex justify-end gap-2">
          <UButton variant="soft" to="/admin/products" color="neutral"
            >Cancel</UButton
          >
          <UButton type="submit" color="primary" :loading="saving"
            >Save Changes</UButton
          >
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useToast } from "#imports";
import { useApi } from "../../../../composables/useApi";
import { object, string, number } from "yup";
import type { InferType } from "yup";
import type { FormSubmitEvent } from "#ui/types";

definePageMeta({ layout: "admin", middleware: "admin" });

const route = useRoute();
const id = Number(route.params.id);
const saving = ref(false);
const state = ref<any>({
  name: "",
  brand: "",
  description: "",
  price: 0,
  stock: 0,
  image: "",
});
const { request } = useApi();
const toast = useToast();

const schema = object({
  name: string().trim().required("Name is required"),
  brand: string().trim().required("Brand is required"),
  description: string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .required("Description is required"),
  price: number()
    .transform((val, orig) => (typeof orig === "string" ? Number(orig) : val))
    .typeError("Price must be a number")
    .moreThan(0, "Price must be greater than 0")
    .required("Price is required"),
  stock: number()
    .transform((val, orig) => (typeof orig === "string" ? Number(orig) : val))
    .typeError("Stock must be a number")
    .integer("Stock must be an integer")
    .min(0, "Stock cannot be negative")
    .required("Stock is required"),
  image: string().nullable().notRequired(),
});

type Schema = InferType<typeof schema>;

function onFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    state.value.image = e.target?.result as string;
  };
  reader.readAsDataURL(file);
}

async function load() {
  try {
    const res: any = await request(`/api/products/${id}`, { method: "GET" });
    const p = res?.data || res;
    if (p) state.value = { ...state.value, ...p };
  } catch (e: any) {
    toast.add({
      title: "Failed to load product",
      description: e?.data || e?.message || "Error",
      color: "error",
    });
  }
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    saving.value = true;
    await request(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: { ...event.data },
    });
    toast.add({ title: "Product updated", color: "success" });
    navigateTo("/admin/products");
  } catch (e: any) {
    toast.add({
      title: "Failed to update product",
      description: e?.data || e?.message || "Error",
      color: "error",
    });
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>
