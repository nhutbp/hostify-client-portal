export type BillingCycle = 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL' | 'YEARLY'
export type HostingDetailsTab = 'resources' | 'pricing' | 'provider'

export type HostingPriceDraft = {
  billingCycle: BillingCycle
  amount: string
  discountPercent: string
}

export type HostingFormDraft = {
  name: string
  slug: string
  description: string
  content: string
  status: 'ACTIVE' | 'DRAFT'
  featured: boolean
  displayOrder: string
  tags: string
  imageUrl: string
  storageGb: string
  storageUnit: 'GB' | 'TB'
  bandwidthGb: string
  bandwidthUnit: 'GB' | 'TB'
  websites: string
  databases: string
  cpuCores: string
  ramGb: string
  emailAccounts: string
  addonDomains: string
  controlPanel: boolean
  freeSsl: boolean
  automaticBackups: boolean
  malwareProtection: boolean
  freeDomain: boolean
  multiplePhpVersions: boolean
  cronJobs: boolean
  staging: boolean
  defaultPrice: string
  billingPrices: HostingPriceDraft[]
  providerCategoryId: string
}

export const hostingCycles: BillingCycle[] = [
  'MONTHLY',
  'QUARTERLY',
  'SEMI_ANNUAL',
  'YEARLY',
]

export const initialHostingForm: HostingFormDraft = {
  name: 'Hosting Pro',
  slug: 'hosting-pro',
  description:
    'Hosting hiệu suất cao, phù hợp cho website doanh nghiệp, cửa hàng online.',
  content:
    '<p>Gói hosting hiệu suất cao, sử dụng ổ cứng SSD NVMe, tốc độ truy cập nhanh, phù hợp cho website doanh nghiệp, cửa hàng online, blog cá nhân...</p>',
  status: 'ACTIVE',
  featured: false,
  displayOrder: '0',
  tags: '',
  imageUrl: '',
  storageGb: '10',
  storageUnit: 'GB',
  bandwidthGb: '100',
  bandwidthUnit: 'GB',
  websites: '10',
  databases: '10',
  cpuCores: '1',
  ramGb: '1',
  emailAccounts: '20',
  addonDomains: '5',
  controlPanel: true,
  freeSsl: true,
  automaticBackups: true,
  malwareProtection: true,
  freeDomain: false,
  multiplePhpVersions: false,
  cronJobs: false,
  staging: false,
  defaultPrice: '299000',
  billingPrices: [
    { billingCycle: 'MONTHLY', amount: '299000', discountPercent: '0' },
    { billingCycle: 'QUARTERLY', amount: '850000', discountPercent: '5' },
    { billingCycle: 'SEMI_ANNUAL', amount: '1600000', discountPercent: '10' },
    { billingCycle: 'YEARLY', amount: '2800000', discountPercent: '15' },
  ],
  providerCategoryId: '',
}
