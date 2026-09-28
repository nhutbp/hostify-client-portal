import { createAppError } from '../../../common/app-error.server'
import { requireCustomer } from '../../identity/auth/customer-access.server'
import {
  countMyCustomerServices,
  findMyCustomerServiceRecord,
  listMyCustomerServiceRecords,
  listMyServiceCategoryCounts,
  listServiceCategories,
} from './customer-services.repository.server'
import type { ListMyCustomerServicesInput } from './customer-services.schemas'

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function firstString(...values: unknown[]) {
  return (
    values.find(
      (value): value is string =>
        typeof value === 'string' && value.trim().length > 0,
    ) ?? null
  )
}

function summarizeService(
  record: Awaited<ReturnType<typeof listMyCustomerServiceRecords>>[number],
) {
  const config = objectValue(record.configuration)
  const orderedConfig = objectValue(record.orderItem?.configuration)
  const features = objectValue(record.plan?.features)
  const expiration = record.expiresAt?.toISOString() ?? null
  const daysRemaining = record.expiresAt
    ? Math.ceil((record.expiresAt.getTime() - Date.now()) / 86_400_000)
    : null
  const information = [
    firstString(
      config.ipAddress,
      config.primaryIp,
      config.ip,
      config.hostname,
      config.domain,
      config.email,
    ),
    record.resource?.externalId ?? null,
  ].filter(
    (value, index, values): value is string =>
      Boolean(value) && values.indexOf(value) === index,
  )
  const specifications =
    record.product.category.slug === 'vps' ||
    record.product.category.slug === 'physical'
      ? [
          (features.cpu ?? features.cpuCores)
            ? `${features.cpu ?? features.cpuCores} vCPU`
            : null,
          features.ramGb ? `${features.ramGb} GB RAM` : null,
          features.diskGb
            ? `${features.diskGb} GB ${features.diskType ?? ''}`.trim()
            : null,
        ]
      : record.product.category.slug === 'hosting'
        ? [
            (features.diskGb ?? features.storageGb)
              ? `${features.diskGb ?? features.storageGb} GB lưu trữ`
              : null,
            features.websites ? `${features.websites} website` : null,
          ]
        : [
            firstString(
              features.proxyType,
              features.platform,
              features.accountType,
            ),
            firstString(features.country, features.countryCode),
          ]
  return {
    id: record.id,
    serviceCode: record.serviceCode,
    productName: record.product.name,
    planName: record.plan?.name ?? null,
    category: record.product.category,
    provider:
      record.product.providerCategory?.name ??
      record.resource?.provider.code ??
      null,
    providerId:
      record.product.providerCategory?.id ??
      record.resource?.provider.id ??
      null,
    status: record.status,
    address: information[0] ?? null,
    details: specifications
      .filter((value): value is string => Boolean(value))
      .slice(0, 3),
    operatingSystem: firstString(
      config.operatingSystem,
      orderedConfig.operatingSystem,
    ),
    datacenter: record.resource?.datacenter?.name ?? null,
    amountMinor: record.orderItem
      ? Number(record.orderItem.unitAmountMinor)
      : null,
    currency: record.orderItem?.order.currency ?? null,
    billingCycle: firstString(orderedConfig.billingCycle, config.billingCycle),
    quantity: record.orderItem?.quantity ?? 1,
    expiresAt: expiration,
    daysRemaining,
    activatedAt: record.activatedAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
  }
}

export async function listMyCustomerServices(
  input: ListMyCustomerServicesInput,
) {
  const user = await requireCustomer()
  const [records, total, serviceCategories, ownedRecords] = await Promise.all([
    listMyCustomerServiceRecords(user.id, input),
    countMyCustomerServices(user.id, input),
    listServiceCategories(),
    listMyServiceCategoryCounts(user.id),
  ])
  const counts = new Map<string, number>()
  const providers = new Map<string, string>()
  for (const record of ownedRecords) {
    const slug = record.product.category.slug
    counts.set(slug, (counts.get(slug) ?? 0) + 1)
    const provider = record.product.providerCategory
    if (provider) providers.set(provider.id, provider.name)
    else if (record.resource?.provider)
      providers.set(record.resource.provider.id, record.resource.provider.code)
  }
  const priority = [
    'vps',
    'hosting',
    'physical',
    'proxy',
    'via',
    'other',
    'server',
    'domain',
  ]
  const categories = serviceCategories
    .map((category) => ({ ...category, count: counts.get(category.slug) ?? 0 }))
    .sort(
      (a, b) =>
        (priority.indexOf(a.slug) < 0 ? 99 : priority.indexOf(a.slug)) -
        (priority.indexOf(b.slug) < 0 ? 99 : priority.indexOf(b.slug)),
    )
  const totalPages = Math.ceil(total / input.limit)
  return {
    items: records.map(summarizeService),
    categories,
    providers: [...providers]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    totalServices: ownedRecords.length,
    meta: {
      page: input.page,
      limit: input.limit,
      total,
      totalPages,
      hasPrevious: input.page > 1,
      hasNext: input.page < totalPages,
    },
  }
}

export async function getMyCustomerService(id: string) {
  const user = await requireCustomer()
  const record = await findMyCustomerServiceRecord(user.id, id)
  if (!record)
    throw createAppError({
      message: 'Không tìm thấy dịch vụ hoặc bạn không có quyền truy cập',
      errorCode: 'SERVICE_NOT_FOUND',
      statusCode: 404,
    })
  return {
    ...summarizeService(record),
    events: record.events.map((event) => ({
      ...event,
      createdAt: event.createdAt.toISOString(),
    })),
    actions: record.actions.map((action) => ({
      ...action,
      requestedAt: action.requestedAt.toISOString(),
      completedAt: action.completedAt?.toISOString() ?? null,
    })),
    domains: record.domains,
  }
}
