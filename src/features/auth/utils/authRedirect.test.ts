import { describe, expect, it } from 'vitest'
import { getAuthenticatedRedirect } from './authRedirect'
import type { User } from '../types/auth'

const user = (roleCodes: string[], canAccessDashboard: boolean) =>
  ({ roleCodes, canAccessDashboard }) as User

describe('role-based post-login redirect', () => {
  it('sends customers to their purchase page', () => {
    const customer = user(['CUSTOMER'], false)
    expect(getAuthenticatedRedirect(customer)).toBe('/customer/dashboard/buy')
    expect(getAuthenticatedRedirect(customer, '/admin/dashboard/users')).toBe(
      '/customer/dashboard/buy',
    )
  })

  it('keeps staff in the admin area', () => {
    const admin = user(['ADMIN'], true)
    expect(getAuthenticatedRedirect(admin)).toBe('/admin/dashboard')
    expect(getAuthenticatedRedirect(admin, '/customer/dashboard/buy')).toBe(
      '/admin/dashboard',
    )
  })

  it('honors a return URL only within an assigned area', () => {
    const both = user(['ADMIN', 'CUSTOMER'], true)
    expect(getAuthenticatedRedirect(both, '/customer/dashboard/buy')).toBe(
      '/customer/dashboard/buy',
    )
  })
})
