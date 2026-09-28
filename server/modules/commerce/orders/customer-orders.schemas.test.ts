import { describe, expect, it } from 'vitest'
import {
  createPendingOrderSchema,
  listCustomerOrdersSchema,
} from './customer-orders.schemas'

const order = {
  idempotencyKey: '019a1234-1234-7000-8000-123456789abc',
  paymentMethod: 'VIETQR',
  termsAccepted: true,
  configurations: [
    {
      cartItemId: '019a1234-1234-7000-8000-123456789abd',
      hostname: 'n8n.example.com',
    },
  ],
}

describe('customer order input', () => {
  it('accepts an FQDN for images requiring a domain hostname', () => {
    expect(createPendingOrderSchema.safeParse(order).success).toBe(true)
  })

  it('rejects invalid domain labels', () => {
    expect(
      createPendingOrderSchema.safeParse({
        ...order,
        configurations: [
          { ...order.configurations[0], hostname: 'bad..example.com' },
        ],
      }).success,
    ).toBe(false)
  })
})

describe('customer order history filters', () => {
  it('accepts a pending-payment filter and fills pagination defaults', () => {
    expect(
      listCustomerOrdersSchema.parse({
        status: 'PENDING_PAYMENT',
        search: 'HF-',
      }),
    ).toMatchObject({
      status: 'PENDING_PAYMENT',
      page: 1,
      limit: 10,
      sort: 'NEWEST',
    })
  })

  it('rejects unsupported statuses and invalid pagination', () => {
    expect(
      listCustomerOrdersSchema.safeParse({ status: 'UNKNOWN' }).success,
    ).toBe(false)
    expect(listCustomerOrdersSchema.safeParse({ page: 0 }).success).toBe(false)
  })
})
