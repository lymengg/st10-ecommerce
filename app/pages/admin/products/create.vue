<template>
  <div class="flex flex-col items-center justify-center min-h-screen py-10">
    <UCard class="w-full max-w-lg">
      <h2 class="text-xl font-bold mb-6 text-neutral-900">Create Product</h2>
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
          <UInput v-model="state.brand" placeholder="Brand" class="w-full" required />
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
            v-model="state.price"
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
            v-model="state.stock"
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
        <div class="mt-6 flex justify-end">
          <UButton type="submit" color="primary">Create Product</UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useToast } from "#imports";
import { useApi } from "../../../composables/useApi";
import { object, string, number } from "yup";
import type { InferType } from "yup";
import type { FormSubmitEvent } from "#ui/types";

definePageMeta({ layout: "admin", middleware: "admin" });

const state = ref({
  name: "",
  brand: "",
  description: "",
  price: 0,
  stock: 0,
  image: "",
});

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

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    await request("/api/products/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: {
        ...event.data,
      },
    });
    toast.add({ title: "Product created successfully", color: "success" });
    navigateTo("/admin/products");
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
