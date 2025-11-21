<template>
  <div class="space-y-6">
    <!-- Form Header -->
    <div class="text-center">
      <Icon
        :name="headerIcon"
        class="mx-auto h-10 w-10 text-primary mb-3"
      />
      <h1 class="text-2xl font-bold text-neutral-900 mb-1">
        {{ title }}
      </h1>
      <p class="text-neutral-500 text-sm">
        {{ subtitle }}
      </p>
    </div>

    <!-- Form -->
    <UForm
      :schema="schema"
      :state="formData"
      @submit="handleSubmit"
      class="space-y-5"
    >
      <UFormField
        v-for="field in fields"
        :key="field.name"
        :label="field.label"
        :name="field.name"
      >
        <UInput
          v-model="formData[field.name as keyof typeof formData]"
          :type="field.type"
          :placeholder="field.placeholder"
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
          {{ submitButtonText }}
        </UButton>
      </div>
    </UForm>

    <!-- Footer Link -->
    <div class="text-center text-sm text-neutral-500">
      {{ footerText }}
      <NuxtLink
        :to="footerLink"
        class="text-primary font-medium hover:underline ml-1"
      >
        {{ footerLinkText }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ObjectSchema } from 'yup'

interface FormField {
  name: string
  label: string
  type: string
  placeholder: string
}

interface Props {
  schema: ObjectSchema<any>
  formData: Record<string, any>
  fields: FormField[]
  title: string
  subtitle: string
  submitButtonText: string
  headerIcon: string
  footerText: string
  footerLink: string
  footerLinkText: string
  isSubmitting: boolean
}

interface Emits {
  (e: 'submit', data: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

function handleSubmit({ data }: { data: any }) {
  emit('submit', data)
}
</script>