const RETURN_URL_KEY = 'return-url'

export function setReturnUrl(url: string): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(RETURN_URL_KEY, url)
}

export function getReturnUrl(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(RETURN_URL_KEY)
}

export function peekReturnUrl(): string | null {
  return getReturnUrl()
}

export function clearReturnUrl(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(RETURN_URL_KEY)
}
