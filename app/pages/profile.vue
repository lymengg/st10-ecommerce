<template>
  <div class="max-w-3xl mx-auto py-10 space-y-8">
    <UCard class="p-0">
      <div class="flex flex-col items-center gap-3 p-6">
        <Icon name="i-heroicons-user-circle" class="h-20 w-20 text-primary" />
        <h2 class="text-2xl font-bold text-neutral-900">{{ user.username }}</h2>
        <div class="text-neutral-500 mt-1">{{ user.email }}</div>
        <div class="text-neutral-500">{{ user.phone_number }}</div>
        <UButton
          @click="editProfile"
          class="mt-4"
          size="sm"
          color="primary"
          variant="solid"
        >
          Edit Profile
        </UButton>
      </div>
    </UCard>

    <!-- Order History -->
    <UCard>
      <h3 class="text-lg font-semibold text-neutral-900 mb-4">Order History</h3>
      <div v-if="orders.length" class="space-y-4">
        <div
          v-for="order in orders"
          :key="order.id"
          class="flex flex-col md:flex-row md:items-center justify-between bg-neutral-50 p-4 rounded border border-neutral-200"
        >
          <div>
            <div class="font-semibold text-neutral-900">
              Order #{{ order.id }}
            </div>
            <div class="text-neutral-500 text-sm">Date: {{ order.date }}</div>
            <div class="text-neutral-500 text-sm">
              Status: {{ order.status }}
            </div>
            <div class="text-neutral-900 font-bold mt-1">
              Total: {{ order.total }}
            </div>
          </div>
          <div class="mt-3 md:mt-0">
            <UButton
              size="sm"
              color="primary"
              variant="outline"
              @click="viewOrder(order.id)"
            >
              View Details
            </UButton>
          </div>
        </div>
      </div>
      <div v-else class="text-neutral-400 text-center py-8">
        <Icon name="i-heroicons-archive-box" class="inline h-8 w-8 mb-2" />
        <div>No orders yet.</div>
      </div>
    </UCard>

    <!-- Addresses -->
    <UCard>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-neutral-900">Addresses</h3>
        <UButton @click="addAddress" size="sm" color="primary" variant="solid">
          Add Address
        </UButton>
      </div>
      <div v-if="addresses.length" class="grid gap-4 md:grid-cols-2">
        <div
          v-for="address in addresses"
          :key="address.id"
          class="bg-neutral-50 p-4 rounded border border-neutral-200 flex flex-col gap-2"
        >
          <div class="text-neutral-900 font-medium">
            {{ address.line1 }}, {{ address.city }}, {{ address.zip }}
          </div>
          <div class="flex gap-2 mt-2">
            <UButton
              @click="editAddress(address)"
              size="xs"
              color="primary"
              variant="outline"
            >
              Edit
            </UButton>
            <UButton
              @click="deleteAddress(address.id)"
              size="xs"
              color="red"
              variant="outline"
            >
              Delete
            </UButton>
          </div>
        </div>
      </div>
      <div v-else class="text-neutral-400 text-center py-6">
        <Icon name="i-heroicons-map-pin" class="inline h-7 w-7 mb-1" />
        <div>No addresses saved.</div>
      </div>
    </UCard>

    <!-- Account Actions -->
    <UCard class="flex flex-wrap gap-3 justify-end p-4">
      <UButton @click="changePassword" variant="outline" color="primary">
        Change Password
      </UButton>
      <UButton @click="logout" color="red" variant="outline"> Logout </UButton>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAuth } from "../composables/useAuth";

const { logout } = useAuth();

const user = ref({
  username: "",
  email: "",
  phone_number: "",
});

async function fetchProfile() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return; // Optionally redirect to login
    const res = await $fetch("http://localhost:8000/api/auth/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.status === "success") {
      user.value = res.data;
    }
  } catch (e) {
    // Optionally handle error (e.g., logout, redirect)
  }
}

// Example orders and addresses, replace with real API data
const orders = ref([
  { id: 1, date: "2025-09-01", status: "Delivered", total: "$199.99" },
  { id: 2, date: "2025-08-15", status: "Shipped", total: "$89.50" },
]);
const orderColumns = [
  { id: "id", key: "id", label: "Order ID" },
  { id: "date", key: "date", label: "Date" },
  { id: "status", key: "status", label: "Status" },
  { id: "total", key: "total", label: "Total" },
];

const addresses = ref([
  { id: 1, line1: "123 Main St", city: "Metropolis", zip: "12345" },
]);

function editProfile() {
  /* open edit profile modal */
}
function addAddress() {
  /* open add address modal */
}
function editAddress(address: any) {
  /* open edit address modal */
}
function deleteAddress(id: number) {
  /* delete address */
}
function changePassword() {
  /* open change password modal */
}
function viewAllOrders() {
  /* navigate to full order history page */
}

onMounted(() => {
  fetchProfile();
});
</script>
