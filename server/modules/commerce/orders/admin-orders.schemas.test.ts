import { describe, expect, it } from 'vitest'
import { listAdminOrdersSchema } from './admin-orders.schemas'

describe('listAdminOrdersSchema', () => {
  it('uses safe defaults', () => {
    expect(listAdminOrdersSchema.parse({})).toMatchObject({
      page: 1,
      limit: 8,
      sort: 'NEWEST',
    })
  })
  it('rejects invalid ranges and limits', () => {
    expect(
      listAdminOrdersSchema.safeParse({
        dateFrom: '2026-09-29',
        dateTo: '2026-09-28',
      }).success,
    ).toBe(false)
    expect(listAdminOrdersSchema.safeParse({ limit: 101 }).success).toBe(false)
  })
  it('accepts filters', () => {
    expect(
      listAdminOrdersSchema.parse({
        status: 'PENDING_PAYMENT',
        dateFrom: '2026-09-01',
        sort: 'TOTAL_DESC',
      }),
    ).toMatchObject({ status: 'PENDING_PAYMENT', sort: 'TOTAL_DESC' })
  })
})
