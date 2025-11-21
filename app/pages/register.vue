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
          name="i-heroicons-user-plus"
          class="mx-auto h-10 w-10 text-primary mb-3"
        />
        <h1 class="text-2xl font-bold text-neutral-900 mb-1">Create Account</h1>
        <p class="text-neutral-500 text-sm">
          Join us and start shopping today!
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
            placeholder="Choose a username"
            :disabled="isSubmitting"
            class="w-full"
            size="lg"
          />
        </UFormField>

        <UFormField label="Full Name" name="name">
          <UInput
            v-model="formState.name"
            placeholder="Your full name"
            :disabled="isSubmitting"
            class="w-full"
            size="lg"
          />
        </UFormField>

        <UFormField label="Email" name="email">
          <UInput
            v-model="formState.email"
            placeholder="you@email.com"
            :disabled="isSubmitting"
            class="w-full"
            size="lg"
          />
        </UFormField>

        <UFormField label="Phone Number" name="phone_number">
          <UInput
            v-model="formState.phone_number"
            placeholder="Your phone number"
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

        <UFormField label="Confirm Password" name="confirm_password">
          <UInput
            v-model="formState.confirm_password"
            type="password"
            placeholder="Confirm password"
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
            Register
          </UButton>
        </div>
      </UForm>

      <!-- Footer Link -->
      <div class="mt-6 text-center text-sm text-neutral-500">
        Already have an account?
        <NuxtLink
          to="/login"
          class="text-primary font-medium hover:underline ml-1"
        >
          Login
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
  REGISTER_SUCCESS_MESSAGE,
  DEFAULT_ERROR_MESSAGE,
} from "~/constants/messages";

// Page metadata
definePageMeta({
  title: "Register - WatchStore",
  description: "Create your WatchStore account",
});

// Composables
const router = useRouter();
const toast = useToast();
const { register } = useAuth();

// Validation schema
const schema = yup.object({
  username: yup
    .string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters"),
  name: yup
    .string()
    .required("Full name is required")
    .min(2, "Name must be at least 2 characters"),
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  phone_number: yup
    .string()
    .required("Phone number is required")
    .matches(/^[+]?[\d\s\-\(\)]+$/, "Please enter a valid phone number"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
  confirm_password: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords must match"),
});

// Form state
const formState = ref({
  username: "",
  name: "",
  email: "",
  phone_number: "",
  password: "",
  confirm_password: "",
});

// Loading state
const isSubmitting = ref(false);

// Handle form submission
async function handleSubmit({ data }: { data: typeof formState.value }) {
  if (isSubmitting.value) return;

  isSubmitting.value = true;

  const response = await register({
    username: data.username,
    password: data.password,
    email: data.email,
    phone_number: data.phone_number,
  });

  isSubmitting.value = false;

  if (response.code !== 201) {
    toast.add({
      title: "Registration failed",
      description: response.message || DEFAULT_ERROR_MESSAGE,
      color: "error",
    });
    return;
  }

  toast.add({
    title: "Registration successful",
    description: REGISTER_SUCCESS_MESSAGE,
    color: "success",
  });

  await router.push("/login");
}
</script>
