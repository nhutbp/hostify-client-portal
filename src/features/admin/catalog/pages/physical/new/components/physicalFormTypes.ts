export type PhysicalCycle = 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL' | 'YEARLY'
export const physicalCycles: PhysicalCycle[] = [
  'MONTHLY',
  'QUARTERLY',
  'SEMI_ANNUAL',
  'YEARLY',
]
export type PhysicalPriceDraft = {
  billingCycle: PhysicalCycle
  amount: string
  discountPercent: string
}
export type PhysicalFormDraft = {
  name: string
  slug: string
  description: string
  content: string
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
  featured: boolean
  displayOrder: string
  imageUrl: string
  cpuModel: string
  cpuCores: string
  ramGb: string
  storageGb: string
  storageType: 'HDD' | 'SSD' | 'NVME'
  bandwidthMbps: string
  ipCount: string
  location: string
  defaultPrice: string
  billingPrices: PhysicalPriceDraft[]
  providerCategoryId: string
}

export const initialPhysicalForm: PhysicalFormDraft = {
  name: '',
  slug: '',
  description: '',
  content: '',
  status: 'DRAFT',
  featured: false,
  displayOrder: '0',
  imageUrl: '',
  cpuModel: '',
  cpuCores: '8',
  ramGb: '32',
  storageGb: '500',
  storageType: 'NVME',
  bandwidthMbps: '1000',
  ipCount: '1',
  location: '',
  defaultPrice: '',
  billingPrices: [
    { billingCycle: 'MONTHLY', amount: '', discountPercent: '0' },
  ],
  providerCategoryId: '',
}
