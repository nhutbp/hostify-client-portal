import { createAppError } from '../../../common/app-error.server'
import { findCouponByCode } from './coupon.repository.server'

export function normalizeCouponCode(code: string) {
  return code.trim().toUpperCase()
}

export function calculateCouponDiscount(
  discountType: string,
  discountValue: bigint,
  subtotalMinor: bigint,
) {
  if (discountValue <= 0n) return null
  if (discountType === 'PERCENT' || discountType === 'PERCENTAGE') {
    if (discountValue > 100n) return null
    return (subtotalMinor * discountValue) / 100n
  }
  if (discountType === 'FIXED' || discountType === 'AMOUNT') {
    return discountValue > subtotalMinor ? subtotalMinor : discountValue
  }
  return null
}

export async function quoteCoupon(
  code: string,
  subtotalMinor: bigint,
  now = new Date(),
) {
  const coupon = await findCouponByCode(normalizeCouponCode(code))
  if (
    !coupon ||
    coupon.status !== 'ACTIVE' ||
    coupon.startsAt > now ||
    (coupon.endsAt && coupon.endsAt <= now) ||
    (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit)
  ) {
    throw createAppError({
      message: 'Mã giảm giá không khả dụng',
      errorCode: 'COUPON_UNAVAILABLE',
      statusCode: 400,
    })
  }
  const discountMinor = calculateCouponDiscount(
    coupon.discountType,
    coupon.discountValue,
    subtotalMinor,
  )
  if (discountMinor === null) {
    throw createAppError({
      message: 'Loại mã giảm giá chưa được hỗ trợ',
      errorCode: 'COUPON_TYPE_UNSUPPORTED',
      statusCode: 400,
    })
  }
  return {
    code: coupon.code,
    discountMinor,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
  }
}
