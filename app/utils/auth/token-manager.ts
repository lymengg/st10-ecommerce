/**
 * Secure token management utility
 * Handles JWT tokens with proper validation and storage
 */

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_KEY = 'user_data'

export interface TokenData {
  accessToken: string
  refreshToken?: string
  user?: {
    id?: number
    username: string
    role: string
    email: string
    phone_number: string
  }
}

export class TokenManager {
  /**
   * Store tokens and user data securely
   */
  static setTokens(data: TokenData) {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken)

      if (data.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken)
      }

      if (data.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(data.user))
      }
    } catch (error) {
      console.warn('Failed to store tokens:', error)
    }
  }

  /**
   * Get access token
   */
  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null

    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY)
    } catch {
      return null
    }
  }

  /**
   * Get refresh token
   */
  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null

    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY)
    } catch {
      return null
    }
  }

  /**
   * Get stored user data
   */
  static getUser(): any | null {
    if (typeof window === 'undefined') return null

    try {
      const userStr = localStorage.getItem(USER_KEY)
      return userStr ? JSON.parse(userStr) : null
    } catch {
      return null
    }
  }

  /**
   * Check if user is authenticated (has valid access token)
   */
  static isAuthenticated(): boolean {
    const token = this.getAccessToken()
    if (!token) return false

    // Optional: Basic JWT expiration check
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000

      // Check if token is expired (with 5-minute buffer)
      return payload.exp > (currentTime + 300)
    } catch {
      // If token parsing fails, consider it invalid
      return false
    }
  }

  /**
   * Clear all stored data (logout)
   */
  static clearTokens() {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    } catch (error) {
      console.warn('Failed to clear tokens:', error)
    }
  }

  /**
   * Get authorization header value
   */
  static getAuthHeader(): { Authorization: string } | {} {
    const token = this.getAccessToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  /**
   * Check if token needs refresh (optional: based on expiration)
   */
  static shouldRefreshToken(): boolean {
    const token = this.getAccessToken()
    if (!token) return false

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000

      // Refresh if token expires within 15 minutes
      return payload.exp < (currentTime + 900)
    } catch {
      return false
    }
  }
}