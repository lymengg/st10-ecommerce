/**
 * Improved authentication composable with proper token management
 * Integrates with TokenManager for secure token storage and API requests
 */

import { ref, computed } from 'vue'
import { TokenManager, type TokenData } from '~/utils/auth/token-manager'

export function useAuthImproved() {
  // Reactive state
  const isInitialized = ref(false)
  const isLoading = ref(false)

  // Computed properties
  const isAuthenticated = computed(() => TokenManager.isAuthenticated())
  const user = computed(() => TokenManager.getUser())

  /**
   * Initialize authentication state from stored tokens
   */
  function initialize() {
    if (isInitialized.value) return

    // Check if we have valid tokens on mount
    if (typeof window !== 'undefined') {
      const hasValidToken = TokenManager.isAuthenticated()
      if (!hasValidToken) {
        // Token expired or invalid, clear storage
        TokenManager.clearTokens()
      }
    }

    isInitialized.value = true
  }

  /**
   * Login with username/password and store tokens
   */
  async function login(username: string, password: string) {
    isLoading.value = true

    try {
      // Use the existing login API call
      const { $fetch } = useNuxtApp()

      const formData = new FormData()
      formData.append('username', username)
      formData.append('password', password)

      const response = await $fetch('/api/auth/login', {
        method: 'POST',
        body: formData
      })

      if (response.code === 200) {
        // Store tokens and user data
        const tokenData: TokenData = {
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token,
          user: {
            username: response.data.username,
            role: response.data.role,
            email: response.data.email,
            phone_number: response.data.phone_number
          }
        }

        TokenManager.setTokens(tokenData)
        return response
      }

      throw response

    } catch (error) {
      // Clear any existing tokens on failed login
      TokenManager.clearTokens()
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Register new user
   */
  async function register(payload: {
    username: string
    password: string
    email: string
    phone_number: string
  }) {
    isLoading.value = true

    try {
      const { $fetch } = useNuxtApp()

      const response = await $fetch('/api/auth/register', {
        method: 'POST',
        body: payload,
        headers: { 'Content-Type': 'application/json' }
      })

      return response

    } finally {
      isLoading.value = false
    }
  }

  /**
   * Refresh access token
   */
  async function refreshToken() {
    const refreshToken = TokenManager.getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const { $fetch } = useNuxtApp()

      const response = await $fetch('/api/auth/refresh', {
        method: 'POST',
        body: { refresh_token: refreshToken },
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.code === 200) {
        // Update stored tokens
        TokenManager.setTokens({
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token || refreshToken
        })

        return response.data.access_token
      }

      throw new Error('Token refresh failed')

    } catch (error) {
      // Clear tokens on refresh failure
      TokenManager.clearTokens()
      throw error
    }
  }

  /**
   * Get user profile
   */
  async function fetchProfile() {
    isLoading.value = true

    try {
      const { $fetch } = useNuxtApp()
      const headers = TokenManager.getAuthHeader()

      const response = await $fetch('/api/users/me', {
        method: 'GET',
        headers
      })

      if (response.code === 200) {
        // Update stored user data
        const tokenData: TokenData = {
          accessToken: TokenManager.getAccessToken()!,
          user: response.data
        }
        TokenManager.setTokens(tokenData)
      }

      return response

    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update user profile
   */
  async function updateProfile(payload: {
    username?: string
    email?: string
    phone_number?: string
  }) {
    isLoading.value = true

    try {
      const { $fetch } = useNuxtApp()
      const headers = TokenManager.getAuthHeader()

      const response = await $fetch('/api/users/me', {
        method: 'PUT',
        body: payload,
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        }
      })

      if (response.code === 200) {
        // Update stored user data
        const currentUser = TokenManager.getUser() || {}
        const updatedUser = { ...currentUser, ...response.data }

        TokenManager.setTokens({
          accessToken: TokenManager.getAccessToken()!,
          user: updatedUser
        })
      }

      return response

    } finally {
      isLoading.value = false
    }
  }

  /**
   * Change password
   */
  async function changePassword(
    current_password: string,
    new_password: string
  ) {
    isLoading.value = true

    try {
      const { $fetch } = useNuxtApp()
      const headers = TokenManager.getAuthHeader()

      return await $fetch('/api/auth/change-password', {
        method: 'POST',
        body: { current_password, new_password },
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        }
      })

    } finally {
      isLoading.value = false
    }
  }

  /**
   * Logout and clear all tokens
   */
  function logout() {
    TokenManager.clearTokens()

    // Optional: Call logout API endpoint to invalidate server-side session
    if (typeof window !== 'undefined') {
      const { $fetch } = useNuxtApp()
      const headers = TokenManager.getAuthHeader()

      $fetch('/api/auth/logout', {
        method: 'POST',
        headers
      }).catch(() => {
        // Ignore logout API errors
      })
    }
  }

  // Initialize on composable creation
  if (typeof window !== 'undefined') {
    initialize()
  }

  return {
    // State
    isAuthenticated,
    user,
    isLoading,
    isInitialized: computed(() => isInitialized.value),

    // Actions
    login,
    register,
    refreshToken,
    fetchProfile,
    updateProfile,
    changePassword,
    logout,

    // Utility
    initialize
  }
}