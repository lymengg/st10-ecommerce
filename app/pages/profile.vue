<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-lg">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <UAvatar :alt="resData.username" size="xl">
                {{ (resData.username || "?").slice(0, 1).toUpperCase() }}
              </UAvatar>
              <div>
                <p class="text-xl font-semibold">
                  {{ resData.username || "—" }}
                </p>
                <p class="text-sm text-gray-500">{{ resData.email || "—" }}</p>
              </div>
            </div>
            <!-- <UBadge :color="statusColor">{{ res.status || '—' }}</UBadge> -->
          </div>
        </template>

        <div class="grid gap-3">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-500">Username</span>
            <span class="font-medium">{{ resData.username || "—" }}</span>
          </div>
          <UDivider />
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-500">Email</span>
            <span class="font-medium">{{ resData.email || "—" }}</span>
          </div>
          <UDivider />
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-500">Phone</span>
            <span class="font-medium">{{ resData.phone_number || "—" }}</span>
          </div>
          <UDivider />
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-500">Role</span>
            <span class="font-medium">
              <UBadge variant="soft">{{ resData.role || "—" }}</UBadge>
            </span>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-between items-center">
            <p class="text-xs text-gray-500">Profile data from API response.</p>
            <UButton
              @click="isChangePasswordOpen = true"
              variant="outline"
              size="sm"
            >
              Change Password
            </UButton>
          </div>
        </template>
      </UCard>
    </div>
  </div>

  <UModal :open="isChangePasswordOpen" @close="isChangePasswordOpen = false">
    <template #content>
      <div class="p-6">
        <h2 class="text-lg font-semibold mb-4">Change Password</h2>
        <UForm
          :schema="changePasswordSchema"
          :state="changePasswordState"
          @submit.prevent="onChangePasswordSubmit"
        >
          <div class="space-y-4">
            <UFormField label="Current Password" name="current_password">
              <UInput
                v-model="changePasswordState.current_password"
                type="password"
                placeholder="Enter current password"
                class="w-full"
              />
            </UFormField>
            <UFormField label="New Password" name="new_password">
              <UInput
                v-model="changePasswordState.new_password"
                type="password"
                placeholder="Enter new password"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Confirm New Password" name="confirm_password">
              <UInput
                v-model="changePasswordState.confirm_password"
                type="password"
                placeholder="Confirm new password"
                class="w-full"
              />
            </UFormField>
          </div>
          <div class="flex justify-end space-x-2 mt-6">
            <UButton variant="outline" @click="isChangePasswordOpen = false">
              Cancel
            </UButton>
            <UButton type="submit"> Change Password </UButton>
          </div>
        </UForm>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import * as yup from "yup";
import { useToast } from "#imports";
import { useAuth } from "../composables/useAuth";

const auth = useAuth();
const toast = useToast();

// Modal state
const isChangePasswordOpen = ref(false);

// Form state
const changePasswordState = ref({
  current_password: "",
  new_password: "",
  confirm_password: "",
});

// Form schema
const changePasswordSchema = yup.object({
  current_password: yup.string().required("Current password is required"),
  new_password: yup
    .string()
    .min(8, "New password must be at least 8 characters")
    .required("New password is required"),
  confirm_password: yup
    .string()
    .oneOf([yup.ref("new_password")], "Passwords must match")
    .required("Please confirm your new password"),
});

// Submit handler
async function onChangePasswordSubmit({
  data,
}: {
  data: typeof changePasswordState.value;
}) {
  try {
    await auth.changePassword(data.current_password, data.new_password);
    toast.add({ title: "Password changed successfully", color: "success" });
    isChangePasswordOpen.value = false;
    // Reset form
    changePasswordState.value = {
      current_password: "",
      new_password: "",
      confirm_password: "",
    };
  } catch (e: any) {
    console.log(e.data);
    toast.add({
      title: "Failed to change password",
      description: e.data.message,
      color: "error",
    });
  }
}

// Seed with provided response; overwritten by live API if available
const res = ref<any>({
  status: "success",
  data: {
    username: "admin",
    email: "admin@gmail.com",
    phone_number: "010732112",
    role: "admin",
  },
});

const resData = computed(() => res.value?.data || {});
const statusColor = computed(() =>
  res.value?.status === "success" ? "green" : "red"
);

onMounted(async () => {
  try {
    const r: any = await auth.profile();
    if (r && r.status) res.value = r;
  } catch {
    // keep seeded response if API fails
  }
});
</script>
