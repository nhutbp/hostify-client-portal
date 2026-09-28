import { prisma } from '../../../db/prisma'
import { createId } from '../../../common/id.server'
import type { Prisma } from '../../../../prisma/generated/client.js'
import type {
  CreateProxyPackageInput,
  ListProxyPackagesInput,
  UpdateProxyPackageInput,
} from './proxy.schemas'

type ProxyInput = CreateProxyPackageInput | UpdateProxyPackageInput

function proxyFeatures(input: ProxyInput) {
  return {
    proxyType: input.proxyType,
    displayCategory: input.displayCategory,
    country: input.country,
    ipMode: input.ipMode,
    protocols: input.protocols,
    ipDelivery: input.ipDelivery,
    bandwidthGb: input.bandwidthGb,
    concurrentConnections: input.concurrentConnections,
    autoRotation: input.autoRotation,
    whitelistIp: input.whitelistIp,
    cityTargeting: input.cityTargeting,
    ipReplacement: input.ipReplacement,
    cleanIp: input.cleanIp,
    apiSupport: input.apiSupport,
    ipWarranty: input.ipWarranty,
    support24h: input.support24h,
  }
}

export async function listProxyPackageRecords(input: ListProxyPackagesInput) {
  const where: Prisma.ProductWhereInput = {
    category: { slug: 'proxy', kind: 'SERVICE', deletedAt: null },
    ...(input.status ? { status: input.status } : {}),
    ...(input.providerCategoryId
      ? { providerCategoryId: input.providerCategoryId }
      : {}),
    ...(input.search
      ? {
          OR: [
            { name: { contains: input.search, mode: 'insensitive' } },
            { code: { contains: input.search, mode: 'insensitive' } },
            { description: { contains: input.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  }
  const [records, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (input.page - 1) * input.limit,
      take: input.limit,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        status: true,
        createdAt: true,
        providerCategory: { select: { name: true } },
        plans: {
          orderBy: { createdAt: 'asc' },
          take: 1,
          select: {
            features: true,
            prices: {
              where: { effectiveTo: null, billingCycle: 'MONTHLY' },
              orderBy: { effectiveFrom: 'desc' },
              take: 1,
              select: { amountMinor: true, currency: true },
            },
          },
        },
      },
    }),
    prisma.product.count({ where }),
  ])
  return {
    items: records.map((record) => {
      const raw = record.plans[0]?.features
      const features =
        raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}
      const price = record.plans[0]?.prices[0]
      return {
        id: record.id,
        code: record.code,
        name: record.name,
        description: record.description ?? '',
        status: record.status,
        provider: record.providerCategory?.name ?? null,
        proxyType:
          typeof features.proxyType === 'string' ? features.proxyType : '',
        country: typeof features.country === 'string' ? features.country : '',
        ipMode: typeof features.ipMode === 'string' ? features.ipMode : '',
        protocols: Array.isArray(features.protocols)
          ? features.protocols.filter(
              (item): item is string => typeof item === 'string',
            )
          : [],
        price: price
          ? { amount: Number(price.amountMinor), currency: price.currency }
          : null,
        createdAt: record.createdAt.toISOString(),
      }
    }),
    meta: {
      page: input.page,
      limit: input.limit,
      total,
      totalPages: Math.ceil(total / input.limit),
      hasPrevious: input.page > 1,
      hasNext: input.page * input.limit < total,
    },
  }
}

export function getProxyCreationReferences(providerCategoryId: string) {
  return Promise.all([
    prisma.productCategory.findFirst({
      where: { slug: 'proxy', kind: 'SERVICE', deletedAt: null },
      select: { id: true },
    }),
    prisma.productCategory.findFirst({
      where: {
        id: providerCategoryId,
        kind: 'PROVIDER',
        deletedAt: null,
        parent: { slug: 'nha-cung-cap', kind: 'PROVIDER', deletedAt: null },
      },
      select: { id: true },
    }),
  ])
}

function metas(input: ProxyInput) {
  return [
    {
      metaKey: 'defaultPrice',
      metaValue: input.defaultPrice as Prisma.InputJsonValue,
      valueType: 'number',
      isPublic: true,
    },
    {
      metaKey: 'billingPrices',
      metaValue: input.billingPrices as Prisma.InputJsonValue,
      valueType: 'array',
      isPublic: false,
    },
  ]
}

export function createProxyPackageRecord(
  input: CreateProxyPackageInput,
  categoryId: string,
) {
  return prisma.$transaction(async (tx) => {
    const id = createId()
    const code = `PROXY-${id.toUpperCase()}`
    await tx.product.create({
      data: {
        id,
        code,
        slug: input.slug,
        categoryId,
        providerCategoryId: input.providerCategoryId,
        name: input.name,
        description: input.description,
        content: input.content,
        status: input.status,
        metas: {
          create: metas(input).map((meta) => ({ id: createId(), ...meta })),
        },
      },
    })
    const plan = await tx.plan.create({
      data: {
        id: createId(),
        productId: id,
        code: `${code}-PLAN`,
        name: input.name,
        status: input.status,
        features: proxyFeatures(input),
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
        effectiveFrom: new Date(),
        status: input.status,
      })),
    })
    return { id, slug: input.slug }
  })
}

export async function getProxyPackageRecord(id: string) {
  const product = await prisma.product.findFirst({
    where: {
      id,
      category: { slug: 'proxy', kind: 'SERVICE', deletedAt: null },
    },
    include: {
      providerCategory: { select: { id: true, name: true, description: true } },
      metas: { select: { metaKey: true, metaValue: true } },
      plans: {
        orderBy: { createdAt: 'asc' },
        include: {
          prices: {
            where: { effectiveTo: null },
            orderBy: { effectiveFrom: 'desc' },
          },
        },
      },
    },
  })
  if (!product) return null
  const metadata = Object.fromEntries(
    product.metas.map((meta) => [meta.metaKey, meta.metaValue]),
  )
  const raw = product.plans[0]?.features
  const features =
    raw && typeof raw === 'object' && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {}
  return {
    id: product.id,
    code: product.code,
    slug: product.slug,
    name: product.name,
    description: product.description ?? '',
    content: product.content,
    status: product.status,
    providerCategory: product.providerCategory,
    defaultPrice:
      typeof metadata.defaultPrice === 'number' ? metadata.defaultPrice : 0,
    billingPrices: Array.isArray(metadata.billingPrices)
      ? metadata.billingPrices
      : [],
    features: {
      proxyType:
        typeof features.proxyType === 'string'
          ? features.proxyType
          : 'RESIDENTIAL',
      displayCategory:
        typeof features.displayCategory === 'string'
          ? features.displayCategory
          : '',
      country: typeof features.country === 'string' ? features.country : 'US',
      ipMode: typeof features.ipMode === 'string' ? features.ipMode : 'STATIC',
      protocols: Array.isArray(features.protocols)
        ? features.protocols.filter(
            (item): item is string => typeof item === 'string',
          )
        : [],
      ipDelivery:
        typeof features.ipDelivery === 'string'
          ? features.ipDelivery
          : 'INSTANT',
      bandwidthGb:
        typeof features.bandwidthGb === 'number' ? features.bandwidthGb : -1,
      concurrentConnections:
        typeof features.concurrentConnections === 'number'
          ? features.concurrentConnections
          : 1,
      autoRotation: features.autoRotation === true,
      whitelistIp: features.whitelistIp === true,
      cityTargeting: features.cityTargeting === true,
      ipReplacement: features.ipReplacement === true,
      cleanIp: features.cleanIp === true,
      apiSupport: features.apiSupport === true,
      ipWarranty: features.ipWarranty === true,
      support24h: features.support24h === true,
    },
    prices: (product.plans[0]?.prices ?? []).map((price) => ({
      id: price.id,
      billingCycle: price.billingCycle,
      currency: price.currency,
      amountMinor: Number(price.amountMinor),
      status: price.status,
      effectiveFrom: price.effectiveFrom.toISOString(),
    })),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }
}

export function updateProxyPackageRecord(input: UpdateProxyPackageInput) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findFirst({
      where: {
        id: input.id,
        category: { slug: 'proxy', kind: 'SERVICE', deletedAt: null },
      },
      select: { id: true, code: true },
    })
    if (!product) return null
    const now = new Date()
    await tx.product.update({
      where: { id: product.id },
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
        content: input.content,
        status: input.status,
        providerCategoryId: input.providerCategoryId,
      },
    })
    for (const meta of metas(input)) {
      await tx.productMeta.upsert({
        where: {
          productId_metaKey: { productId: product.id, metaKey: meta.metaKey },
        },
        update: { metaValue: meta.metaValue, valueType: meta.valueType },
        create: { id: createId(), productId: product.id, ...meta },
      })
    }
    const existingPlan = await tx.plan.findFirst({
      where: { productId: product.id },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    })
    const plan = existingPlan
      ? await tx.plan.update({
          where: { id: existingPlan.id },
          data: {
            name: input.name,
            status: input.status,
            features: proxyFeatures(input),
          },
        })
      : await tx.plan.create({
          data: {
            id: createId(),
            productId: product.id,
            code: `${product.code}-PLAN`,
            name: input.name,
            status: input.status,
            features: proxyFeatures(input),
          },
        })
    await tx.price.updateMany({
      where: { planId: plan.id, effectiveTo: null },
      data: { effectiveTo: now },
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
        status: input.status,
      })),
    })
    return { id: product.id, slug: input.slug }
  })
}
