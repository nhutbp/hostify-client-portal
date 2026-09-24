/**
 * Format price with Vietnamese locale and currency symbol
 * @param amount - Number to format
 * @returns Formatted price string (e.g., "123 456đ")
 */
export function formatPrice(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

  if (isNaN(numAmount)) {
    return '0đ'
  }

  // Format số với phân cách phần ngàn bằng dấu chấm
  const formatted = numAmount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  return formatted + 'đ'
}

export function formatWeight(value: string | number | undefined): string {
  if (!value) return '0 gr'
  const numberValue = Number(String(value).replace(/[^0-9]/g, ''))
  return `${numberValue.toLocaleString('vi-VN')} gr`
}

/**
 * Format distance in meters to a human-readable string
 * @param meters - distance in meters
 * @param options - formatting options
 * @returns Formatted distance string
 */
interface FormatDistanceOptions {
  decimals?: number
  locale?: string // Locale to format number (e.g., 'vi-VN', 'en-US')
  unit?: 'auto' | 'km' | 'm'
}

export const formatDistance = (
  meters: number,
  options: FormatDistanceOptions = {},
): string => {
  const { decimals = 1, locale = 'vi-VN', unit = 'auto' } = options

  // Handle invalid values
  if (isNaN(meters) || meters < 0) {
    return '0 m'
  }

  const km = meters / 1000

  // If a fixed unit is specified
  if (unit === 'km') {
    return `${km.toLocaleString(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })} km`
  }

  if (unit === 'm') {
    return `${Math.round(meters).toLocaleString(locale)} m`
  }

  // Auto: choose the appropriate unit
  if (meters >= 1000) {
    return `${km.toLocaleString(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })} km`
  }

  return `${Math.round(meters).toLocaleString(locale)} m`
}

/**
 * Format image URL by prepending CDN base URL
 * @param imageUrl - Image path or full URL
 * @returns Full image URL with CDN base
 */
export function formatImageUrl(imageUrl: string | undefined | null): string {
  if (!imageUrl) return ''

  // If already a full URL, return as-is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }

  const cdnBaseUrl = import.meta.env.VITE_CDN_BASE_URL || ''

  // Remove leading slash from imageUrl if present to avoid double slashes
  const cleanPath = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl

  return cdnBaseUrl ? `${cdnBaseUrl}/${cleanPath}` : imageUrl
}

// Helper function to format bytes to human readable
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export function preventSpaceInput(event: {
  preventDefault: () => void
  key?: string
  clipboardData?: { getData: (type: string) => string }
}) {
  if (event.key === ' ') {
    event.preventDefault()
    return
  }

  if (event.clipboardData) {
    const text = event.clipboardData.getData('text')
    if (/\s/.test(text)) {
      event.preventDefault()
    }
  }
}

const DATE_FORMATTER = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

function parseDate(value: string | Date): Date | null {
  const parsed = value instanceof Date ? value : new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function formatDate(value: string | Date | null | undefined): string {
  if (value == null) return ''
  const parsed = parseDate(value)
  return parsed ? DATE_FORMATTER.format(parsed) : String(value)
}

export function formatDateTime(
  value: string | Date | null | undefined,
): string {
  if (value == null) return ''
  const parsed = parseDate(value)
  return parsed ? DATE_TIME_FORMATTER.format(parsed) : String(value)
}

export function formatDateTimeRange(
  startDate: string | Date | null | undefined,
  endDate: string | Date | null | undefined,
): string {
  const start = formatDateTime(startDate)
  const end = formatDateTime(endDate)
  if (!start) return end
  if (!end) return start
  return `${start} - ${end}`
}

export function formatDateRange(
  startDate: string | Date | null | undefined,
  endDate: string | Date | null | undefined,
): string {
  const start = formatDate(startDate)
  const end = formatDate(endDate)
  if (!start) return end
  if (!end) return start
  return `${start} - ${end}`
}
