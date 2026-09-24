import { z } from 'zod'

export const loginSchema = z.object({
  login: z.string().min(1, 'Login là bắt buộc'),
  password: z.string().min(1, 'Password là bắt buộc'),
})

export const registerSchema = z
  .object({
    userLogin: z.string().min(1, 'Username là bắt buộc'),
    displayName: z.string().min(1, 'Display name là bắt buộc'),
    userEmail: z.string().email('Email không hợp lệ'),
    userPhone: z.string().min(1, 'Phone number là bắt buộc'),
    userPass: z.string().min(6, 'Password phải có ít nhất 6 ký tự'),
    confirm_password: z.string().min(1, 'Confirm password là bắt buộc'),
  })
  .refine((data) => data.userPass === data.confirm_password, {
    message: 'Mật khẩu không khớp',
    path: ['confirm_password'],
  })

export const resendVerificationEmailSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
})

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token là bắt buộc'),
    password: z.string().min(6, 'Password phải có ít nhất 6 ký tự'),
    confirm_password: z.string().min(1, 'Confirm password là bắt buộc'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Mật khẩu không khớp',
    path: ['confirm_password'],
  })

export const verifyEmailLinkSchema = z.object({
  userId: z.string().min(1, 'User ID là bắt buộc'),
  createdAt: z.string().min(1, 'createdAt là bắt buộc'),
  email: z.string().optional(),
})
