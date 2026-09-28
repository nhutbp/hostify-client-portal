import { prisma } from '../../../db/prisma'
import { createId } from '../../../common/id.server'
import type { Prisma } from '../../../../prisma/generated/client.js'
import type {
  CreateViaPackageInput,
  ListViaPackagesInput,
  UpdateViaPackageInput,
} from './via.schemas'

type ViaInput = CreateViaPackageInput | UpdateViaPackageInput
function viaFeatures(input: ViaInput) {
  return {
    platform: input.platform,
    country: input.country,
    accountType: input.accountType,
    accountAge: input.accountAge,
    verification: input.verification,
    twoFactor: input.twoFactor,
    changeLimit: input.changeLimit,
    deliveryMethod: input.deliveryMethod,
    warrantyDays: input.warrantyDays,
    originalEmail: input.originalEmail,
    originalPhone: input.originalPhone,
    birthday: input.birthday,
    loginBrowser: input.loginBrowser,
    backupCookie: input.backupCookie,
    usageGuide: input.usageGuide,
  }
}
function viaMetas(input: ViaInput) {
  return [
    {
      metaKey: 'defaultPrice',
      metaValue: input.defaultPrice as Prisma.InputJsonValue,
      valueType: 'number',
      isPublic: true,
    },
    {
      metaKey: 'quantityPrices',
      metaValue: input.quantityPrices as Prisma.InputJsonValue,
      valueType: 'array',
      isPublic: true,
    },
  ]
}

export async function listViaPackageRecords(input: ListViaPackagesInput) {
  const where: Prisma.ProductWhereInput = {
    category: { slug: 'via', kind: 'SERVICE', deletedAt: null },
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
              where: { effectiveTo: null, billingCycle: 'ONE_TIME' },
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
        platform:
          typeof features.platform === 'string' ? features.platform : '',
        country: typeof features.country === 'string' ? features.country : '',
        accountType:
          typeof features.accountType === 'string' ? features.accountType : '',
        verification:
          typeof features.verification === 'string'
            ? features.verification
            : '',
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

export function getViaCreationReferences(providerCategoryId: string) {
  return Promise.all([
    prisma.productCategory.findFirst({
      where: { slug: 'via', kind: 'SERVICE', deletedAt: null },
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

export function createViaPackageRecord(
  input: CreateViaPackageInput,
  categoryId: string,
) {
  return prisma.$transaction(async (tx) => {
    const id = createId()
    const code = `VIA-${id.toUpperCase()}`
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
          create: viaMetas(input).map((meta) => ({ id: createId(), ...meta })),
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
        features: viaFeatures(input),
      },
    })
    await tx.price.create({
      data: {
        id: createId(),
        planId: plan.id,
        currency: 'VND',
        billingCycle: 'ONE_TIME',
        amountMinor: BigInt(input.defaultPrice),
        setupFeeMinor: BigInt(0),
        effectiveFrom: new Date(),
        status: input.status,
      },
    })
    return { id, slug: input.slug }
  })
}

export async function getViaPackageRecord(id: string) {
  const product = await prisma.product.findFirst({
    where: { id, category: { slug: 'via', kind: 'SERVICE', deletedAt: null } },
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
  const f =
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
    quantityPrices: Array.isArray(metadata.quantityPrices)
      ? metadata.quantityPrices
      : [],
    features: {
      platform: typeof f.platform === 'string' ? f.platform : 'FACEBOOK',
      country: typeof f.country === 'string' ? f.country : 'US',
      accountType: typeof f.accountType === 'string' ? f.accountType : 'VIA',
      accountAge: typeof f.accountAge === 'string' ? f.accountAge : 'NEW',
      verification:
        typeof f.verification === 'string' ? f.verification : 'UNVERIFIED',
      twoFactor: f.twoFactor === true,
      changeLimit:
        typeof f.changeLimit === 'string' ? f.changeLimit : 'UNLIMITED',
      deliveryMethod:
        typeof f.deliveryMethod === 'string'
          ? f.deliveryMethod
          : 'ACCOUNT_PASSWORD',
      warrantyDays: typeof f.warrantyDays === 'number' ? f.warrantyDays : 0,
      originalEmail: f.originalEmail === true,
      originalPhone: f.originalPhone === true,
      birthday: f.birthday === true,
      loginBrowser: f.loginBrowser === true,
      backupCookie: f.backupCookie === true,
      usageGuide: f.usageGuide === true,
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

export function updateViaPackageRecord(input: UpdateViaPackageInput) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findFirst({
      where: {
        id: input.id,
        category: { slug: 'via', kind: 'SERVICE', deletedAt: null },
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
    for (const meta of viaMetas(input))
      await tx.productMeta.upsert({
        where: {
          productId_metaKey: { productId: product.id, metaKey: meta.metaKey },
        },
        update: { metaValue: meta.metaValue, valueType: meta.valueType },
        create: { id: createId(), productId: product.id, ...meta },
      })
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
            features: viaFeatures(input),
          },
        })
      : await tx.plan.create({
          data: {
            id: createId(),
            productId: product.id,
            code: `${product.code}-PLAN`,
            name: input.name,
            status: input.status,
            features: viaFeatures(input),
          },
        })
    await tx.price.updateMany({
      where: { planId: plan.id, effectiveTo: null },
      data: { effectiveTo: now },
    })
    await tx.price.create({
      data: {
        id: createId(),
        planId: plan.id,
        currency: 'VND',
        billingCycle: 'ONE_TIME',
        amountMinor: BigInt(input.defaultPrice),
        setupFeeMinor: BigInt(0),
        effectiveFrom: now,
        status: input.status,
      },
    })
    return { id: product.id, slug: input.slug }
  })
}
