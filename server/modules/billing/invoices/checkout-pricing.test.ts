import { describe, expect, it } from 'vitest'
import { calculateCheckoutTotals } from './checkout-pricing'

describe('pending-payment checkout quote', () => {
  it('calculates VAT after discount with integer VND', () => {
    expect(calculateCheckoutTotals(299000n, 29900n)).toEqual({
      subtotalMinor: 299000n,
      discountMinor: 29900n,
      taxMinor: 26910n,
      totalMinor: 296010n,
    })
  })
})
