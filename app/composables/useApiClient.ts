/**
 * API client with automatic token handling
 * Manages authentication headers and token refresh automatically
 */

import { TokenManager } from '~/utils/auth/token-manager'

export function useApiClient() {
  const { $fetch } = useNuxtApp()

  /**
   * Make authenticated API request with automatic token handling
   */
  async function request<T = any>(
    url: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
      body?: any
      headers?: Record<string, string>
      params?: Record<string, any>
      skipAuth?: boolean
    } = {}
  ): Promise<T> {
    const {
      method = 'GET',
      body,
      headers = {},
      params,
      skipAuth = false
    } = options

    // Build request options
    const requestOptions: any = {
      method,
      headers: {
        ...headers
      }
    }

    // Add authentication header if not skipped
    if (!skipAuth) {
      const authHeaders = TokenManager.getAuthHeader()
      Object.assign(requestOptions.headers, authHeaders)
    }

    // Add body for non-GET requests
    if (body && method !== 'GET') {
      if (body instanceof FormData) {
        requestOptions.body = body
      } else {
        requestOptions.body = body
        requestOptions.headers['Content-Type'] = 'application/json'
      }
    }

    // Add query parameters
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
      url += (url.includes('?') ? '&' : '?') + searchParams.toString()
    }

    try {
      return await $fetch<T>(url, requestOptions)
    } catch (error: any) {
      // Handle 401 unauthorized errors
      if (error?.statusCode === 401 && !skipAuth) {
        // Try to refresh token and retry request
        try {
          await refreshAuthToken()

          // Retry original request with new token
          const newAuthHeaders = TokenManager.getAuthHeader()
          Object.assign(requestOptions.headers, newAuthHeaders)

          return await $fetch<T>(url, requestOptions)
        } catch (refreshError) {
          // Token refresh failed, clear tokens and redirect to login
          TokenManager.clearTokens()

          // Only redirect on client side
          if (typeof window !== 'undefined') {
            const router = useRouter()
            await router.push('/login')
          }

          throw refreshError
        }
      }

      // Re-throw original error
      throw error
    }
  }

  /**
   * Refresh the authentication token
   */
  async function refreshAuthToken(): Promise<string> {
    const refreshToken = TokenManager.getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await $fetch('/api/auth/refresh', {
      method: 'POST',
      body: { refresh_token: refreshToken },
      headers: { 'Content-Type': 'application/json' }
    })

    if (response?.code === 200 && response.data?.access_token) {
      // Update stored tokens
      TokenManager.setTokens({
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token || refreshToken
      })

      return response.data.access_token
    }

    throw new Error('Token refresh failed')
  }

  /**
   * Make public API request (no authentication required)
   */
  async function publicRequest<T = any>(
    url: string,
    options: Omit<Parameters<typeof request>[1], 'skipAuth'> = {}
  ): Promise<T> {
    return request<T>(url, { ...options, skipAuth: true })
  }

  return {
    request,
    publicRequest,
    refreshAuthToken
  }
}