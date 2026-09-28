import { describe, expect, it } from 'vitest'
import {
  addCustomerCartItemSchema,
  removeCustomerCartItemSchema,
  updateCustomerCartItemSchema,
} from './customer-cart.schemas'

const productId = '019a1234-1234-7000-8000-123456789abc'
const planId = '019a1234-1234-7000-8000-123456789abd'

describe('customer cart input', () => {
  it('accepts a purchasable plan selection and optional datacenter', () => {
    expect(
      addCustomerCartItemSchema.safeParse({
        productId,
        planId,
        billingCycle: 'MONTHLY',
        datacenterId: productId,
      }).success,
    ).toBe(true)
  })

  it('rejects malformed IDs or an untrusted billing cycle', () => {
    expect(
      addCustomerCartItemSchema.safeParse({
        productId: 'bad',
        planId,
        billingCycle: 'MONTHLY',
      }).success,
    ).toBe(false)
    expect(
      addCustomerCartItemSchema.safeParse({
        productId,
        planId,
        billingCycle: 'MONTHLY;DROP',
      }).success,
    ).toBe(false)
    expect(removeCustomerCartItemSchema.safeParse({ id: 'bad' }).success).toBe(
      false,
    )
  })

  it('accepts a VPS operating system update but rejects an empty value', () => {
    const selection = {
      id: productId,
      quantity: 1,
      billingCycle: 'MONTHLY',
      datacenterId: planId,
    }
    expect(
      updateCustomerCartItemSchema.safeParse({
        ...selection,
        operatingSystem: 'Debian 12',
      }).success,
    ).toBe(true)
    expect(
      updateCustomerCartItemSchema.safeParse({
        ...selection,
        operatingSystem: ' ',
      }).success,
    ).toBe(false)
  })
})
