<template>
  <div
    class="min-h-screen flex items-center justify-center bg-neutral-50 py-12"
  >
    <div
      class="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-200 p-8"
    >
      <!-- Header -->
      <div class="mb-8 text-center">
        <Icon
          name="i-heroicons-arrow-right-on-rectangle"
          class="mx-auto h-10 w-10 text-primary mb-3"
        />
        <h1 class="text-2xl font-bold text-neutral-900 mb-1">Welcome Back</h1>
        <p class="text-neutral-500 text-sm">
          Login to your account to continue shopping
        </p>
      </div>

      <!-- Form -->
      <UForm
        :schema="schema"
        :state="formState"
        @submit="handleSubmit"
        class="space-y-5"
      >
        <UFormField label="Username" name="username">
          <UInput
            v-model="formState.username"
            placeholder="Your username"
            :disabled="isSubmitting"
            class="w-full"
            size="lg"
          />
        </UFormField>

        <UFormField label="Password" name="password">
          <UInput
            v-model="formState.password"
            type="password"
            placeholder="Password"
            :disabled="isSubmitting"
            class="w-full"
            size="lg"
          />
        </UFormField>

        <div class="pt-2">
          <UButton
            type="submit"
            :loading="isSubmitting"
            :disabled="isSubmitting"
            class="w-full justify-center"
            size="lg"
          >
            Login
          </UButton>
        </div>
      </UForm>

      <!-- Footer Link -->
      <div class="mt-6 text-center text-sm text-neutral-500">
        Don't have an account?
        <NuxtLink
          to="/register"
          class="text-primary font-medium hover:underline ml-1"
        >
          Register
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import * as yup from "yup";
import { useToast } from "#imports";
import { useAuth } from "~/composables/useAuth";
import {
  DEFAULT_ERROR_MESSAGE,
  LOGIN_SUCCESS_MESSAGE,
} from "~/constants/messages";

// Page metadata
definePageMeta({
  title: "Login - WatchStore",
  description: "Login to your WatchStore account",
});

// Composables
const router = useRouter();
const toast = useToast();
const { login } = useAuth();

// Validation schema
const schema = yup.object({
  username: yup
    .string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
});

// Form state
const formState = ref({
  username: "",
  password: "",
});

// Loading state
const isSubmitting = ref(false);

// Handle form submission
async function handleSubmit({ data }: { data: typeof formState.value }) {
  if (isSubmitting.value) return;

  isSubmitting.value = true;

  const response = await login(data.username, data.password);

  if (response.code !== 200) {
    toast.add({
      title: "Login failed",
      description: response.message || DEFAULT_ERROR_MESSAGE,
      color: "error",
    });
    return;
  }

  toast.add({
    title: "Login successful",
    description: LOGIN_SUCCESS_MESSAGE,
    color: "success",
  });

  await router.push("/");
}
</script>
