import { describe, expect, it } from 'vitest'
import {
  createHostingPackageSchema,
  getHostingPackageSchema,
  updateHostingPackageSchema,
} from './hosting.schemas'

const validPackage = {
  name: 'Hosting Pro',
  slug: 'hosting-pro',
  description: 'Hosting dành cho website doanh nghiệp',
  content: '<p>Hosting Pro</p>',
  storageGb: 10,
  bandwidthGb: 100,
  websites: 10,
  databases: 10,
  cpuCores: 1,
  ramGb: 1,
  emailAccounts: 20,
  addonDomains: 5,
  controlPanel: true,
  freeSsl: true,
  automaticBackups: true,
  malwareProtection: true,
  freeDomain: false,
  multiplePhpVersions: false,
  cronJobs: false,
  staging: false,
  defaultPrice: 299000,
  billingPrices: [
    { billingCycle: 'MONTHLY', amount: 299000, discountPercent: 0 },
    { billingCycle: 'QUARTERLY', amount: 850000, discountPercent: 5 },
  ],
  providerCategoryId: '019dbbe0-d97c-7000-a000-000000000001',
}

describe('createHostingPackageSchema', () => {
  it('accepts the resources and price schedule for a Hosting package', () => {
    expect(createHostingPackageSchema.safeParse(validPackage).success).toBe(
      true,
    )
  })

  it('requires a valid slug and a unique monthly billing cycle', () => {
    expect(
      createHostingPackageSchema.safeParse({
        ...validPackage,
        slug: 'Hosting Pro',
      }).success,
    ).toBe(false)
    expect(
      createHostingPackageSchema.safeParse({
        ...validPackage,
        billingPrices: [validPackage.billingPrices[1]],
      }).success,
    ).toBe(false)
    expect(
      createHostingPackageSchema.safeParse({
        ...validPackage,
        billingPrices: [
          validPackage.billingPrices[0],
          validPackage.billingPrices[0],
        ],
      }).success,
    ).toBe(false)
  })

  it('accepts -1 for unlimited resources and rejects negative prices', () => {
    expect(
      createHostingPackageSchema.safeParse({
        ...validPackage,
        websites: -1,
        bandwidthGb: -1,
      }).success,
    ).toBe(true)
    expect(
      createHostingPackageSchema.safeParse({
        ...validPackage,
        defaultPrice: -1,
      }).success,
    ).toBe(false)
  })

  it('accepts VPS-style basic information and rejects invalid display order', () => {
    const result = createHostingPackageSchema.safeParse({
      ...validPackage,
      status: 'DRAFT',
      featured: true,
      displayOrder: 2,
      tags: ['Phổ biến', 'Doanh nghiệp'],
      imageUrl: '/media/hosting-pro.png',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe('DRAFT')
      expect(result.data.tags).toEqual(['Phổ biến', 'Doanh nghiệp'])
    }
    expect(
      createHostingPackageSchema.safeParse({
        ...validPackage,
        displayOrder: -1,
      }).success,
    ).toBe(false)
  })
})

describe('Hosting detail and update schemas', () => {
  const id = '019dbbe0-d97c-7000-a000-000000000002'

  it('requires a UUID for detail and update', () => {
    expect(getHostingPackageSchema.safeParse({ id }).success).toBe(true)
    expect(getHostingPackageSchema.safeParse({ id: 'invalid' }).success).toBe(
      false,
    )
    expect(
      updateHostingPackageSchema.safeParse({ ...validPackage, id }).success,
    ).toBe(true)
    expect(
      updateHostingPackageSchema.safeParse({ ...validPackage, id: 'invalid' })
        .success,
    ).toBe(false)
  })

  it('validates edits with the same resource and price rules as creation', () => {
    expect(
      updateHostingPackageSchema.safeParse({
        ...validPackage,
        id,
        defaultPrice: -1,
      }).success,
    ).toBe(false)
    expect(
      updateHostingPackageSchema.safeParse({
        ...validPackage,
        id,
        billingPrices: [],
      }).success,
    ).toBe(false)
  })
})
