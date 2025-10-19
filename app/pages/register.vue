<template>
  <div
    class="min-h-screen flex items-center justify-center bg-neutral-50 py-12"
  >
    <div
      class="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-200 p-8"
    >
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
      <UForm :schema="schema" :state="state" @submit.prevent="onSubmit">
        <div class="mb-5">
          <UFormField label="Username" name="username">
            <UInput
              v-model="state.username"
              placeholder="Choose a username"
              class="w-full"
            />
          </UFormField>
        </div>
        <div class="mb-5">
          <UFormField label="Full Name" name="name">
            <UInput
              v-model="state.name"
              placeholder="Your full name"
              class="w-full"
            />
          </UFormField>
        </div>
        <div class="mb-5">
          <UFormField label="Email" name="email">
            <UInput
              v-model="state.email"
              placeholder="you@email.com"
              class="w-full"
            />
          </UFormField>
        </div>
        <div class="mb-5">
          <UFormField label="Phone Number" name="phone_number">
            <UInput
              v-model="state.phone_number"
              placeholder="Your phone number"
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
        <div class="mb-5">
          <UFormField label="Confirm Password" name="confirm_password">
            <UInput
              v-model="state.confirm_password"
              type="password"
              placeholder="Confirm password"
              class="w-full"
            />
          </UFormField>
        </div>
        <div class="mb-2">
          <UButton type="submit" class="w-full justify-center" size="lg">
            Register
          </UButton>
        </div>
      </UForm>
      <div class="mt-6 text-center text-sm text-neutral-500">
        Already have an account?
        <NuxtLink to="/login" class="text-primary font-medium hover:underline"
          >Login</NuxtLink
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import * as yup from "yup";
import { useToast } from "#imports";
import { useAuth } from "../composables/useAuth";

const router = useRouter();

const schema = yup.object({
  username: yup.string().required("Username is required"),
  name: yup.string().required("Full name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone_number: yup.string().required("Phone number is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirm_password: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

const state = ref({
  username: "",
  name: "",
  email: "",
  phone_number: "",
  password: "",
  confirm_password: "",
});

const toast = useToast();

const { register } = useAuth();

function onSubmit({ data }: { data: typeof state.value }) {
  handleRegister(data);
}

async function handleRegister(data: typeof state.value) {
  try {
    const res: any = await register({
      username: data.username,
      password: data.password,
      email: data.email,
      phone_number: data.phone_number,
    });

    if (res.status === "success") {
      toast.add({ title: "Registration successful", color: "success" });
      router.push("/");
    } else {
      toast.add({
        title: "Registration failed",
        description: res.data || (res as any)?.detail || "Registration failed",
        color: "error",
      });
    }
  } catch (e: any) {
    const errorMsg = e?.data?.data || e?.data?.detail || e?.message || "Registration failed";
    toast.add({
      title: "Registration failed",
      description: errorMsg,
      color: "error",
    });
  }
}
</script>
