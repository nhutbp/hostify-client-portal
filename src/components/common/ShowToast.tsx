import { toast } from '@/utils/toast'

interface SuccessToastProps {
  title?: string
  message: string
  duration?: number
}

interface ErrorToastProps {
  title?: string
  message: string
  duration?: number
}

export function showSuccessToast({
  title,
  message,
  duration = 3000,
}: SuccessToastProps) {
  return title
    ? toast.success(title, { description: message, duration })
    : toast.success(message, { duration })
}

export function showErrorToast({
  title,
  message,
  duration = 3000,
}: ErrorToastProps) {
  return title
    ? toast.error(title, { description: message, duration })
    : toast.error(message, { duration })
}

export function showWarrningToast({
  title,
  message,
  duration = 3000,
}: ErrorToastProps) {
  return title
    ? toast.warning(title, { description: message, duration })
    : toast.warning(message, { duration })
}

export function showInfoToast({
  title,
  message,
  duration = 3000,
}: ErrorToastProps) {
  return title
    ? toast.info(title, { description: message, duration })
    : toast.info(message, { duration })
}

// toastApiError
