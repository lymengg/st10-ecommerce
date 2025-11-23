<template>
  <div
    class="min-h-screen flex items-center justify-center bg-neutral-50 py-12"
  >
    <div
      class="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-200 p-8"
    >
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
      <UForm :schema="schema" :state="state" @submit.prevent="onSubmit">
        <div class="mb-5">
          <UFormField label="Username" name="username">
            <UInput
              v-model="state.username"
              placeholder="Your username"
              class="w-full"
            />
          </UFormField>
        </div>
        <div class="mb-5">
          <UFormField label="Password" name="password">
            <UInput
              v-model="state.password"
              type="password"
              placeholder="Password"
              class="w-full"
            />
          </UFormField>
        </div>
        <div class="mb-2">
          <UButton type="submit" class="w-full justify-center" size="lg">
            Login
          </UButton>
        </div>
      </UForm>
      <div class="mt-6 text-center text-sm text-neutral-500">
        Don’t have an account?
        <NuxtLink
          to="/register"
          class="text-primary font-medium hover:underline"
          >Register</NuxtLink
        >
      </div>
    </div>
  </div>
</template>

// app/pages/login.vue
<script setup lang="ts">
import { ref } from "vue";
import * as yup from "yup";
import { useToast } from "#imports";
import { useAuth } from "../composables/useAuth";

const router = useRouter();
const route = useRoute();

const schema = yup.object({
  username: yup.string().required("Username is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});

const state = ref({
  username: "",
  password: "",
});

const toast = useToast();

const { login: apiLogin } = useAuth();

async function onSubmit({ data }: { data: typeof state.value }) {
  try {
    console.log("Attempting login with username:", data.username);
    const response = await apiLogin(data.username, data.password);
    console.log("Login successful, response:", response);

    toast.add({ title: "Login successful", color: "success" });

    // Handle return URL after successful login
    const returnUrl = route.query.return as string;
    if (returnUrl) {
      router.push(decodeURIComponent(returnUrl));
    } else {
      router.push("/");
    }
  } catch (e: any) {
    console.error("Login error details:", e);

    // Improved error message extraction
    let errorMsg = "Login failed";

    if (e?.response?.data?.detail) {
      errorMsg = e.response.data.detail;
    } else if (e?.data?.data) {
      errorMsg = e.data.data;
    } else if (e?.data?.error) {
      errorMsg = e.data.error;
    } else if (e?.message) {
      errorMsg = e.message;
    } else if (typeof e === 'string') {
      errorMsg = e;
    } else {
      errorMsg = "An unexpected error occurred during login";
    }

    toast.add({
      title: "Login failed",
      description: errorMsg,
      color: "error",
      timeout: 5000, // 5 seconds timeout
    });
  }
}
</script>
<style scoped></style>
