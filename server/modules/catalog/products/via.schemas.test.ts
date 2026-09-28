import { describe, expect, it } from 'vitest'
import {
  createViaPackageSchema,
  getViaPackageSchema,
  listViaPackagesSchema,
  updateViaPackageSchema,
} from './via.schemas'

const validPackage = {
  name: 'Facebook VIA US',
  slug: 'facebook-via-us',
  description: 'Tài khoản Facebook VIA chất lượng cao',
  platform: 'FACEBOOK',
  country: 'US',
  accountType: 'VIA',
  accountAge: 'ONE_YEAR',
  verification: 'VERIFIED',
  twoFactor: true,
  changeLimit: 'UNLIMITED',
  deliveryMethod: 'ACCOUNT_PASSWORD',
  warrantyDays: 7,
  defaultPrice: 50000,
  quantityPrices: [
    { quantity: 1, amount: 50000, discountPercent: 0 },
    { quantity: 10, amount: 480000, discountPercent: 4 },
  ],
  providerCategoryId: '019dbbe0-d97c-7000-a000-000000000001',
}

describe('via package schemas', () => {
  it('accepts create and archived edit payloads', () => {
    expect(createViaPackageSchema.safeParse(validPackage).success).toBe(true)
    expect(
      updateViaPackageSchema.safeParse({
        ...validPackage,
        id: '019dbbe0-d97c-7000-a000-000000000002',
        status: 'ARCHIVED',
      }).success,
    ).toBe(true)
  })
  it('validates slug and quantity tiers', () => {
    expect(
      createViaPackageSchema.safeParse({
        ...validPackage,
        slug: 'Facebook VIA US',
      }).success,
    ).toBe(false)
    expect(
      createViaPackageSchema.safeParse({
        ...validPackage,
        quantityPrices: validPackage.quantityPrices.slice(1),
      }).success,
    ).toBe(false)
    expect(
      createViaPackageSchema.safeParse({
        ...validPackage,
        quantityPrices: [
          validPackage.quantityPrices[0],
          validPackage.quantityPrices[0],
        ],
      }).success,
    ).toBe(false)
    expect(
      createViaPackageSchema.safeParse({ ...validPackage, defaultPrice: 60000 })
        .success,
    ).toBe(false)
    expect(
      createViaPackageSchema.safeParse({
        ...validPackage,
        quantityPrices: [{ quantity: 1, amount: 50000, discountPercent: 101 }],
      }).success,
    ).toBe(false)
  })
  it('restricts pagination and detail IDs', () => {
    expect(listViaPackagesSchema.safeParse({ page: 0 }).success).toBe(false)
    expect(getViaPackageSchema.safeParse({ id: 'invalid' }).success).toBe(false)
  })
})
