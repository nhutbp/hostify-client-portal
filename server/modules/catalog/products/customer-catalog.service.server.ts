import { requireCustomer } from '../../identity/auth/customer-access.server'
import {
  listActiveDatacenters,
  listActiveProductsByCategory,
  listActiveServiceCategories,
} from './customer-catalog.repository.server'

function featureMap(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : []
}

export async function listCustomerCategories() {
  await requireCustomer()
  return listActiveServiceCategories()
}

export async function listCustomerPackages(category: string) {
  await requireCustomer()
  const products = await listActiveProductsByCategory(category, new Date())
  const datacenterIds = [
    ...new Set(
      products.flatMap((product) =>
        stringList(
          product.metas.find((meta) => meta.metaKey === 'datacenterIds')
            ?.metaValue,
        ),
      ),
    ),
  ]
  const datacenters = datacenterIds.length
    ? await listActiveDatacenters(datacenterIds)
    : []
  const datacenterById = new Map(datacenters.map((item) => [item.id, item]))

  return products
    .flatMap((product) => {
      const metas = Object.fromEntries(
        product.metas.map((meta) => [meta.metaKey, meta.metaValue]),
      )
      const assignedIds = stringList(metas.datacenterIds)
      const locations = assignedIds.flatMap((id) => {
        const datacenter = datacenterById.get(id)
        return datacenter
          ? [
              {
                id: datacenter.id,
                name: datacenter.name,
                city: datacenter.city ?? '',
                countryCode: datacenter.countryCode,
              },
            ]
          : []
      })
      if ((assignedIds.length || category === 'vps') && !locations.length)
        return []

      return product.plans.flatMap((plan) => {
        const features = featureMap(plan.features)
        const prices: Record<string, number> = {}
        const setupFees: Record<string, number> = {}
        for (const price of plan.prices) {
          if (prices[price.billingCycle] !== undefined) continue
          prices[price.billingCycle] = Number(price.amountMinor)
          setupFees[price.billingCycle] = Number(price.setupFeeMinor)
        }
        if (!Object.keys(prices).length) return []

        const details =
          category === 'hosting'
            ? [
                `${features.websites ?? 0} website`,
                `${features.databases ?? 0} database`,
                `${features.emailAccounts ?? 0} email account`,
              ]
            : category === 'proxy'
              ? [features.proxyType, features.country, features.ipMode]
                  .map((item) => String(item ?? ''))
                  .filter(Boolean)
              : category === 'via'
                ? [features.platform, features.country, features.accountType]
                    .map((item) => String(item ?? ''))
                    .filter(Boolean)
                : []

        return [
          {
            id: product.id,
            slug: product.slug,
            name: product.plans.length === 1 ? product.name : plan.name,
            description: product.description ?? '',
            category,
            planId: plan.id,
            isCustom: plan.isCustom,
            features: {
              cpu: Number(features.cpu ?? features.cpuCores ?? 0),
              ramGb: Number(features.ramGb ?? 0),
              diskGb: Number(features.diskGb ?? features.storageGb ?? 0),
              diskType: String(features.diskType ?? features.storageType ?? ''),
              bandwidth: features.bandwidth
                ? String(features.bandwidth)
                : features.bandwidthGb
                  ? `${features.bandwidthGb} GB/tháng`
                  : '',
              ipCount: Number(features.ipCount ?? 0),
            },
            details,
            locations,
            prices,
            setupFees,
            featured: metas.featured === true,
            displayOrder: Number(metas.displayOrder ?? 0),
          },
        ]
      })
    })
    .sort((a, b) => a.displayOrder - b.displayOrder)
}
