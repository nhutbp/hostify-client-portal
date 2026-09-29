import { describe, expect, it } from 'vitest'
import { getVisibleSidebarItems } from './getVisibleSidebarItems'

describe('getVisibleSidebarItems', () => {
  it('shows only customer navigation in the customer area', () => {
    const items = getVisibleSidebarItems('customer', [], true)
    expect(items.some((item) => item.url?.startsWith('/admin/'))).toBe(false)
    expect(
      items.some((item) => item.url === '/customer/dashboard/services'),
    ).toBe(true)
  })

  it('filters admin navigation by permission', () => {
    const items = getVisibleSidebarItems('admin')
    expect(items.some((item) => item.url === '/admin/dashboard')).toBe(false)
    expect(items.some((item) => item.url?.startsWith('/customer/'))).toBe(false)
  })

  it('shows admin navigation to a super admin', () => {
    const items = getVisibleSidebarItems('admin', [], true)
    expect(items.some((item) => item.url === '/admin/dashboard')).toBe(true)
    expect(items.some((item) => item.url?.startsWith('/customer/'))).toBe(false)
  })
})
