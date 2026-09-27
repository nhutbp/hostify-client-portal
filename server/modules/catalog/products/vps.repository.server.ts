import { prisma } from '../../../db/prisma'
import { createId } from '../../../common/id.server'
import type { Prisma } from '../../../../prisma/generated/client.js'
import type {
  CreateVpsPackageInput,
  ListVpsPackagesInput,
  SetVpsPackageStatusInput,
} from './vps.schemas'

export function listVpsCatalogLookups() {
  return Promise.all([
    prisma.provider.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { code: 'asc' },
      select: { id: true, code: true, providerType: true },
    }),
    prisma.datacenter.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        code: true,
        name: true,
        countryCode: true,
        city: true,
        providerId: true,
      },
    }),
    prisma.productCategory.findMany({
      where: { deletedAt: null, kind: 'SERVICE' },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    }),
    prisma.productTag.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    }),
    prisma.productCategory.findMany({
      where: {
        kind: 'PROVIDER',
        deletedAt: null,
        parent: { slug: 'nha-cung-cap', kind: 'PROVIDER', deletedAt: null },
      },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true, imageUrl: true },
    }),
  ]).then(([providers, datacenters, categories, tags, providerCategories]) => ({
    providers,
    datacenters,
    categories,
    tags,
    providerCategories,
  }))
}

export async function listVpsPackageRecords(input: ListVpsPackagesInput) {
  const where: Prisma.ProductWhereInput = {
    category: { slug: input.categorySlug, kind: 'SERVICE', deletedAt: null },
    ...(input.status ? { status: input.status } : {}),
    ...(input.search
      ? {
          OR: [
            { name: { contains: input.search, mode: 'insensitive' } },
            { code: { contains: input.search, mode: 'insensitive' } },
            { description: { contains: input.search, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(input.providerCategoryId
      ? { providerCategoryId: input.providerCategoryId }
      : {}),
    ...(input.datacenterId
      ? {
          metas: {
            some: {
              metaKey: 'datacenterIds',
              metaValue: { array_contains: [input.datacenterId] },
            },
          },
        }
      : {}),
  }
  const [records, total, categories, datacenters] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (input.page - 1) * input.limit,
      take: input.limit,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: {
        category: { select: { slug: true } },
        providerCategory: { select: { id: true, name: true } },
        metas: true,
        plans: {
          orderBy: { createdAt: 'asc' },
          include: { prices: { orderBy: { effectiveFrom: 'desc' } } },
        },
      },
    }),
    prisma.product.count({ where }),
    prisma.productCategory.findMany({
      where: { deletedAt: null, kind: 'SERVICE' },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        slug: true,
        name: true,
        _count: { select: { products: true } },
      },
    }),
    prisma.datacenter.findMany({
      select: { id: true, name: true, countryCode: true, city: true },
    }),
  ])
  const datacenterById = new Map(datacenters.map((item) => [item.id, item]))
  const items = records.map((record) => {
    const metadata = Object.fromEntries(
      record.metas.map((item) => [item.metaKey, item.metaValue]),
    )
    const plan = record.plans[0]
    const features =
      plan?.features &&
      typeof plan.features === 'object' &&
      !Array.isArray(plan.features)
        ? (plan.features as Record<string, unknown>)
        : {}
    const datacenterIds = Array.isArray(metadata.datacenterIds)
      ? metadata.datacenterIds.filter(
          (id): id is string => typeof id === 'string',
        )
      : []
    const location = datacenterIds
      .map((id) => datacenterById.get(id))
      .find(Boolean)
    const monthlyPrice =
      plan?.prices.find(
        (price) =>
          price.billingCycle === 'MONTHLY' && price.status === record.status,
      ) ?? plan?.prices.find((price) => price.billingCycle === 'MONTHLY')
    return {
      id: record.id,
      code: record.code,
      name: record.name,
      description: record.description ?? '',
      category: record.category.slug,
      status: record.status,
      featured: metadata.featured === true,
      cpu: Number(features.cpu ?? 0),
      ramGb: Number(features.ramGb ?? 0),
      diskGb: Number(features.diskGb ?? 0),
      diskType: String(features.diskType ?? ''),
      monthlyPrice: monthlyPrice ? Number(monthlyPrice.amountMinor) : null,
      provider: record.providerCategory?.name ?? '—',
      location: location?.name ?? '',
      countryCode: location?.countryCode ?? '',
      createdAt: record.createdAt.toISOString(),
    }
  })
  return {
    items,
    meta: {
      page: input.page,
      limit: input.limit,
      total,
      totalPages: Math.ceil(total / input.limit),
      hasPrevious: input.page > 1,
      hasNext: input.page * input.limit < total,
    },
    categories: categories
      .map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        count: item._count.products,
      }))
      .sort((a, b) => {
        const order = ['vps', 'hosting', 'physical', 'proxy', 'via']
        const aIndex = order.indexOf(a.slug)
        const bIndex = order.indexOf(b.slug)
        return (
          (aIndex < 0 ? order.length : aIndex) -
            (bIndex < 0 ? order.length : bIndex) || a.name.localeCompare(b.name)
        )
      }),
  }
}

export async function setVpsPackageStatusRecord(
  input: SetVpsPackageStatusInput,
) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id: input.id },
      select: { id: true },
    })
    if (!product) return null
    await tx.product.update({
      where: { id: input.id },
      data: { status: input.status },
    })
    await tx.plan.updateMany({
      where: { productId: input.id },
      data: { status: input.status },
    })
    const plans = await tx.plan.findMany({
      where: { productId: input.id },
      select: { id: true },
    })
    await tx.price.updateMany({
      where: { planId: { in: plans.map((plan) => plan.id) } },
      data: { status: input.status },
    })
    return { id: input.id, status: input.status }
  })
}

export function createVpsPackageRecord(
  input: CreateVpsPackageInput,
  code: string,
) {
  const now = new Date()
  return prisma.$transaction(async (tx) => {
    const providerCategory = await tx.productCategory.findFirst({
      where: {
        id: input.providerCategoryId,
        kind: 'PROVIDER',
        deletedAt: null,
        parent: { slug: 'nha-cung-cap', kind: 'PROVIDER', deletedAt: null },
      },
      select: { id: true },
    })
    if (!providerCategory) throw new Error('Nhà cung cấp không hợp lệ')
    const datacenters = await tx.datacenter.findMany({
      where: {
        id: { in: input.datacenterIds },
        status: 'ACTIVE',
        provider: { status: 'ACTIVE' },
      },
      select: { id: true, code: true, name: true, providerId: true },
    })
    if (
      datacenters.length !== input.datacenterIds.length ||
      datacenters.some((item) => item.providerId !== datacenters[0]?.providerId)
    )
      throw new Error(
        'Các datacenter phải thuộc cùng một provider hạ tầng đang hoạt động',
      )
    const infrastructureProviderId = datacenters[0].providerId
    const category = await tx.productCategory.findFirst({
      where: { slug: 'vps', kind: 'SERVICE', deletedAt: null },
      select: { id: true },
    })
    if (!category) throw new Error('Danh mục VPS không hợp lệ')
    const metadata = {
      featured: input.featured,
      displayOrder: input.displayOrder,
      tags: input.tags,
      imageUrl: input.imageUrl ?? null,
      providerId: infrastructureProviderId,
      datacenterIds: datacenters.map((item) => item.id),
      datacenters,
      billingPrices: input.billingPrices,
      operatingSystem: input.operatingSystem,
    }
    const product = await tx.product.create({
      data: {
        id: createId(),
        code,
        categoryId: category.id,
        providerCategoryId: providerCategory.id,
        name: input.name,
        description: input.description,
        content: input.content,
        status: input.status,
        metas: {
          create: Object.entries(metadata)
            .filter((entry) => entry[1] !== null)
            .map(([metaKey, metaValue]) => ({
              id: createId(),
              metaKey,
              metaValue: metaValue as Prisma.InputJsonValue,
              valueType: Array.isArray(metaValue) ? 'array' : typeof metaValue,
              isPublic: [
                'featured',
                'tags',
                'imageUrl',
                'datacenterIds',
                'operatingSystem',
              ].includes(metaKey),
            })),
        },
      },
    })
    const plan = await tx.plan.create({
      data: {
        id: createId(),
        productId: product.id,
        code: `${code}-PLAN`,
        name: input.name,
        status: input.status === 'ACTIVE' ? 'ACTIVE' : 'DRAFT',
        features: {
          cpu: input.cpu,
          ramGb: input.ramGb,
          diskGb: input.diskGb,
          diskType: input.diskType,
          operatingSystem: input.operatingSystem,
          bandwidth: input.bandwidth,
          ipCount: input.ipCount,
          providerId: infrastructureProviderId,
          datacenterIds: datacenters.map((item) => item.id),
          tags: input.tags,
        },
      },
    })
    await tx.price.createMany({
      data: input.billingPrices.map((price) => ({
        id: createId(),
        planId: plan.id,
        currency: 'VND',
        billingCycle: price.billingCycle,
        amountMinor: BigInt(
          Math.round(price.amount * (1 - price.discountPercent / 100)),
        ),
        setupFeeMinor: BigInt(0),
        effectiveFrom: now,
        status: input.status === 'ACTIVE' ? 'ACTIVE' : 'DRAFT',
      })),
    })
    return tx.product.findUnique({
      where: { id: product.id },
      include: { plans: { include: { prices: true } } },
    })
  })
}
