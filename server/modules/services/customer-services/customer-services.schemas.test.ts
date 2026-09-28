import { describe, expect, it } from 'vitest'
import { listMyCustomerServicesSchema } from './customer-services.schemas'

describe('customer service filters', () => {
  it('accepts category, search and sorting with paging defaults', () => {
    const parsed = listMyCustomerServicesSchema.parse({
      category: 'vps',
      search: 'server-01',
      sort: 'EXPIRING',
    })
    expect(parsed).toMatchObject({
      category: 'vps',
      search: 'server-01',
      sort: 'EXPIRING',
      page: 1,
      limit: 6,
    })
  })

  it('rejects oversized pages and invalid provider identifiers', () => {
    expect(listMyCustomerServicesSchema.safeParse({ page: 0 }).success).toBe(
      false,
    )
    expect(listMyCustomerServicesSchema.safeParse({ limit: 101 }).success).toBe(
      false,
    )
    expect(
      listMyCustomerServicesSchema.safeParse({ providerId: 'not-a-uuid' })
        .success,
    ).toBe(false)
  })
})
