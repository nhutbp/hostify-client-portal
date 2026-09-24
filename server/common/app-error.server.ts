export type AppErrorPayload = {
  success: false
  statusCode: number
  code: string
  errorCode: string
  message: string
  error: string | object | any[] | null
}

export class AppError extends Error implements AppErrorPayload {
  success = false as const
  statusCode: number
  code: string
  errorCode: string
  error: string | object | any[] | null

  constructor({
    message,
    errorCode,
    statusCode,
    error = null,
  }: {
    message: string
    errorCode: string
    statusCode: number
    error?: string | object | any[] | null
  }) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = errorCode
    this.errorCode = errorCode
    this.error = error

    Object.setPrototypeOf(this, new.target.prototype)
    Object.assign(this, {
      success: false,
      statusCode,
      code: errorCode,
      errorCode,
      message,
      error,
    })
  }

  toJSON(): AppErrorPayload {
    return {
      success: false,
      statusCode: this.statusCode,
      code: this.code,
      errorCode: this.errorCode,
      message: this.message,
      error: this.error,
    }
  }
}

export const createAppError = (payload: {
  message: string
  errorCode: string
  statusCode: number
  error?: string | object | any[] | null
}) => new AppError(payload)
