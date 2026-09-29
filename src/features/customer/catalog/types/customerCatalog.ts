import type { customerCatalogService } from '../services/customerCatalogService'

export type CustomerCategory = Awaited<
  ReturnType<typeof customerCatalogService.categories>
>[number]
export type CustomerPackage = Awaited<
  ReturnType<typeof customerCatalogService.packages>
>[number]

export const cycleLabels: Record<string, string> = {
  MONTHLY: 'Tháng',
  QUARTERLY: 'Quý',
  SEMI_ANNUAL: '6 tháng',
  YEARLY: 'Năm',
  ONE_TIME: 'Một lần',
}

export function money(amountMinor: number, locale = 'vi') {
  if (locale.startsWith('en')) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amountMinor)
  }
  return `${new Intl.NumberFormat('vi-VN').format(amountMinor)} đ`
}
