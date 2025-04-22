/**
 * Validation utility functions
 */

// Email validation
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  // Phone number validation (10 digits)
  export const isValidPhone = (phone: string): boolean => {
    const phoneDigits = phone.replace(/[^0-9]/g, "")
    return phoneDigits.length === 10
  }
  
  // Password validation
  export const isValidPassword = (password: string): boolean => {
    return password.length >= 6 && password.length <= 20
  }
  
  // Required field validation
  export const isRequired = (value: string): boolean => {
    return value.trim().length > 0
  }
  
  // Min length validation
  export const hasMinLength = (value: string, minLength: number): boolean => {
    return value.trim().length >= minLength
  }
  
  // Max length validation
  export const hasMaxLength = (value: string, maxLength: number): boolean => {
    return value.trim().length <= maxLength
  }
  
  // Numeric validation
  export const isNumeric = (value: string): boolean => {
    return /^\d+$/.test(value)
  }
  
  // Positive number validation
  export const isPositiveNumber = (value: number): boolean => {
    return value > 0
  }
  
  // Pin code validation (6 digits)
  export const isValidPinCode = (pinCode: string): boolean => {
    return /^\d{6}$/.test(pinCode)
  }
  
  // OTP validation (6 digits)
  export const isValidOTP = (otp: string): boolean => {
    return /^\d{6}$/.test(otp)
  }
  