import { describe, expect, it } from 'vitest'
import {
  getAdminOrderSchema,
  listAdminOrdersSchema,
  updateAdminOrderSchema,
} from './admin-orders.schemas'

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

describe('updateAdminOrderSchema', () => {
  const input = {
    id: '01a0e8dd-0b0a-7f04-bd0f-583aec8378d8',
    expectedStatus: 'PENDING_PAYMENT',
    status: 'PAID',
    paymentMethod: 'VIETQR',
    paymentReference: 'BANK-123',
    paidAt: '2026-09-29T09:00:00+07:00',
  }
  it('accepts manual payment evidence and defaults fulfillment confirmation to false', () => {
    expect(updateAdminOrderSchema.parse(input).manualFulfillmentConfirmed).toBe(
      false,
    )
  })
  it('rejects unsupported statuses and invalid payment dates', () => {
    expect(
      updateAdminOrderSchema.safeParse({ ...input, status: 'REFUNDED' })
        .success,
    ).toBe(false)
    expect(
      updateAdminOrderSchema.safeParse({ ...input, paidAt: 'yesterday' })
        .success,
    ).toBe(false)
  })
})

describe('getAdminOrderSchema', () => {
  it('requires a valid order UUID', () => {
    expect(getAdminOrderSchema.safeParse({ id: 'not-an-id' }).success).toBe(
      false,
    )
    expect(
      getAdminOrderSchema.safeParse({
        id: '01a0e8dd-0b0a-7f04-bd0f-583aec8378d8',
      }).success,
    ).toBe(true)
  })
})
