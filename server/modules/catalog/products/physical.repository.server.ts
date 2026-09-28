import { prisma } from '../../../db/prisma'
import { createId } from '../../../common/id.server'
import type { Prisma } from '../../../../prisma/generated/client.js'
import type {
  CreatePhysicalPackageInput,
  ListPhysicalPackagesInput,
  UpdatePhysicalPackageInput,
} from './physical.schemas'

function physicalFeatures(
  input: Pick<
    UpdatePhysicalPackageInput,
    | 'cpuModel'
    | 'cpuCores'
    | 'ramGb'
    | 'storageGb'
    | 'storageType'
    | 'bandwidthMbps'
    | 'ipCount'
    | 'location'
  >,
) {
  return {
    cpuModel: input.cpuModel,
    cpuCores: input.cpuCores,
    ramGb: input.ramGb,
    storageGb: input.storageGb,
    storageType: input.storageType,
    bandwidthMbps: input.bandwidthMbps,
    ipCount: input.ipCount,
    location: input.location,
  }
}

export async function listPhysicalPackageRecords(
  input: ListPhysicalPackagesInput,
) {
  const where: Prisma.ProductWhereInput = {
    category: { slug: 'physical', kind: 'SERVICE', deletedAt: null },
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
      const features = record.plans[0]?.features
      const specs =
        features && typeof features === 'object' && !Array.isArray(features)
          ? features
          : {}
      const price = record.plans[0]?.prices[0]
      return {
        id: record.id,
        code: record.code,
        name: record.name,
        description: record.description ?? '',
        status: record.status,
        provider: record.providerCategory?.name ?? null,
        cpuModel: typeof specs.cpuModel === 'string' ? specs.cpuModel : '',
        cpuCores: typeof specs.cpuCores === 'number' ? specs.cpuCores : 0,
        ramGb: typeof specs.ramGb === 'number' ? specs.ramGb : 0,
        storageGb: typeof specs.storageGb === 'number' ? specs.storageGb : 0,
        storageType:
          typeof specs.storageType === 'string' ? specs.storageType : '',
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

export function getPhysicalCreationReferences(providerCategoryId: string) {
  return Promise.all([
    prisma.productCategory.findFirst({
      where: { slug: 'physical', kind: 'SERVICE', deletedAt: null },
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

export function createPhysicalPackageRecord(
  input: CreatePhysicalPackageInput,
  categoryId: string,
) {
  return prisma.$transaction(async (tx) => {
    const id = createId()
    const code = `PHYSICAL-${id.toUpperCase()}`
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
          create: [
            {
              id: createId(),
              metaKey: 'featured',
              metaValue: input.featured,
              valueType: 'boolean',
              isPublic: true,
            },
            {
              id: createId(),
              metaKey: 'displayOrder',
              metaValue: input.displayOrder,
              valueType: 'number',
              isPublic: true,
            },
            ...(input.imageUrl
              ? [
                  {
                    id: createId(),
                    metaKey: 'imageUrl',
                    metaValue: input.imageUrl,
                    valueType: 'string',
                    isPublic: true,
                  },
                ]
              : []),
            {
              id: createId(),
              metaKey: 'defaultPrice',
              metaValue: input.defaultPrice,
              valueType: 'number',
              isPublic: true,
            },
            {
              id: createId(),
              metaKey: 'billingPrices',
              metaValue: input.billingPrices as Prisma.InputJsonValue,
              valueType: 'array',
              isPublic: false,
            },
          ],
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
        features: physicalFeatures(input),
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

export async function getPhysicalPackageRecord(id: string) {
  const product = await prisma.product.findFirst({
    where: {
      id,
      category: { slug: 'physical', kind: 'SERVICE', deletedAt: null },
    },
    include: {
      providerCategory: { select: { id: true, name: true } },
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
  const plan = product.plans[0]
  const rawFeatures = plan?.features
  const features =
    rawFeatures &&
    typeof rawFeatures === 'object' &&
    !Array.isArray(rawFeatures)
      ? (rawFeatures as Record<string, unknown>)
      : {}
  const numeric = (key: string) =>
    typeof features[key] === 'number' ? (features[key] as number) : 0
  return {
    id: product.id,
    code: product.code,
    slug: product.slug,
    name: product.name,
    description: product.description ?? '',
    content: product.content,
    status: product.status,
    providerCategory: product.providerCategory,
    featured: metadata.featured === true,
    displayOrder:
      typeof metadata.displayOrder === 'number' ? metadata.displayOrder : 0,
    imageUrl: typeof metadata.imageUrl === 'string' ? metadata.imageUrl : null,
    defaultPrice:
      typeof metadata.defaultPrice === 'number' ? metadata.defaultPrice : 0,
    billingPrices: Array.isArray(metadata.billingPrices)
      ? metadata.billingPrices
      : [],
    features: {
      cpuModel: typeof features.cpuModel === 'string' ? features.cpuModel : '',
      cpuCores: numeric('cpuCores'),
      ramGb: numeric('ramGb'),
      storageGb: numeric('storageGb'),
      storageType:
        typeof features.storageType === 'string' ? features.storageType : '',
      bandwidthMbps: numeric('bandwidthMbps'),
      ipCount: numeric('ipCount'),
      location: typeof features.location === 'string' ? features.location : '',
    },
    prices: (plan?.prices ?? []).map((price) => ({
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

export function updatePhysicalPackageRecord(input: UpdatePhysicalPackageInput) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findFirst({
      where: {
        id: input.id,
        category: { slug: 'physical', kind: 'SERVICE', deletedAt: null },
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
    const metadata = {
      featured: input.featured,
      displayOrder: input.displayOrder,
      imageUrl: input.imageUrl,
      defaultPrice: input.defaultPrice,
      billingPrices: input.billingPrices,
    }
    for (const [metaKey, metaValue] of Object.entries(metadata)) {
      if (metaValue === null) {
        await tx.productMeta.deleteMany({
          where: { productId: product.id, metaKey },
        })
        continue
      }
      const value = metaValue as Prisma.InputJsonValue
      const valueType = Array.isArray(metaValue) ? 'array' : typeof metaValue
      await tx.productMeta.upsert({
        where: { productId_metaKey: { productId: product.id, metaKey } },
        update: { metaValue: value, valueType },
        create: {
          id: createId(),
          productId: product.id,
          metaKey,
          metaValue: value,
          valueType,
          isPublic: metaKey !== 'billingPrices',
        },
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
            features: physicalFeatures(input),
          },
        })
      : await tx.plan.create({
          data: {
            id: createId(),
            productId: product.id,
            code: `${product.code}-PLAN`,
            name: input.name,
            status: input.status,
            features: physicalFeatures(input),
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
