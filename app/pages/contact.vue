<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50">
    <UContainer class="py-16">
      <!-- Header Section -->
      <div class="text-center mb-16">
        <div class="inline-flex items-center gap-3 bg-primary-100 px-6 py-3 rounded-full mb-6">
          <Icon name="i-heroicons-phone" class="w-6 h-6 text-primary-600" />
          <span class="text-primary-700 font-semibold">We're Here to Help</span>
        </div>
        <h1 class="text-5xl font-bold text-neutral-900 mb-6">
          Contact Us
        </h1>
        <p class="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
          Have questions about our luxury watches? Our expert team is ready to assist you.
          Call us directly for immediate assistance with your timepiece inquiries.
        </p>
      </div>

      <!-- Main Contact Information -->
      <div class="max-w-4xl mx-auto mb-16">
        <!-- Primary Phone Contact Card -->
        <UCard class="overflow-hidden border-2 border-primary-300 shadow-2xl mb-12 bg-gradient-to-br from-primary-50 to-white">
          <div class="grid md:grid-cols-2 items-center">
            <!-- Left Side - Phone Information -->
            <div class="p-8 md:p-12">
              <div class="flex items-center gap-4 mb-6">
                <div class="p-4 bg-primary-100 rounded-full">
                  <Icon name="i-heroicons-device-phone-mobile" class="w-8 h-8 text-primary-600" />
                </div>
                <div>
                  <h2 class="text-2xl font-bold text-neutral-900 mb-1">Call Us Directly</h2>
                  <p class="text-neutral-600">Fast response from our watch experts</p>
                </div>
              </div>

              <div class="space-y-4 mb-8">
                <div class="flex items-center gap-3">
                  <div class="p-3 bg-green-100 rounded-lg">
                    <Icon name="i-heroicons-phone" class="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p class="text-3xl font-bold text-neutral-900 mb-1">{{ contactInfo.phone }}</p>
                    <p class="text-sm text-neutral-600">Main Customer Service Line</p>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <div class="p-3 bg-blue-100 rounded-lg">
                    <Icon name="i-heroicons-clock" class="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p class="font-semibold text-neutral-900">Available 24/7</p>
                    <p class="text-sm text-neutral-600">Emergency support always available</p>
                  </div>
                </div>
              </div>

              <!-- Quick Call Button -->
              <UButton
                size="xl"
                color="primary"
                variant="solid"
                class="w-full py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                @click="makePhoneCall"
              >
                <Icon name="i-heroicons-phone" class="mr-3" />
                Call Now
              </UButton>
            </div>

            <!-- Right Side - Visual -->
            <div class="hidden md:flex items-center justify-center p-8 bg-gradient-to-br from-primary-100 to-blue-100">
              <div class="text-center">
                <div class="p-8 bg-white rounded-full shadow-xl mb-4">
                  <Icon name="i-heroicons-sparkles" class="w-16 h-16 text-primary-500" />
                </div>
                <p class="text-primary-700 font-semibold">Premium Support</p>
                <p class="text-sm text-primary-600">Luxury Watch Experts</p>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Additional Contact Methods -->
        <div class="grid md:grid-cols-3 gap-6 mb-12">
          <!-- WhatsApp -->
          <UCard class="border-2 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <div class="p-6 text-center">
              <div class="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Icon name="i-simple-icons-whatsapp" class="w-8 h-8 text-green-600" />
              </div>
              <h3 class="text-lg font-semibold text-neutral-900 mb-2">WhatsApp</h3>
              <p class="text-sm text-neutral-600 mb-4">Chat with us on WhatsApp</p>
              <UButton
                color="green"
                variant="outline"
                size="sm"
                class="w-full"
                @click="openWhatsApp"
              >
                <Icon name="i-simple-icons-whatsapp" class="mr-2" />
                Chat Now
              </UButton>
            </div>
          </UCard>

          <!-- Email -->
          <UCard class="border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <div class="p-6 text-center">
              <div class="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Icon name="i-heroicons-envelope" class="w-8 h-8 text-blue-600" />
              </div>
              <h3 class="text-lg font-semibold text-neutral-900 mb-2">Email Support</h3>
              <p class="text-sm text-neutral-600 mb-4">{{ contactInfo.email }}</p>
              <UButton
                color="blue"
                variant="outline"
                size="sm"
                class="w-full"
                @click="sendEmail"
              >
                <Icon name="i-heroicons-envelope" class="mr-2" />
                Send Email
              </UButton>
            </div>
          </UCard>

          <!-- Live Chat -->
          <UCard class="border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <div class="p-6 text-center">
              <div class="p-4 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Icon name="i-heroicons-chat-bubble-left-right" class="w-8 h-8 text-purple-600" />
              </div>
              <h3 class="text-lg font-semibold text-neutral-900 mb-2">Live Chat</h3>
              <p class="text-sm text-neutral-600 mb-4">Chat with our experts</p>
              <UButton
                color="purple"
                variant="outline"
                size="sm"
                class="w-full"
                @click="startLiveChat"
              >
                <Icon name="i-heroicons-chat-bubble-left-right" class="mr-2" />
                Start Chat
              </UButton>
            </div>
          </UCard>
        </div>
      </div>

      <!-- Services Section -->
      <div class="mb-16">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-neutral-900 mb-4">How We Can Help You</h2>
          <p class="text-lg text-neutral-600">Expert assistance for all your watch needs</p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <UCard
            v-for="service in services"
            :key="service.id"
            class="text-center hover:border-primary-300 transition-colors"
          >
            <div class="p-6">
              <div
                :class="`p-4 bg-${service.color}-100 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center`"
              >
                <Icon :name="service.icon" :class="`w-6 h-6 text-${service.color}-600`" />
              </div>
              <h3 class="font-semibold text-neutral-900 mb-2">{{ service.title }}</h3>
              <p class="text-sm text-neutral-600">{{ service.description }}</p>
            </div>
          </UCard>
        </div>
      </div>

      <!-- Emergency Contact -->
      <UCard class="border-2 border-red-200 bg-red-50">
        <template #header>
          <div class="flex items-center gap-3 p-6 bg-red-100 border-b border-red-200">
            <div class="p-3 bg-red-200 rounded-full">
              <Icon name="i-heroicons-exclamation-triangle" class="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 class="text-xl font-bold text-red-900">Emergency Support</h2>
              <p class="text-sm text-red-700">For urgent matters, we're available 24/7</p>
            </div>
          </div>
        </template>

        <div class="p-6">
          <div class="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <p class="text-red-900 font-semibold mb-2">Emergency Hotline:</p>
              <p class="text-2xl font-bold text-red-900 mb-4">{{ contactInfo.emergencyPhone }}</p>
              <p class="text-sm text-red-700">
                Available 24/7 for urgent watch emergencies, lost watches, or critical timepiece issues.
              </p>
            </div>
            <div class="text-center">
              <UButton
                color="red"
                size="lg"
                variant="solid"
                class="py-3 px-8"
                @click="makeEmergencyCall"
              >
                <Icon name="i-heroicons-phone" class="mr-2" />
                Call Emergency Line
              </UButton>
            </div>
          </div>
        </div>
      </UCard>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
// Use the contact composable
const {
  contactInfo,
  services,
  isCurrentlyOpen,
  businessStatus,
  makePhoneCall,
  makeEmergencyCall,
  openWhatsApp,
  sendEmail,
  startLiveChat
} = useContact()

// Page Metadata
definePageMeta({
  title: 'Contact Us - WatchStore',
  description: 'Call WatchStore directly for immediate assistance with luxury watches. Expert customer service available 24/7.',
  layout: 'default'
})

// SEO
useSeoMeta({
  title: 'Contact WatchStore - Call Us for Premium Watch Support | 24/7 Service',
  description: `Call WatchStore at ${contactInfo.phone} for expert assistance with luxury watches. 24/7 customer support for all your timepiece needs.`,
  ogTitle: 'Contact WatchStore - Premium Watch Support Available 24/7',
  ogDescription: 'Get immediate assistance with luxury watches. Call our expert team for watch purchases, repairs, and customer service.',
  ogImage: '/og-image-contact.jpg',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Contact WatchStore - Premium Watch Support',
  twitterDescription: `Call us at ${contactInfo.phone} for expert luxury watch assistance. Available 24/7.`,
  keywords: 'luxury watches contact, watch customer service, watch store phone, watch repair service, luxury watch support'
})

// Schema.org structured data
useHead({
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "WatchStore",
        "telephone": contactInfo.phone,
        "telephone": contactInfo.emergencyPhone,
        "email": contactInfo.email,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "123 Luxury Lane",
          "addressLocality": "New York",
          "addressRegion": "NY",
          "postalCode": "10001",
          "addressCountry": "US"
        },
        "openingHours": "24/7",
        "description": "Premium luxury watch retailer with expert customer service and support available 24/7.",
        "url": "https://st10-ecommerce.pages.dev/contact"
      })
    }
  ]
})
</script>