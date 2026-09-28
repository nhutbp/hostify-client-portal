// Temporary checkout VAT policy shown in the approved UI reference.
// TODO(billing): Replace with an organization/service-specific tax policy before enabling payment gateways.
export const CHECKOUT_VAT_BPS = 1000n

export function calculateCheckoutTotals(
  subtotalMinor: bigint,
  discountMinor: bigint,
) {
  if (
    subtotalMinor < 0n ||
    discountMinor < 0n ||
    discountMinor > subtotalMinor
  ) {
    throw new RangeError('Invalid checkout amounts')
  }
  const afterDiscountMinor = subtotalMinor - discountMinor
  const taxMinor = (afterDiscountMinor * CHECKOUT_VAT_BPS + 5000n) / 10000n
  return {
    subtotalMinor,
    discountMinor,
    taxMinor,
    totalMinor: afterDiscountMinor + taxMinor,
  }
}
