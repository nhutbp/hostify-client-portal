import { APP_INFO } from '@/config/appInfo'

/**
 * Play notification sound
 */
export const playNotificationSound = () => {
  const audio = new Audio('/sounds/notification.mp3')
  audio.volume = 1 // 100% volume
  audio.play().catch((error) => {
    console.warn('[Notification] Could not play notification sound:', error)
  })
}

/**
 * Update document title with notification count
 */
export const updateDocumentTitle = (count: number) => {
  const baseTitle = `${APP_INFO.NAME} Admin`
  if (count > 0) {
    document.title = `(${count}) ${baseTitle}`
  } else {
    document.title = baseTitle
  }
}
