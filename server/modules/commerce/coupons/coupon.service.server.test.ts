import { describe, expect, it } from 'vitest'
import { calculateCouponDiscount } from './coupon.service.server'

describe('coupon discount', () => {
  it('calculates a percentage with integer money', () => {
    expect(calculateCouponDiscount('PERCENT', 10n, 299000n)).toBe(29900n)
  })
  it('caps fixed discount at the subtotal', () => {
    expect(calculateCouponDiscount('FIXED', 500000n, 299000n)).toBe(299000n)
  })
  it('rejects an unsupported or excessive percentage', () => {
    expect(calculateCouponDiscount('PERCENT', 101n, 299000n)).toBeNull()
    expect(calculateCouponDiscount('UNKNOWN', 10n, 299000n)).toBeNull()
  })
})
