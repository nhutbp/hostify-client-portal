export type ProxyCycle = 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL' | 'YEARLY'
export type ProxyDetailsTab =
  'configuration' | 'features' | 'pricing' | 'provider'
export const proxyCycles: ProxyCycle[] = [
  'MONTHLY',
  'QUARTERLY',
  'SEMI_ANNUAL',
  'YEARLY',
]
export const proxyFeatureKeys = [
  'autoRotation',
  'whitelistIp',
  'cityTargeting',
  'ipReplacement',
  'cleanIp',
  'apiSupport',
  'ipWarranty',
  'support24h',
] as const
export type ProxyFeatureKey = (typeof proxyFeatureKeys)[number]
export type ProxyFormDraft = {
  name: string
  slug: string
  description: string
  content: string
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
  proxyType: 'RESIDENTIAL' | 'DATACENTER' | 'MOBILE'
  displayCategory: string
  country: 'US' | 'VN' | 'SG' | 'JP' | 'DE'
  ipMode: 'STATIC' | 'ROTATING'
  protocols: ('HTTP' | 'HTTPS' | 'SOCKS5')[]
  ipDelivery: 'INSTANT' | 'MANUAL'
  bandwidthGb: string
  concurrentConnections: string
  autoRotation: boolean
  whitelistIp: boolean
  cityTargeting: boolean
  ipReplacement: boolean
  cleanIp: boolean
  apiSupport: boolean
  ipWarranty: boolean
  support24h: boolean
  defaultPrice: string
  billingPrices: {
    billingCycle: ProxyCycle
    amount: string
    discountPercent: string
  }[]
  providerCategoryId: string
}
export const initialProxyForm: ProxyFormDraft = {
  name: '',
  slug: '',
  description: '',
  content: '',
  status: 'ACTIVE',
  proxyType: 'RESIDENTIAL',
  displayCategory: 'Proxy dân cư',
  country: 'US',
  ipMode: 'STATIC',
  protocols: ['HTTP', 'HTTPS'],
  ipDelivery: 'INSTANT',
  bandwidthGb: '-1',
  concurrentConnections: '1',
  autoRotation: false,
  whitelistIp: false,
  cityTargeting: false,
  ipReplacement: false,
  cleanIp: false,
  apiSupport: false,
  ipWarranty: false,
  support24h: false,
  defaultPrice: '',
  billingPrices: [
    { billingCycle: 'MONTHLY', amount: '', discountPercent: '0' },
  ],
  providerCategoryId: '',
}
