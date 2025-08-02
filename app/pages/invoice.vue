<template>
  <UContainer
    class="py-12 max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-neutral-200"
  >
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-2">
        <Icon name="i-heroicons-clock" class="h-8 w-8 text-primary" />
        <span class="text-2xl font-bold text-neutral-900">WatchStore</span>
      </div>
      <div class="text-right text-sm text-neutral-500">
        <div>Invoice #INV-20250803</div>
        <div>{{ new Date().toLocaleDateString() }}</div>
      </div>
    </div>
    <div class="mb-8">
      <h2 class="text-lg font-semibold text-neutral-800 mb-2">Billed To:</h2>
      <div class="text-neutral-700">
        John Doe<br />
        johndoe@email.com<br />
        123 Main Street, City, Country
      </div>
    </div>
    <div class="mb-8">
      <h2 class="text-lg font-semibold text-neutral-800 mb-2">Order Summary</h2>
      <table class="w-full text-sm border-collapse">
        <thead>
          <tr class="bg-neutral-100">
            <th class="p-2 text-left font-semibold">Product</th>
            <th class="p-2 text-right font-semibold">Qty</th>
            <th class="p-2 text-right font-semibold">Unit Price</th>
            <th class="p-2 text-right font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="p-2">Omega De Ville Prestige</td>
            <td class="p-2 text-right">1</td>
            <td class="p-2 text-right">$250.00</td>
            <td class="p-2 text-right">$250.00</td>
          </tr>
          <tr>
            <td class="p-2">Apple Watch Series 9</td>
            <td class="p-2 text-right">2</td>
            <td class="p-2 text-right">$350.00</td>
            <td class="p-2 text-right">$700.00</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="border-t border-neutral-200">
            <td colspan="3" class="p-2 text-right font-semibold">Subtotal</td>
            <td class="p-2 text-right">$950.00</td>
          </tr>
          <tr>
            <td colspan="3" class="p-2 text-right font-semibold">Shipping</td>
            <td class="p-2 text-right">$0.00</td>
          </tr>
          <tr>
            <td colspan="3" class="p-2 text-right font-bold text-lg">Total</td>
            <td class="p-2 text-right font-bold text-lg">$950.00</td>
          </tr>
        </tfoot>
      </table>
    </div>
    <div class="flex items-center justify-between mt-10">
      <div class="text-sm text-neutral-500">Thank you for your purchase!</div>
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
        @click.native="clearCart"
      >
        <Icon name="i-heroicons-arrow-left" />
        Back to Store
      </NuxtLink>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
function clearCart() {
  localStorage.removeItem("cart");
}
</script>
