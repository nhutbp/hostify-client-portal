// Phone validation utilities

/**
 * Validate if a phone number is a valid Vietnamese phone number
 * Supports: 10-11 digits starting with 0, or +84 format
 */
export function isValidPhoneNumberVN(
  phone: string | null | undefined,
): boolean {
  if (!phone) return false

  // Remove spaces, dashes, and dots
  const cleaned = phone.replace(/[\s\-.]/g, '')

  // Check for +84 format or 0 format
  const vnPhoneRegex = /^(\+84|84|0)(3|5|7|8|9)[0-9]{8}$/
  return vnPhoneRegex.test(cleaned)
}

/**
 * Normalize phone number to +84 format
 */
export function normalizePhoneForVN(phone: string | null | undefined): string {
  if (!phone) return ''

  // Remove spaces, dashes, and dots
  const cleaned = phone.replace(/[\s\-.]/g, '')

  // If starts with +84, return as is
  if (cleaned.startsWith('+84')) {
    return cleaned
  }

  // If starts with 84, add +
  if (cleaned.startsWith('84') && cleaned.length === 11) {
    return '+' + cleaned
  }

  // If starts with 0, replace with +84
  if (cleaned.startsWith('0')) {
    return '+84' + cleaned.slice(1)
  }

  return cleaned
}
