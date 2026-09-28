import { useQuery } from '@tanstack/react-query'
import { customerCatalogService } from '../services/customerCatalogService'

export type BillingCycle =
  'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL' | 'YEARLY' | 'ONE_TIME'

export const customerCatalogKeys = {
  all: ['customer', 'catalog'] as const,
  categories: () => ['customer', 'catalog', 'categories'] as const,
  packages: (category: string) =>
    ['customer', 'catalog', 'packages', category] as const,
}

export function useCustomerCategories() {
  return useQuery({
    queryKey: customerCatalogKeys.categories(),
    queryFn: customerCatalogService.categories,
  })
}

export function useCustomerPackages(category: string) {
  return useQuery({
    queryKey: customerCatalogKeys.packages(category),
    queryFn: () => customerCatalogService.packages(category),
    enabled: Boolean(category),
  })
}
