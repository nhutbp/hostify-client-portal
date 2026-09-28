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

export function money(amountMinor: number) {
  return `${new Intl.NumberFormat('vi-VN').format(amountMinor)} đ`
}
