export type ViaDetailsTab = 'configuration' | 'extras' | 'pricing' | 'provider'
export const viaExtraKeys = [
  'originalEmail',
  'originalPhone',
  'birthday',
  'loginBrowser',
  'backupCookie',
  'usageGuide',
] as const
export type ViaFormDraft = {
  name: string
  slug: string
  description: string
  content: string
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
  platform: 'FACEBOOK' | 'GOOGLE' | 'TIKTOK'
  country: 'US' | 'VN' | 'SG' | 'JP' | 'DE'
  accountType: 'VIA' | 'BM' | 'ADS'
  accountAge: 'NEW' | 'SIX_MONTHS' | 'ONE_YEAR'
  verification: 'VERIFIED' | 'UNVERIFIED'
  twoFactor: boolean
  changeLimit: 'UNLIMITED' | 'LIMITED' | 'NO_CHANGE'
  deliveryMethod: 'ACCOUNT_PASSWORD' | 'ACCOUNT_PASSWORD_2FA'
  warrantyDays: string
  originalEmail: boolean
  originalPhone: boolean
  birthday: boolean
  loginBrowser: boolean
  backupCookie: boolean
  usageGuide: boolean
  defaultPrice: string
  quantityPrices: {
    quantity: string
    amount: string
    discountPercent: string
  }[]
  providerCategoryId: string
}
export const initialViaForm: ViaFormDraft = {
  name: '',
  slug: '',
  description: '',
  content: '',
  status: 'ACTIVE',
  platform: 'FACEBOOK',
  country: 'US',
  accountType: 'VIA',
  accountAge: 'ONE_YEAR',
  verification: 'VERIFIED',
  twoFactor: true,
  changeLimit: 'UNLIMITED',
  deliveryMethod: 'ACCOUNT_PASSWORD',
  warrantyDays: '7',
  originalEmail: true,
  originalPhone: true,
  birthday: true,
  loginBrowser: true,
  backupCookie: false,
  usageGuide: true,
  defaultPrice: '',
  quantityPrices: [{ quantity: '1', amount: '', discountPercent: '0' }],
  providerCategoryId: '',
}
