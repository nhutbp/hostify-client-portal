import { describe, expect, it } from 'vitest'
import {
  createPhysicalPackageSchema,
  getPhysicalPackageSchema,
  listPhysicalPackagesSchema,
  updatePhysicalPackageSchema,
} from './physical.schemas'

const validPackage = {
  name: 'Dedicated Pro',
  slug: 'dedicated-pro',
  description: 'Máy chủ vật lý hiệu suất cao',
  cpuModel: 'Intel Xeon E-2388G',
  cpuCores: 8,
  ramGb: 32,
  storageGb: 500,
  storageType: 'NVME',
  bandwidthMbps: 1000,
  ipCount: 1,
  defaultPrice: 2500000,
  billingPrices: [
    { billingCycle: 'MONTHLY', amount: 2500000, discountPercent: 0 },
  ],
  providerCategoryId: '019dbbe0-d97c-7000-a000-000000000001',
}

describe('physical package schemas', () => {
  it('accepts a physical server package with valid hardware and price', () => {
    expect(createPhysicalPackageSchema.safeParse(validPackage).success).toBe(
      true,
    )
  })

  it('rejects invalid slug, hardware and missing monthly price', () => {
    expect(
      createPhysicalPackageSchema.safeParse({
        ...validPackage,
        slug: 'Dedicated Pro',
      }).success,
    ).toBe(false)
    expect(
      createPhysicalPackageSchema.safeParse({ ...validPackage, cpuCores: 0 })
        .success,
    ).toBe(false)
    expect(
      createPhysicalPackageSchema.safeParse({
        ...validPackage,
        billingPrices: [
          { billingCycle: 'YEARLY', amount: 25000000, discountPercent: 10 },
        ],
      }).success,
    ).toBe(false)
  })

  it('rejects duplicate billing cycles and invalid pagination', () => {
    expect(
      createPhysicalPackageSchema.safeParse({
        ...validPackage,
        billingPrices: [
          validPackage.billingPrices[0],
          validPackage.billingPrices[0],
        ],
      }).success,
    ).toBe(false)
    expect(listPhysicalPackagesSchema.safeParse({ page: 0 }).success).toBe(
      false,
    )
  })

  it('requires a UUID and applies creation rules to edits', () => {
    const id = '019dbbe0-d97c-7000-a000-000000000002'
    expect(getPhysicalPackageSchema.safeParse({ id }).success).toBe(true)
    expect(getPhysicalPackageSchema.safeParse({ id: 'bad' }).success).toBe(
      false,
    )
    expect(
      updatePhysicalPackageSchema.safeParse({ ...validPackage, id }).success,
    ).toBe(true)
    expect(
      updatePhysicalPackageSchema.safeParse({
        ...validPackage,
        id,
        status: 'ARCHIVED',
      }).success,
    ).toBe(true)
    expect(
      createPhysicalPackageSchema.safeParse({
        ...validPackage,
        status: 'ARCHIVED',
      }).success,
    ).toBe(false)
    expect(
      updatePhysicalPackageSchema.safeParse({ ...validPackage, id, ramGb: 0 })
        .success,
    ).toBe(false)
    expect(
      updatePhysicalPackageSchema.safeParse({ ...validPackage, id: 'bad' })
        .success,
    ).toBe(false)
  })
})
