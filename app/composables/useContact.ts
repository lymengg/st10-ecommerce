/**
 * Contact composable for handling contact-related functionality
 * Following Nuxt 3 composables best practices
 */

export interface ContactInfo {
  phone: string
  email: string
  emergencyPhone: string
  whatsapp: string
  businessHours: {
    [key: string]: string
  }
}

export interface ServiceItem {
  id: number
  title: string
  description: string
  icon: string
  color: string
}

export const useContact = () => {
  // Contact information
  const contactInfo: ContactInfo = {
    phone: '+1 (555) 123-4567',
    email: 'support@watchstore.com',
    emergencyPhone: '+1 (555) 911-HELP',
    whatsapp: '+15551234567',
    businessHours: {
      'Monday - Friday': '9:00 AM - 6:00 PM EST',
      'Saturday': '10:00 AM - 4:00 PM EST',
      'Sunday': 'Closed'
    }
  }

  // Services we offer
  const services: ServiceItem[] = [
    {
      id: 1,
      title: 'Purchase Assistance',
      description: 'Help with choosing the perfect timepiece',
      icon: 'i-heroicons-shopping-bag',
      color: 'primary'
    },
    {
      id: 2,
      title: 'Technical Support',
      description: 'Watch maintenance and repair services',
      icon: 'i-heroicons-wrench-screwdriver',
      color: 'green'
    },
    {
      id: 3,
      title: 'Order Status',
      description: 'Track your watch orders and deliveries',
      icon: 'i-heroicons-arrow-path',
      color: 'blue'
    },
    {
      id: 4,
      title: 'Authenticity',
      description: 'Verify watch authenticity and warranties',
      icon: 'i-heroicons-sparkles',
      color: 'orange'
    }
  ]

  // Phone call function with error handling
  const makePhoneCall = (phoneNumber?: string) => {
    try {
      const number = phoneNumber || contactInfo.phone
      const telUrl = `tel:${number.replace(/[^\d+]/g, '')}`
      window.open(telUrl, '_self')

      // Track the call for analytics (optional)
      if (typeof gtag !== 'undefined') {
        gtag('event', 'phone_call', {
          'phone_number': number
        })
      }
    } catch (error) {
      console.error('Failed to initiate phone call:', error)
      // Fallback: copy number to clipboard
      copyToClipboard(phoneNumber || contactInfo.phone)
    }
  }

  // WhatsApp contact
  const openWhatsApp = (message?: string) => {
    try {
      const defaultMessage = message || 'Hi! I have a question about your watches.'
      const whatsappUrl = `https://wa.me/${contactInfo.whatsapp.replace(/[^\d]/g, '')}?text=${encodeURIComponent(defaultMessage)}`
      window.open(whatsappUrl, '_blank')

      // Track WhatsApp click for analytics (optional)
      if (typeof gtag !== 'undefined') {
        gtag('event', 'whatsapp_contact', {
          'message_length': defaultMessage.length
        })
      }
    } catch (error) {
      console.error('Failed to open WhatsApp:', error)
    }
  }

  // Email contact
  const sendEmail = (subject?: string, body?: string) => {
    try {
      const emailSubject = subject || 'Question about WatchStore watches'
      const emailBody = body || 'I would like to inquire about your watches.'
      const mailtoUrl = `mailto:${contactInfo.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
      window.open(mailtoUrl, '_blank')
    } catch (error) {
      console.error('Failed to open email client:', error)
    }
  }

  // Copy to clipboard utility
  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        return true
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = text
        document.body.appendChild(textArea)
        textArea.select()
        const successful = document.execCommand('copy')
        document.body.removeChild(textArea)
        return successful
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      return false
    }
  }

  // Live chat placeholder
  const startLiveChat = () => {
    // This would integrate with your preferred chat service
    // For example: Intercom, LiveChat, Crisp, etc.
    const chatMessage = 'Live chat feature coming soon! Please call us at ' + contactInfo.phone + ' for immediate assistance.'

    // Show a toast or modal (requires Nuxt UI setup)
    // For now, using alert as fallback
    if (typeof window !== 'undefined') {
      alert(chatMessage)
    }
  }

  // Format phone number for display
  const formatPhoneNumber = (phone: string): string => {
    // Simple formatting - customize based on your needs
    return phone
  }

  // Check if business hours
  const isBusinessHours = (): boolean => {
    const now = new Date()
    const day = now.getDay()
    const hour = now.getHours()

    // Sunday (0) is closed
    if (day === 0) return false

    // Saturday (6) is 10 AM - 4 PM (10-16)
    if (day === 6) return hour >= 10 && hour < 16

    // Monday-Friday (1-5) is 9 AM - 6 PM (9-18)
    if (day >= 1 && day <= 5) return hour >= 9 && hour < 18

    return false
  }

  // Get current business hours status
  const getBusinessHoursStatus = () => {
    const isOpen = isBusinessHours()
    const statusText = isOpen ? 'Open now' : 'Closed'
    const statusColor = isOpen ? 'text-green-600' : 'text-red-600'

    return {
      isOpen,
      statusText,
      statusColor
    }
  }

  // Reactive values
  const isCurrentlyOpen = computed(() => isBusinessHours())
  const businessStatus = computed(() => getBusinessHoursStatus())

  return {
    // Data
    contactInfo: readonly(contactInfo),
    services: readonly(services),
    isCurrentlyOpen,
    businessStatus,

    // Methods
    makePhoneCall,
    openWhatsApp,
    sendEmail,
    startLiveChat,
    copyToClipboard,
    formatPhoneNumber,
    isBusinessHours,
    getBusinessHoursStatus
  }
}