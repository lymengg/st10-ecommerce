import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '#imports'
import { useAuth } from './useAuth'
import { AuthErrorHandler } from '~/utils/auth/error-handler'
import type { LoginFormData, RegisterFormData } from '~/utils/validation/schemas'

/**
 * Composable for handling authentication forms with separation of concerns
 * Handles form state, validation, submission, and user feedback
 */
export function useAuthForm(type: 'login' | 'register') {
  const router = useRouter()
  const toast = useToast()
  const { login, register } = useAuth()

  // Form state
  const isSubmitting = ref(false)
  const isSubmitted = ref(false)

  // Computed loading state
  const isLoading = computed(() => isSubmitting.value)

  // Computed form state
  const formState = computed(() => ({
    isSubmitting: isSubmitting.value,
    isSubmitted: isSubmitted.value,
    isLoading: isLoading.value
  }))

  /**
   * Handle login form submission
   */
  async function handleLogin(data: LoginFormData) {
    if (isSubmitting.value) return

    isSubmitting.value = true

    try {
      await login(data.username, data.password)

      const success = AuthErrorHandler.getSuccessMessage('login')
      toast.add({
        title: success.message,
        description: success.description,
        color: 'success'
      })

      isSubmitted.value = true

      // Redirect after successful login
      await router.push('/')

    } catch (error) {
      const authError = AuthErrorHandler.handle(error)

      toast.add({
        title: authError.message,
        description: authError.description,
        color: 'error'
      })

      throw error // Re-throw for form validation if needed
    } finally {
      isSubmitting.value = false
    }
  }

  /**
   * Handle register form submission
   */
  async function handleRegister(data: RegisterFormData) {
    if (isSubmitting.value) return

    isSubmitting.value = true

    try {
      await register({
        username: data.username,
        password: data.password,
        email: data.email,
        phone_number: data.phone_number
      })

      const success = AuthErrorHandler.getSuccessMessage('register')
      toast.add({
        title: success.message,
        description: success.description,
        color: 'success'
      })

      isSubmitted.value = true

      // Redirect to login after successful registration
      await router.push('/login')

    } catch (error) {
      const authError = AuthErrorHandler.handle(error)

      toast.add({
        title: authError.message,
        description: authError.description,
        color: 'error'
      })

      throw error // Re-throw for form validation if needed
    } finally {
      isSubmitting.value = false
    }
  }

  /**
   * Submit handler based on form type
   */
  async function submit(data: LoginFormData | RegisterFormData) {
    if (type === 'login') {
      return handleLogin(data as LoginFormData)
    } else {
      return handleRegister(data as RegisterFormData)
    }
  }

  /**
   * Reset form state
   */
  function reset() {
    isSubmitting.value = false
    isSubmitted.value = false
  }

  return {
    // State
    formState,
    isSubmitting,
    isSubmitted,
    isLoading,

    // Actions
    submit,
    reset,
    handleLogin,
    handleRegister
  }
}