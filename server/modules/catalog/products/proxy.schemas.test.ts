import { describe, expect, it } from 'vitest'
import {
  createProxyPackageSchema,
  getProxyPackageSchema,
  listProxyPackagesSchema,
  updateProxyPackageSchema,
} from './proxy.schemas'

const validPackage = {
  name: 'Proxy Residential US',
  slug: 'proxy-residential-us',
  description: 'Proxy dân cư IP Mỹ',
  proxyType: 'RESIDENTIAL',
  displayCategory: 'Proxy dân cư',
  country: 'US',
  ipMode: 'STATIC',
  protocols: ['HTTP', 'HTTPS'],
  ipDelivery: 'INSTANT',
  bandwidthGb: -1,
  concurrentConnections: 1,
  defaultPrice: 150000,
  billingPrices: [
    { billingCycle: 'MONTHLY', amount: 150000, discountPercent: 0 },
  ],
  providerCategoryId: '019dbbe0-d97c-7000-a000-000000000001',
}

describe('proxy package schemas', () => {
  it('accepts valid package and edit payloads', () => {
    expect(createProxyPackageSchema.safeParse(validPackage).success).toBe(true)
    expect(
      updateProxyPackageSchema.safeParse({
        ...validPackage,
        id: '019dbbe0-d97c-7000-a000-000000000002',
        status: 'ARCHIVED',
      }).success,
    ).toBe(true)
  })
  it('validates slug, protocols, bandwidth and prices', () => {
    expect(
      createProxyPackageSchema.safeParse({ ...validPackage, slug: 'Proxy US' })
        .success,
    ).toBe(false)
    expect(
      createProxyPackageSchema.safeParse({ ...validPackage, protocols: [] })
        .success,
    ).toBe(false)
    expect(
      createProxyPackageSchema.safeParse({
        ...validPackage,
        protocols: ['HTTP', 'HTTP'],
      }).success,
    ).toBe(false)
    expect(
      createProxyPackageSchema.safeParse({ ...validPackage, bandwidthGb: 0 })
        .success,
    ).toBe(false)
    expect(
      createProxyPackageSchema.safeParse({
        ...validPackage,
        billingPrices: [
          { billingCycle: 'YEARLY', amount: 1500000, discountPercent: 10 },
        ],
      }).success,
    ).toBe(false)
    expect(
      createProxyPackageSchema.safeParse({
        ...validPackage,
        billingPrices: [
          validPackage.billingPrices[0],
          validPackage.billingPrices[0],
        ],
      }).success,
    ).toBe(false)
  })
  it('restricts list pagination and detail identifiers', () => {
    expect(listProxyPackagesSchema.safeParse({ page: 0 }).success).toBe(false)
    expect(getProxyPackageSchema.safeParse({ id: 'bad' }).success).toBe(false)
  })
})
