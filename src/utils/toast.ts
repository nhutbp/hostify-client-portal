import { getApiErrorMessage } from './apiError'
import { gooeyToast } from 'goey-toast'
import type { GooeyPromiseData, GooeyToastOptions } from 'goey-toast'

// Re-export gooeyToast for direct access
export { gooeyToast }

// Toast utility functions
export const toast = {
  // Basic toasts
  default: (title: string, options?: GooeyToastOptions) =>
    gooeyToast(title, options),

  success: (title: string, options?: GooeyToastOptions) =>
    gooeyToast.success(title, options),

  error: (title: string, options?: GooeyToastOptions) =>
    gooeyToast.error(title, options),

  warning: (title: string, options?: GooeyToastOptions) =>
    gooeyToast.warning(title, options),

  info: (title: string, options?: GooeyToastOptions) =>
    gooeyToast.info(title, options),

  // Promise toast
  promise: <T>(promise: Promise<T>, data: GooeyPromiseData<T>) =>
    gooeyToast.promise(promise, data),

  // API error toast (extracts message from API response)
  apiError: (error: unknown, fallbackMessage = 'An error occurred') =>
    gooeyToast.error(getApiErrorMessage(error, fallbackMessage)),

  // Dismiss toasts
  dismiss: (idOrFilter?: Parameters<typeof gooeyToast.dismiss>[0]) =>
    gooeyToast.dismiss(idOrFilter),

  // Update existing toast
  update: (
    id: string | number,
    options: Parameters<typeof gooeyToast.update>[1],
  ) => gooeyToast.update(id, options),
}

// Shorthand exports for common use cases
export const showSuccess = (message: string, description?: string) =>
  gooeyToast.success(message, { description })

export const showError = (message: string, description?: string) =>
  gooeyToast.error(message, { description })

export const showWarning = (message: string, description?: string) =>
  gooeyToast.warning(message, { description })

export const showInfo = (message: string, description?: string) =>
  gooeyToast.info(message, { description })

export const showApiError = (
  error: unknown,
  fallbackMessage = 'An error occurred',
) => gooeyToast.error(getApiErrorMessage(error, fallbackMessage))
