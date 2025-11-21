/**
 * Centralized error handling for authentication
 */

export interface AuthError {
  message: string
  description?: string
  code?: number
}

export class AuthErrorHandler {
  static handle(error: unknown): AuthError {
    // Handle API errors with specific structure
    if (error && typeof error === 'object') {
      const err = error as any

      // Handle API response errors
      if (err.data?.data) {
        return {
          message: 'Authentication failed',
          description: typeof err.data.data === 'string'
            ? err.data.data
            : 'Please check your credentials and try again',
          code: err.code || err.status || 400
        }
      }

      // Handle API detail errors
      if (err.data?.detail) {
        return {
          message: 'Authentication failed',
          description: err.data.detail,
          code: err.code || err.status || 400
        }
      }

      // Handle generic API errors
      if (err.message) {
        return {
          message: 'Authentication failed',
          description: err.message,
          code: err.code || err.status || 400
        }
      }
    }

    // Handle string errors
    if (typeof error === 'string') {
      return {
        message: 'Authentication failed',
        description: error,
        code: 400
      }
    }

    // Default error
    return {
      message: 'Authentication failed',
      description: 'An unexpected error occurred. Please try again.',
      code: 500
    }
  }

  static getSuccessMessage(action: 'login' | 'register' | 'logout'): AuthError {
    const messages = {
      login: {
        message: 'Login successful',
        description: 'Welcome back! Redirecting to your dashboard...'
      },
      register: {
        message: 'Registration successful',
        description: 'Your account has been created. Please login to continue.'
      },
      logout: {
        message: 'Logged out successfully',
        description: 'You have been safely logged out.'
      }
    }

    return messages[action]
  }
}